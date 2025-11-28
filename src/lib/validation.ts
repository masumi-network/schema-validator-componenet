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
    // Try to extract line number from error message
    const match = e.message.match(/at position (\d+)/);
    let line;
    if (match) {
      const pos = parseInt(match[1], 10);
      line = input.slice(0, pos).split('\n').length;
    }
    return {
      valid: false,
      errors: [{ message: 'Invalid JSON: ' + e.message, line }],
    };
  }

  const errors: { message: string; line?: number }[] = [];
  const schemas: JobInputSchemaType[] = [];

  // Helper to get line number for a key
  const getLine = (key: string) => {
    const idx = input.indexOf('"' + key + '"');
    if (idx === -1) return undefined;
    return input.slice(0, idx).split('\n').length;
  };

  // Handle wrapped format, single schema, and array of schemas
  let schemasToValidate: any[];
  if (parsed.input_data && Array.isArray(parsed.input_data)) {
    // Handle wrapped format: { "input_data": [...] }
    schemasToValidate = parsed.input_data;
  } else if (Array.isArray(parsed)) {
    // Handle array format: [...]
    schemasToValidate = parsed;
  } else {
    // Handle single schema format: { ... }
    schemasToValidate = [parsed];
  }

  schemasToValidate.forEach((schema: any, index: number) => {
    try {
      const validatedSchema = jobInputSchema.parse(schema);
      schemas.push(validatedSchema);
    } catch (zodError: any) {
      if (zodError.errors) {
        zodError.errors.forEach((error: any) => {
          errors.push({
            message: `Schema ${index + 1}: ${error.message}`,
            line: getLine(error.path?.[0] || ''),
          });
        });
      } else {
        errors.push({
          message: `Schema ${index + 1}: ${zodError.message}`,
          line: getLine('type'),
        });
      }
    }
  });

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    parsedSchemas: schemas,
  };
}

