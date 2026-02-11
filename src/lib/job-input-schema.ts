import { z } from 'zod';

// Enums matching MIP-003 Attachment 01 specification
export enum ValidJobInputTypes {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  OPTION = 'option',
  FILE = 'file',
  NONE = 'none',
  EMAIL = 'email',
  PASSWORD = 'password',
  TEL = 'tel',
  URL = 'url',
  DATE = 'date',
  DATETIME_LOCAL = 'datetime-local',
  TIME = 'time',
  MONTH = 'month',
  WEEK = 'week',
  COLOR = 'color',
  RANGE = 'range',
  HIDDEN = 'hidden',
  SEARCH = 'search',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
}

export enum ValidJobInputValidationTypes {
  MIN = 'min',
  MAX = 'max',
  FORMAT = 'format',
  OPTIONAL = 'optional',
  ACCEPT = 'accept',
}

export enum ValidJobInputFormatValues {
  URL = 'url',
  EMAIL = 'email',
  INTEGER = 'integer',
  NON_EMPTY = 'nonempty',
  TEL_PATTERN = 'tel-pattern',
}

// Validation schemas
// According to MIP spec, validation values are strings
export const optionalValidationSchema = z.object({
  validation: z.enum([ValidJobInputValidationTypes.OPTIONAL]),
  value: z.union([z.string(), z.boolean()]).optional(),
});

export const minValidationSchema = z.object({
  validation: z.enum([ValidJobInputValidationTypes.MIN]),
  value: z.string(),
});

export const maxValidationSchema = z.object({
  validation: z.enum([ValidJobInputValidationTypes.MAX]),
  value: z.string(),
});

export const formatUrlValidationSchema = z.object({
  validation: z.enum([ValidJobInputValidationTypes.FORMAT]),
  value: z.enum([ValidJobInputFormatValues.URL]),
});

export const formatEmailValidationSchema = z.object({
  validation: z.enum([ValidJobInputValidationTypes.FORMAT]),
  value: z.enum([ValidJobInputFormatValues.EMAIL]),
});

export const formatIntegerValidationSchema = z.object({
  validation: z.enum([ValidJobInputValidationTypes.FORMAT]),
  value: z.enum([ValidJobInputFormatValues.INTEGER]),
});

export const formatNonEmptyValidationSchema = z.object({
  validation: z.enum([ValidJobInputValidationTypes.FORMAT]),
  value: z.enum([ValidJobInputFormatValues.NON_EMPTY]),
});

export const formatTelPatternValidationSchema = z.object({
  validation: z.enum([ValidJobInputValidationTypes.FORMAT]),
  value: z.enum([ValidJobInputFormatValues.TEL_PATTERN]),
});

export const acceptValidationSchema = z.object({
  validation: z.enum([ValidJobInputValidationTypes.ACCEPT]),
  value: z.string(),
});

// Job input schemas
export const jobInputTextSchema = z.object({
  id: z.string().min(1),
  type: z.enum([ValidJobInputTypes.TEXT]),
  name: z.string().min(1),
  data: z
    .object({
      placeholder: z.string().optional(),
      description: z.string().optional(),
      default: z.string().optional(),
    })
    .optional(),
  validations: z
    .array(
      optionalValidationSchema
        .or(minValidationSchema)
        .or(maxValidationSchema)
        .or(formatNonEmptyValidationSchema)
        .or(formatUrlValidationSchema)
        .or(formatEmailValidationSchema),
    )
    .optional(),
});

export const jobInputTextareaSchema = z.object({
  id: z.string().min(1),
  type: z.enum([ValidJobInputTypes.TEXTAREA]),
  name: z.string().min(1),
  data: z
    .object({
      placeholder: z.string().optional(),
      description: z.string().optional(),
      default: z.string().optional(),
    })
    .optional(),
  validations: z
    .array(
      optionalValidationSchema
        .or(minValidationSchema)
        .or(maxValidationSchema)
        .or(formatNonEmptyValidationSchema),
    )
    .optional(),
});

export const jobInputNumberSchema = z.object({
  id: z.string().min(1),
  type: z.enum([ValidJobInputTypes.NUMBER]),
  name: z.string().min(1),
  data: z
    .object({
      placeholder: z.string().optional(),
      description: z.string().optional(),
      default: z.union([z.string(), z.number()]).optional(),
    })
    .optional(),
  validations: z
    .array(
      optionalValidationSchema
        .or(minValidationSchema)
        .or(maxValidationSchema)
        .or(formatIntegerValidationSchema),
    )
    .optional(),
});

export const jobInputBooleanSchema = z.object({
  id: z.string().min(1),
  type: z.enum([ValidJobInputTypes.BOOLEAN]),
  name: z.string().min(1),
  data: z
    .object({
      description: z.string().optional(),
      default: z.boolean().optional(),
    })
    .optional(),
  validations: z.array(optionalValidationSchema).optional(),
});

export const jobInputOptionSchema = z.object({
  id: z.string().min(1),
  type: z.enum([ValidJobInputTypes.OPTION]),
  name: z.string().min(1),
  data: z.object({
    values: z.array(z.string().min(1)).min(1),
    description: z.string().optional(),
  }),
  validations: z
    .array(
      optionalValidationSchema.or(minValidationSchema).or(maxValidationSchema),
    )
    .optional(),
});

export const jobInputFileSchema = z.object({
  id: z.string().min(1),
  type: z.enum([ValidJobInputTypes.FILE]),
  name: z.string().min(1),
  data: z.object({
    description: z.string().optional(),
    outputFormat: z.literal('url'),
  }),
  validations: z
    .array(
      optionalValidationSchema.or(acceptValidationSchema).or(minValidationSchema).or(maxValidationSchema),
    )
    .optional(),
});

export const jobInputNoneSchema = z.object({
  id: z.string().min(1),
  type: z.enum([ValidJobInputTypes.NONE]),
  name: z.string().min(1),
  data: z
    .object({
      description: z.string().min(1).optional(),
    })
    .optional(),
});

// New input type schemas per MIP spec
export const jobInputEmailSchema = z.object({
  id: z.string().min(1),
  type: z.enum([ValidJobInputTypes.EMAIL]),
  name: z.string().min(1),
  data: z
    .object({
      placeholder: z.string().optional(),
      description: z.string().optional(),
      default: z.string().optional(),
    })
    .optional(),
  validations: z
    .array(
      optionalValidationSchema
        .or(minValidationSchema)
        .or(maxValidationSchema)
        .or(formatEmailValidationSchema),
    )
    .optional(),
});

export const jobInputPasswordSchema = z.object({
  id: z.string().min(1),
  type: z.enum([ValidJobInputTypes.PASSWORD]),
  name: z.string().min(1),
  data: z
    .object({
      placeholder: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
  validations: z
    .array(
      optionalValidationSchema.or(minValidationSchema).or(maxValidationSchema),
    )
    .optional(),
});

export const jobInputTelSchema = z.object({
  id: z.string().min(1),
  type: z.enum([ValidJobInputTypes.TEL]),
  name: z.string().min(1),
  data: z
    .object({
      placeholder: z.string().optional(),
      description: z.string().optional(),
      default: z.string().optional(),
    })
    .optional(),
  validations: z
    .array(
      optionalValidationSchema
        .or(minValidationSchema)
        .or(maxValidationSchema)
        .or(formatTelPatternValidationSchema),
    )
    .optional(),
});

export const jobInputUrlSchema = z.object({
  id: z.string().min(1),
  type: z.enum([ValidJobInputTypes.URL]),
  name: z.string().min(1),
  data: z
    .object({
      placeholder: z.string().optional(),
      description: z.string().optional(),
      default: z.string().optional(),
    })
    .optional(),
  validations: z
    .array(
      optionalValidationSchema
        .or(minValidationSchema)
        .or(maxValidationSchema)
        .or(formatUrlValidationSchema),
    )
    .optional(),
});

export const jobInputDateSchema = z.object({
  id: z.string().min(1),
  type: z.enum([ValidJobInputTypes.DATE]),
  name: z.string().min(1),
  data: z
    .object({
      description: z.string().optional(),
      default: z.string().optional(),
    })
    .optional(),
  validations: z
    .array(
      optionalValidationSchema.or(minValidationSchema).or(maxValidationSchema),
    )
    .optional(),
});

export const jobInputDatetimeLocalSchema = z.object({
  id: z.string().min(1),
  type: z.enum([ValidJobInputTypes.DATETIME_LOCAL]),
  name: z.string().min(1),
  data: z
    .object({
      description: z.string().optional(),
      default: z.string().optional(),
    })
    .optional(),
  validations: z
    .array(
      optionalValidationSchema.or(minValidationSchema).or(maxValidationSchema),
    )
    .optional(),
});

export const jobInputTimeSchema = z.object({
  id: z.string().min(1),
  type: z.enum([ValidJobInputTypes.TIME]),
  name: z.string().min(1),
  data: z
    .object({
      description: z.string().optional(),
      default: z.string().optional(),
    })
    .optional(),
  validations: z
    .array(
      optionalValidationSchema.or(minValidationSchema).or(maxValidationSchema),
    )
    .optional(),
});

export const jobInputMonthSchema = z.object({
  id: z.string().min(1),
  type: z.enum([ValidJobInputTypes.MONTH]),
  name: z.string().min(1),
  data: z
    .object({
      description: z.string().optional(),
      default: z.string().optional(),
    })
    .optional(),
  validations: z
    .array(
      optionalValidationSchema.or(minValidationSchema).or(maxValidationSchema),
    )
    .optional(),
});

export const jobInputWeekSchema = z.object({
  id: z.string().min(1),
  type: z.enum([ValidJobInputTypes.WEEK]),
  name: z.string().min(1),
  data: z
    .object({
      description: z.string().optional(),
      default: z.string().optional(),
    })
    .optional(),
  validations: z
    .array(
      optionalValidationSchema.or(minValidationSchema).or(maxValidationSchema),
    )
    .optional(),
});

export const jobInputColorSchema = z.object({
  id: z.string().min(1),
  type: z.enum([ValidJobInputTypes.COLOR]),
  name: z.string().min(1),
  data: z
    .object({
      description: z.string().optional(),
      default: z.string().optional(),
    })
    .optional(),
  validations: z.array(optionalValidationSchema).optional(),
});

export const jobInputRangeSchema = z.object({
  id: z.string().min(1),
  type: z.enum([ValidJobInputTypes.RANGE]),
  name: z.string().min(1),
  data: z.object({
    min: z.union([z.string(), z.number()]).optional(),
    max: z.union([z.string(), z.number()]).optional(),
    step: z.union([z.string(), z.number()]).optional(),
    description: z.string().optional(),
    default: z.union([z.string(), z.number()]).optional(),
  }),
  validations: z
    .array(
      optionalValidationSchema.or(minValidationSchema).or(maxValidationSchema),
    )
    .optional(),
});

export const jobInputHiddenSchema = z.object({
  id: z.string().min(1),
  type: z.enum([ValidJobInputTypes.HIDDEN]),
  name: z.string().min(1),
  data: z.object({
    value: z.string().min(1), // Required according to MIP spec
  }),
});

export const jobInputSearchSchema = z.object({
  id: z.string().min(1),
  type: z.enum([ValidJobInputTypes.SEARCH]),
  name: z.string().min(1),
  data: z
    .object({
      placeholder: z.string().optional(),
      description: z.string().optional(),
      default: z.string().optional(),
    })
    .optional(),
  validations: z
    .array(
      optionalValidationSchema
        .or(minValidationSchema)
        .or(maxValidationSchema)
        .or(formatNonEmptyValidationSchema),
    )
    .optional(),
});

export const jobInputCheckboxSchema = z.object({
  id: z.string().min(1),
  type: z.enum([ValidJobInputTypes.CHECKBOX]),
  name: z.string().min(1),
  data: z
    .object({
      description: z.string().optional(),
      default: z.boolean().optional(),
    })
    .optional(),
  validations: z.array(optionalValidationSchema).optional(),
});

export const jobInputRadioSchema = z.object({
  id: z.string().min(1),
  type: z.enum([ValidJobInputTypes.RADIO]),
  name: z.string().min(1),
  data: z.object({
    values: z.array(z.string().min(1)).min(1), // Required
    default: z.string().optional(),
    description: z.string().optional(),
  }),
  validations: z
    .array(
      optionalValidationSchema.or(minValidationSchema).or(maxValidationSchema),
    )
    .optional(),
});

// Union schema for all job input types
export const jobInputSchema = jobInputTextSchema
  .or(jobInputTextareaSchema)
  .or(jobInputNumberSchema)
  .or(jobInputBooleanSchema)
  .or(jobInputOptionSchema)
  .or(jobInputFileSchema)
  .or(jobInputNoneSchema)
  .or(jobInputEmailSchema)
  .or(jobInputPasswordSchema)
  .or(jobInputTelSchema)
  .or(jobInputUrlSchema)
  .or(jobInputDateSchema)
  .or(jobInputDatetimeLocalSchema)
  .or(jobInputTimeSchema)
  .or(jobInputMonthSchema)
  .or(jobInputWeekSchema)
  .or(jobInputColorSchema)
  .or(jobInputRangeSchema)
  .or(jobInputHiddenSchema)
  .or(jobInputSearchSchema)
  .or(jobInputCheckboxSchema)
  .or(jobInputRadioSchema);

export type JobInputSchemaType = z.infer<typeof jobInputSchema>;
export type JobInputTextSchemaType = z.infer<typeof jobInputTextSchema>;
export type JobInputTextareaSchemaType = z.infer<typeof jobInputTextareaSchema>;
export type JobInputNumberSchemaType = z.infer<typeof jobInputNumberSchema>;
export type JobInputBooleanSchemaType = z.infer<typeof jobInputBooleanSchema>;
export type JobInputOptionSchemaType = z.infer<typeof jobInputOptionSchema>;
export type JobInputFileSchemaType = z.infer<typeof jobInputFileSchema>;
export type JobInputNoneSchemaType = z.infer<typeof jobInputNoneSchema>;
export type JobInputEmailSchemaType = z.infer<typeof jobInputEmailSchema>;
export type JobInputPasswordSchemaType = z.infer<typeof jobInputPasswordSchema>;
export type JobInputTelSchemaType = z.infer<typeof jobInputTelSchema>;
export type JobInputUrlSchemaType = z.infer<typeof jobInputUrlSchema>;
export type JobInputDateSchemaType = z.infer<typeof jobInputDateSchema>;
export type JobInputDatetimeLocalSchemaType = z.infer<typeof jobInputDatetimeLocalSchema>;
export type JobInputTimeSchemaType = z.infer<typeof jobInputTimeSchema>;
export type JobInputMonthSchemaType = z.infer<typeof jobInputMonthSchema>;
export type JobInputWeekSchemaType = z.infer<typeof jobInputWeekSchema>;
export type JobInputColorSchemaType = z.infer<typeof jobInputColorSchema>;
export type JobInputRangeSchemaType = z.infer<typeof jobInputRangeSchema>;
export type JobInputHiddenSchemaType = z.infer<typeof jobInputHiddenSchema>;
export type JobInputSearchSchemaType = z.infer<typeof jobInputSearchSchema>;
export type JobInputCheckboxSchemaType = z.infer<typeof jobInputCheckboxSchema>;
export type JobInputRadioSchemaType = z.infer<typeof jobInputRadioSchema>;

// Form schema generation (based on sokosumi's approach)
export const makeZodSchemaFromJobInputSchema = (
  jobInputSchema: JobInputSchemaType,
) => {
  switch (jobInputSchema.type) {
    case ValidJobInputTypes.TEXT:
      return makeZodSchemaFromJobInputTextSchema(jobInputSchema);
    case ValidJobInputTypes.TEXTAREA:
      return makeZodSchemaFromJobInputTextareaSchema(jobInputSchema);
    case ValidJobInputTypes.NUMBER:
      return makeZodSchemaFromJobInputNumberSchema(jobInputSchema);
    case ValidJobInputTypes.BOOLEAN:
      return makeZodSchemaFromJobInputBooleanSchema();
    case ValidJobInputTypes.OPTION:
      return makeZodSchemaFromJobInputOptionSchema(jobInputSchema);
    case ValidJobInputTypes.FILE:
      return makeZodSchemaFromJobInputFileSchema(jobInputSchema);
    case ValidJobInputTypes.NONE:
      return z.never().nullable();
    case ValidJobInputTypes.EMAIL:
      return makeZodSchemaFromJobInputEmailSchema(jobInputSchema);
    case ValidJobInputTypes.PASSWORD:
      return makeZodSchemaFromJobInputPasswordSchema(jobInputSchema);
    case ValidJobInputTypes.TEL:
      return makeZodSchemaFromJobInputTelSchema(jobInputSchema);
    case ValidJobInputTypes.URL:
      return makeZodSchemaFromJobInputUrlSchema(jobInputSchema);
    case ValidJobInputTypes.DATE:
    case ValidJobInputTypes.DATETIME_LOCAL:
    case ValidJobInputTypes.TIME:
    case ValidJobInputTypes.MONTH:
    case ValidJobInputTypes.WEEK:
      return makeZodSchemaFromJobInputDateSchema(jobInputSchema);
    case ValidJobInputTypes.COLOR:
      return makeZodSchemaFromJobInputColorSchema(jobInputSchema);
    case ValidJobInputTypes.RANGE:
      return makeZodSchemaFromJobInputRangeSchema(jobInputSchema);
    case ValidJobInputTypes.HIDDEN:
      return makeZodSchemaFromJobInputHiddenSchema(jobInputSchema);
    case ValidJobInputTypes.SEARCH:
      return makeZodSchemaFromJobInputSearchSchema(jobInputSchema);
    case ValidJobInputTypes.CHECKBOX:
      return makeZodSchemaFromJobInputCheckboxSchema();
    case ValidJobInputTypes.RADIO:
      return makeZodSchemaFromJobInputRadioSchema(jobInputSchema);
  }
};

// Helper to parse string validation value to number
const parseValidationValue = (value: string | boolean | undefined): number => {
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// Helper to check if optional
// According to MIP spec, the presence of "optional" validation makes the field optional
// The value field is optional and doesn't affect whether the field is optional
// If validation type is "optional", the field is always optional regardless of value
const isOptionalValidation = (_value: string | boolean | undefined): boolean => {
  // The presence of the optional validation itself makes it optional
  // Value is ignored - if the validation exists, the field is optional
  return true;
};

const makeZodSchemaFromJobInputTextSchema = (
  jobInputTextSchema: JobInputTextSchemaType,
) => {
  const { validations } = jobInputTextSchema;
  const defaultSchema = z.string();
  if (!validations) return defaultSchema;

  let canBeOptional: boolean = false;
  const schema = validations.reduce((acc, cur) => {
    const { validation, value } = cur;
    switch (validation) {
      case ValidJobInputValidationTypes.MIN:
        return acc.min(parseValidationValue(value as string));
      case ValidJobInputValidationTypes.MAX:
        return acc.max(parseValidationValue(value as string));
      case ValidJobInputValidationTypes.FORMAT:
        switch (value) {
          case ValidJobInputFormatValues.URL:
            return acc.url();
          case ValidJobInputFormatValues.EMAIL:
            return acc.email();
          case ValidJobInputFormatValues.NON_EMPTY:
            return acc.min(1);
          default:
            return acc;
        }
      case ValidJobInputValidationTypes.OPTIONAL:
        canBeOptional = isOptionalValidation(value);
        return acc;
      default:
        return acc;
    }
  }, defaultSchema);

  return canBeOptional ? schema.optional() : schema;
};

const makeZodSchemaFromJobInputTextareaSchema = (
  jobInputTextareaSchema: JobInputTextareaSchemaType,
) => {
  const { validations } = jobInputTextareaSchema;
  const defaultSchema = z.string();
  if (!validations) return defaultSchema;

  let canBeOptional: boolean = false;
  const schema = validations.reduce((acc, cur) => {
    const { validation, value } = cur;
    switch (validation) {
      case ValidJobInputValidationTypes.MIN:
        return acc.min(parseValidationValue(value as string));
      case ValidJobInputValidationTypes.MAX:
        return acc.max(parseValidationValue(value as string));
      case ValidJobInputValidationTypes.FORMAT:
        switch (value) {
          case ValidJobInputFormatValues.NON_EMPTY:
            return acc.min(1);
          default:
            return acc;
        }
      case ValidJobInputValidationTypes.OPTIONAL:
        canBeOptional = isOptionalValidation(value);
        return acc;
      default:
        return acc;
    }
  }, defaultSchema);

  return canBeOptional ? schema.optional() : schema;
};

const makeZodSchemaFromJobInputNumberSchema = (
  jobInputNumberSchema: JobInputNumberSchemaType,
) => {
  const { validations } = jobInputNumberSchema;
  const defaultSchema = z.number({ coerce: true });
  if (!validations) return defaultSchema;

  let canBeOptional: boolean = false;
  const schema = validations.reduce((acc, cur) => {
    const { validation, value } = cur;
    switch (validation) {
      case ValidJobInputValidationTypes.MIN:
        return acc.min(parseValidationValue(value as string));
      case ValidJobInputValidationTypes.MAX:
        return acc.max(parseValidationValue(value as string));
      case ValidJobInputValidationTypes.FORMAT:
        switch (value) {
          case ValidJobInputFormatValues.INTEGER:
            return acc.int();
          default:
            return acc;
        }
      case ValidJobInputValidationTypes.OPTIONAL:
        canBeOptional = isOptionalValidation(value);
        return acc;
      default:
        return acc;
    }
  }, defaultSchema);

  return canBeOptional ? schema.optional() : schema;
};

const makeZodSchemaFromJobInputBooleanSchema = () => {
  return z.boolean();
};

const makeZodSchemaFromJobInputOptionSchema = (
  jobInputOptionSchema: JobInputOptionSchemaType,
) => {
  const {
    data: { values },
    validations,
  } = jobInputOptionSchema;
  const defaultSchema = z.array(
    z
      .number()
      .int()
      .nonnegative()
      .max(values.length - 1),
  );
  if (!validations) return defaultSchema;

  let canBeOptional: boolean = false;
  const schema = validations.reduce((acc, cur) => {
    const { validation, value } = cur;
    switch (validation) {
      case ValidJobInputValidationTypes.MIN:
        return acc.min(parseValidationValue(value as string));
      case ValidJobInputValidationTypes.MAX:
        return acc.max(parseValidationValue(value as string));
      case ValidJobInputValidationTypes.OPTIONAL:
        canBeOptional = isOptionalValidation(value);
        return acc;
      default:
        return acc;
    }
  }, defaultSchema);

  return canBeOptional ? schema.optional() : schema;
};

const makeZodSchemaFromJobInputFileSchema = (
  jobInputFileSchema: JobInputFileSchemaType,
) => {
  const { validations } = jobInputFileSchema;
  const defaultSchema = z.string();
  if (!validations) return defaultSchema;

  let canBeOptional: boolean = false;
  const schema = validations.reduce((acc, cur) => {
    const { validation, value } = cur;
    switch (validation) {
      case ValidJobInputValidationTypes.OPTIONAL:
        canBeOptional = isOptionalValidation(value);
        return acc;
      case ValidJobInputValidationTypes.MIN:
        return acc.min(parseValidationValue(value as string));
      case ValidJobInputValidationTypes.MAX:
        return acc.max(parseValidationValue(value as string));
      // ACCEPT validation is handled at UI level, not in zod schema
      default:
        return acc;
    }
  }, defaultSchema);

  return canBeOptional ? schema.optional() : schema;
};

// Validation functions for new input types
const makeZodSchemaFromJobInputEmailSchema = (
  jobInputEmailSchema: JobInputEmailSchemaType,
) => {
  const { validations } = jobInputEmailSchema;
  const defaultSchema = z.string().email();
  if (!validations) return defaultSchema;

  let canBeOptional: boolean = false;
  const schema = validations.reduce((acc, cur) => {
    const { validation, value } = cur;
    switch (validation) {
      case ValidJobInputValidationTypes.MIN:
        return acc.min(parseValidationValue(value as string));
      case ValidJobInputValidationTypes.MAX:
        return acc.max(parseValidationValue(value as string));
      case ValidJobInputValidationTypes.FORMAT:
        // Email format is already applied by default
        return acc;
      case ValidJobInputValidationTypes.OPTIONAL:
        canBeOptional = isOptionalValidation(value);
        return acc;
      default:
        return acc;
    }
  }, defaultSchema);

  return canBeOptional ? schema.optional() : schema;
};

const makeZodSchemaFromJobInputPasswordSchema = (
  jobInputPasswordSchema: JobInputPasswordSchemaType,
) => {
  const { validations } = jobInputPasswordSchema;
  const defaultSchema = z.string();
  if (!validations) return defaultSchema;

  let canBeOptional: boolean = false;
  const schema = validations.reduce((acc, cur) => {
    const { validation, value } = cur;
    switch (validation) {
      case ValidJobInputValidationTypes.MIN:
        return acc.min(parseValidationValue(value as string));
      case ValidJobInputValidationTypes.MAX:
        return acc.max(parseValidationValue(value as string));
      case ValidJobInputValidationTypes.OPTIONAL:
        canBeOptional = isOptionalValidation(value);
        return acc;
      default:
        return acc;
    }
  }, defaultSchema);

  return canBeOptional ? schema.optional() : schema;
};

const makeZodSchemaFromJobInputTelSchema = (
  jobInputTelSchema: JobInputTelSchemaType,
) => {
  const { validations } = jobInputTelSchema;
  const defaultSchema = z.string();
  if (!validations) return defaultSchema;

  let canBeOptional: boolean = false;
  const schema = validations.reduce((acc, cur) => {
    const { validation, value } = cur;
    switch (validation) {
      case ValidJobInputValidationTypes.MIN:
        return acc.min(parseValidationValue(value as string));
      case ValidJobInputValidationTypes.MAX:
        return acc.max(parseValidationValue(value as string));
      case ValidJobInputValidationTypes.FORMAT:
        // tel-pattern validation is handled at UI level
        return acc;
      case ValidJobInputValidationTypes.OPTIONAL:
        canBeOptional = isOptionalValidation(value);
        return acc;
      default:
        return acc;
    }
  }, defaultSchema);

  return canBeOptional ? schema.optional() : schema;
};

const makeZodSchemaFromJobInputUrlSchema = (
  jobInputUrlSchema: JobInputUrlSchemaType,
) => {
  const { validations } = jobInputUrlSchema;
  const defaultSchema = z.string().url();
  if (!validations) return defaultSchema;

  let canBeOptional: boolean = false;
  const schema = validations.reduce((acc, cur) => {
    const { validation, value } = cur;
    switch (validation) {
      case ValidJobInputValidationTypes.MIN:
        return acc.min(parseValidationValue(value as string));
      case ValidJobInputValidationTypes.MAX:
        return acc.max(parseValidationValue(value as string));
      case ValidJobInputValidationTypes.FORMAT:
        // URL format is already applied by default
        return acc;
      case ValidJobInputValidationTypes.OPTIONAL:
        canBeOptional = isOptionalValidation(value);
        return acc;
      default:
        return acc;
    }
  }, defaultSchema);

  return canBeOptional ? schema.optional() : schema;
};

const makeZodSchemaFromJobInputDateSchema = (
  jobInputDateSchema: JobInputDateSchemaType | JobInputDatetimeLocalSchemaType | JobInputTimeSchemaType | JobInputMonthSchemaType | JobInputWeekSchemaType,
) => {
  const { validations } = jobInputDateSchema;
  let schema: z.ZodType<string> = z.string();
  if (!validations) return schema;

  let canBeOptional: boolean = false;
  let minBound: string | undefined;
  let maxBound: string | undefined;

  validations.forEach((cur) => {
    const { validation, value } = cur;
    switch (validation) {
      case ValidJobInputValidationTypes.MIN:
        if (typeof value === 'string' && value.length > 0) {
          minBound = value;
        }
        return;
      case ValidJobInputValidationTypes.MAX:
        if (typeof value === 'string' && value.length > 0) {
          maxBound = value;
        }
        return;
      case ValidJobInputValidationTypes.OPTIONAL:
        canBeOptional = isOptionalValidation(value);
        return;
      default:
        return;
    }
  });

  if (minBound) {
    schema = schema.refine(
      (current) => current >= minBound!,
      `Value must be greater than or equal to ${minBound}`,
    );
  }
  if (maxBound) {
    schema = schema.refine(
      (current) => current <= maxBound!,
      `Value must be less than or equal to ${maxBound}`,
    );
  }

  return canBeOptional ? schema.optional() : schema;
};

const makeZodSchemaFromJobInputColorSchema = (
  jobInputColorSchema: JobInputColorSchemaType,
) => {
  const { validations } = jobInputColorSchema;
  const defaultSchema = z.string();
  if (!validations) return defaultSchema;

  let canBeOptional: boolean = false;
  const schema = validations.reduce((acc, cur) => {
    const { validation, value } = cur;
    switch (validation) {
      case ValidJobInputValidationTypes.OPTIONAL:
        canBeOptional = isOptionalValidation(value);
        return acc;
      default:
        return acc;
    }
  }, defaultSchema);

  return canBeOptional ? schema.optional() : schema;
};

const makeZodSchemaFromJobInputRangeSchema = (
  jobInputRangeSchema: JobInputRangeSchemaType,
) => {
  const { validations } = jobInputRangeSchema;
  const defaultSchema = z.number({ coerce: true });
  if (!validations) return defaultSchema;

  let canBeOptional: boolean = false;
  const schema = validations.reduce((acc, cur) => {
    const { validation, value } = cur;
    switch (validation) {
      case ValidJobInputValidationTypes.MIN:
        return acc.min(parseValidationValue(value as string));
      case ValidJobInputValidationTypes.MAX:
        return acc.max(parseValidationValue(value as string));
      case ValidJobInputValidationTypes.OPTIONAL:
        canBeOptional = isOptionalValidation(value);
        return acc;
      default:
        return acc;
    }
  }, defaultSchema);

  return canBeOptional ? schema.optional() : schema;
};

const makeZodSchemaFromJobInputHiddenSchema = (
  _jobInputHiddenSchema: JobInputHiddenSchemaType,
) => {
  // Hidden fields always have a value, so they're always present
  return z.string();
};

const makeZodSchemaFromJobInputSearchSchema = (
  jobInputSearchSchema: JobInputSearchSchemaType,
) => {
  const { validations } = jobInputSearchSchema;
  const defaultSchema = z.string();
  if (!validations) return defaultSchema;

  let canBeOptional: boolean = false;
  const schema = validations.reduce((acc, cur) => {
    const { validation, value } = cur;
    switch (validation) {
      case ValidJobInputValidationTypes.MIN:
        return acc.min(parseValidationValue(value as string));
      case ValidJobInputValidationTypes.MAX:
        return acc.max(parseValidationValue(value as string));
      case ValidJobInputValidationTypes.FORMAT:
        switch (value) {
          case ValidJobInputFormatValues.NON_EMPTY:
            return acc.min(1);
          default:
            return acc;
        }
      case ValidJobInputValidationTypes.OPTIONAL:
        canBeOptional = isOptionalValidation(value);
        return acc;
      default:
        return acc;
    }
  }, defaultSchema);

  return canBeOptional ? schema.optional() : schema;
};

const makeZodSchemaFromJobInputCheckboxSchema = () => {
  return z.boolean();
};

const makeZodSchemaFromJobInputRadioSchema = (
  jobInputRadioSchema: JobInputRadioSchemaType,
) => {
  const {
    data: { values },
    validations,
  } = jobInputRadioSchema;
  // Radio buttons typically select a single value (index)
  const defaultSchema = z.number().int().nonnegative().max(values.length - 1);
  if (!validations) return defaultSchema;

  let canBeOptional: boolean = false;
  const schema = validations.reduce((acc, cur) => {
    const { validation, value } = cur;
    switch (validation) {
      case ValidJobInputValidationTypes.OPTIONAL:
        canBeOptional = isOptionalValidation(value);
        return acc;
      default:
        return acc;
    }
  }, defaultSchema);

  return canBeOptional ? schema.optional() : schema;
};

// Helper functions
export const isOptional = (jobInputSchema: JobInputSchemaType): boolean => {
  if (!('validations' in jobInputSchema) || !jobInputSchema.validations)
    return false;
  // If optional validation exists, the field is optional (value doesn't matter)
  return jobInputSchema.validations.some(
    (v) => v.validation === ValidJobInputValidationTypes.OPTIONAL,
  );
};

export const isSingleOption = (jobInputSchema: JobInputSchemaType): boolean => {
  if (jobInputSchema.type !== ValidJobInputTypes.OPTION && jobInputSchema.type !== ValidJobInputTypes.RADIO) return false;
  if (!('validations' in jobInputSchema) || !jobInputSchema.validations)
    return false;

  const minValidation = jobInputSchema.validations.find(
    (v) => v.validation === ValidJobInputValidationTypes.MIN,
  );
  const maxValidation = jobInputSchema.validations.find(
    (v) => v.validation === ValidJobInputValidationTypes.MAX,
  );

  const minValue = minValidation?.value ? parseValidationValue(minValidation.value as string) : undefined;
  const maxValue = maxValidation?.value ? parseValidationValue(maxValidation.value as string) : undefined;

  return minValue === 1 && maxValue === 1;
};

export const getDefaultValue = (jobInputSchema: JobInputSchemaType) => {
  const { type, data } = jobInputSchema;
  
  // Check if there's a default value in data
  if (data && 'default' in data && data.default !== undefined) {
    return data.default;
  }
  
  switch (type) {
    case ValidJobInputTypes.TEXT:
    case ValidJobInputTypes.TEXTAREA:
    case ValidJobInputTypes.EMAIL:
    case ValidJobInputTypes.PASSWORD:
    case ValidJobInputTypes.TEL:
    case ValidJobInputTypes.URL:
    case ValidJobInputTypes.SEARCH:
      return '';
    case ValidJobInputTypes.BOOLEAN:
    case ValidJobInputTypes.CHECKBOX:
      return false;
    case ValidJobInputTypes.NUMBER:
    case ValidJobInputTypes.RANGE:
    case ValidJobInputTypes.FILE:
    case ValidJobInputTypes.NONE:
      return null;
    case ValidJobInputTypes.HIDDEN:
      return 'value' in data ? data.value : '';
    case ValidJobInputTypes.OPTION:
      return [];
    case ValidJobInputTypes.DATE:
    case ValidJobInputTypes.DATETIME_LOCAL:
    case ValidJobInputTypes.TIME:
    case ValidJobInputTypes.MONTH:
    case ValidJobInputTypes.WEEK:
      return '';
    case ValidJobInputTypes.COLOR:
      return '#000000';
    case ValidJobInputTypes.RADIO:
      return null;
  }
};


