// This file contains the extracted validation logic.
// Note: It relies on jobInputSchema which is not yet provided, so we will need to update imports.

import { jobInputSchema, JobInputSchemaType } from './job-input-schema';

export type { JobInputSchemaType };

export interface ValidationResult {
  valid: boolean;
  errors: { message: string; line?: number }[];
  parsedSchemas?: JobInputSchemaType[];
}

/**
 * Validates a JSON string against the Job Input Schema.
 * Tries to provide line numbers for errors where possible.
 */
export function validateSchemaWithZod(input: string): ValidationResult {
  let parsed: any;
  try {
    parsed = JSON.parse(input);
  } catch (e: any) {
    const line = extractLineFromJsonError(e.message, input);
    return {
      valid: false,
      errors: [{ message: 'Invalid JSON: ' + e.message, line }],
    };
  }

  const errors: { message: string; line?: number }[] = [];
  const schemas: JobInputSchemaType[] = [];
  const schemasToValidate = extractSchemasToValidate(parsed);

  schemasToValidate.forEach((schema: any, index: number) => {
    const normalizedSchema = normalizeSchemaForValidation(schema);

    // Pre-validation checks for common mistakes
    const preValidationError = validateValidationsField(normalizedSchema, index, input);
    if (preValidationError) {
      errors.push(preValidationError);
      return; // Skip Zod validation for this schema
    }

    // Validate with Zod
    try {
      const validatedSchema = jobInputSchema.parse(normalizedSchema);
      schemas.push(validatedSchema);
    } catch (zodError: any) {
      const zodErrors = extractZodErrors(zodError, normalizedSchema, index, input);
      errors.push(...zodErrors);
    }
  });

  return buildValidationResult(errors, schemas, schemasToValidate);
}

/**
 * Extracts line number from JSON parse error message
 */
function extractLineFromJsonError(errorMessage: string, input: string): number | undefined {
  const match = errorMessage.match(/at position (\d+)/);
  if (!match) return undefined;
  
  const pos = parseInt(match[1], 10);
  return input.slice(0, pos).split('\n').length;
}

/**
 * Extracts schemas to validate from parsed JSON
 * Handles wrapped format, single schema, and array of schemas
 */
function extractSchemasToValidate(parsed: any): any[] {
  if (parsed.input_data && Array.isArray(parsed.input_data)) {
    return parsed.input_data; // Wrapped format: { "input_data": [...] }
  }
  if (Array.isArray(parsed)) {
    return parsed; // Array format: [...]
  }
  return [parsed]; // Single schema format: { ... }
}

/**
 * Normalizes schema variants that appear in real-world payloads but are semantically
 * equivalent to omission in MIP-003 (e.g. "validations": null).
 */
function normalizeSchemaForValidation(schema: any): any {
  if (!schema || typeof schema !== 'object') {
    return schema;
  }

  if (schema.validations === null) {
    const normalized = { ...schema };
    delete normalized.validations;
    return normalized;
  }

  return schema;
}

/**
 * Validates the validations field structure before Zod validation
 */
function validateValidationsField(
  schema: any,
  index: number,
  input: string
): { message: string; line?: number } | null {
  if (!schema || typeof schema !== 'object') {
    return null;
  }

  const validations = schema.validations;
  
  // If validations is undefined or already an array, it's valid
  if (validations === undefined || Array.isArray(validations)) {
    return null;
  }

  // Check if it's an object (common mistake)
  if (typeof validations === 'object' && !Array.isArray(validations)) {
    return handleValidationsObjectError(schema, validations, index, input);
  }

  // Otherwise, it's an invalid type
  return {
    message: `Schema ${index + 1} (field: "${schema.id || 'unknown'}"): Field "validations" must be an array or omitted. ` +
      `Found: ${typeof validations}. ` +
      `Example: [{"validation": "optional"}] or omit the field entirely.`,
    line: getValidationsLine(schema, input),
  };
}

/**
 * Handles the case where validations is an object instead of an array
 */
function handleValidationsObjectError(
  schema: any,
  validations: any,
  index: number,
  input: string
): { message: string; line?: number } | null {
  const keys = Object.keys(validations);
  const validKeys = ['optional', 'min', 'max', 'format', 'accept'];
  
  if (!keys.some(key => validKeys.includes(key))) {
    return null; // Not a validation-related object, let Zod handle it
  }

  const firstKey = keys[0];
  const value = validations[firstKey];
  const correctFormat = formatCorrectValidationsArray(firstKey, value);

  return {
    message: `Schema ${index + 1} (field: "${schema.id || 'unknown'}"): Field "validations" must be an array, not an object. ` +
      `Found: ${JSON.stringify(validations)}. ` +
      `Correct format: ${correctFormat}`,
    line: getValidationsLine(schema, input),
  };
}

/**
 * Formats the correct validations array format for error messages
 */
function formatCorrectValidationsArray(key: string, value: any): string {
  if (key === 'optional') {
    const isTrue = value === true || value === 'true';
    return isTrue 
      ? `[{"validation": "optional"}]` 
      : `[{"validation": "optional", "value": "${value}"}]`;
  }
  return `[{"validation": "${key}", "value": "${value}"}]`;
}

/**
 * Extracts and formats errors from Zod validation
 */
function extractZodErrors(
  zodError: any,
  schema: any,
  index: number,
  input: string
): { message: string; line?: number }[] {
  if (!zodError.errors) {
    return [{
      message: `Schema ${index + 1}: ${zodError.message}`,
      line: getLine('type', input),
    }];
  }

  return zodError.errors.map((error: any) => {
    const fieldPath = error.path?.join('.') || '';
    const fieldName = fieldPath || error.path?.[0] || 'unknown';
    const errorMessage = enhanceZodErrorMessage(error, fieldName, schema);
    
    return {
      message: `Schema ${index + 1}: ${errorMessage}`,
      line: getLine(error.path?.[0] || '', input),
    };
  });
}

/**
 * Enhances Zod error messages with more context
 */
function enhanceZodErrorMessage(error: any, fieldName: string, schema: any): string {
  switch (error.code) {
    case 'invalid_type':
      return handleInvalidTypeError(error, fieldName, schema);
    
    case 'invalid_enum_value':
      const options = error.options?.join(', ') || 'unknown options';
      return `Field "${fieldName}" has invalid value "${error.received}". Must be one of: ${options}.`;
    
    case 'too_small':
      return handleTooSmallError(error, fieldName);
    
    case 'invalid_string':
      return `Field "${fieldName}" ${error.message.toLowerCase()}.`;
    
    case 'invalid_union':
      return `Field "${fieldName}" ${error.message}. Check that the structure matches the expected format.`;
    
    default:
      return error.message;
  }
}

/**
 * Handles invalid_type Zod errors
 */
function handleInvalidTypeError(error: any, fieldName: string, schema: any): string {
  if (error.received === 'null') {
    return `Field "${fieldName}" cannot be null. Use an empty array [] or omit the field instead.`;
  }

  if (error.expected === 'array' && error.received === 'object') {
    if (fieldName === 'validations') {
      return `Field "validations" must be an array of validation objects, not a plain object. ` +
        `Example: [{"validation": "optional"}] or [{"validation": "min", "value": "5"}]. ` +
        `Found: ${JSON.stringify(schema.validations)}`;
    }
  }

  return `Field "${fieldName}" has invalid type. Expected ${error.expected}, but received ${error.received}.`;
}

/**
 * Handles too_small Zod errors
 */
function handleTooSmallError(error: any, fieldName: string): string {
  if (error.type === 'array') {
    return `Field "${fieldName}" array must have at least ${error.minimum} element(s).`;
  }
  return `Field "${fieldName}" must be at least ${error.minimum} character(s) long.`;
}

/**
 * Builds the final validation result
 */
function buildValidationResult(
  errors: { message: string; line?: number }[],
  schemas: JobInputSchemaType[],
  schemasToValidate: any[]
): ValidationResult {
  if (errors.length > 0) {
    return {
      valid: false,
      errors,
      parsedSchemas: schemas.length > 0 ? schemas : undefined,
    };
  }

  if (schemasToValidate.length > 0 && schemas.length < schemasToValidate.length) {
    return {
      valid: false,
      errors: [{ message: 'Some schemas could not be validated. Please check the structure.' }],
      parsedSchemas: schemas.length > 0 ? schemas : undefined,
    };
  }

  return {
    valid: true,
    errors: [],
    parsedSchemas: schemas,
  };
}

/**
 * Helper to get line number for a key in the input
 */
function getLine(key: string, input: string): number | undefined {
  if (!key) return undefined;
  
  const searchKey = '"' + key + '"';
  const idx = input.indexOf(searchKey);
  if (idx === -1) return undefined;
  
  return input.slice(0, idx).split('\n').length;
}

/**
 * Helper to get line number for validations field in a specific schema
 */
function getValidationsLine(schema: any, input: string): number | undefined {
  const schemaId = schema.id || '';
  if (!schemaId) {
    return getLine('validations', input);
  }

  const idPattern = '"id":\\s*"' + schemaId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"';
  const idMatch = input.match(new RegExp(idPattern));
  
  if (!idMatch || idMatch.index === undefined) {
    return getLine('validations', input);
  }

  // Look for "validations" after this id
  const afterId = input.substring(idMatch.index);
  const validationsMatch = afterId.match(/"validations"\s*:/);
  
  if (!validationsMatch || validationsMatch.index === undefined) {
    return getLine('validations', input);
  }

  const absolutePos = idMatch.index + validationsMatch.index;
  return input.slice(0, absolutePos).split('\n').length;
}
