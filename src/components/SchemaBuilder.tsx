import { useState, useRef, useEffect } from 'react';
import {
  ValidJobInputTypes,
  ValidJobInputValidationTypes,
  ValidJobInputFormatValues,
} from '../lib/job-input-schema';
import { cn } from './JobInputsFormRenderer';

// ── Field type metadata ──────────────────────────────────────────────

interface FieldTypeInfo {
  type: ValidJobInputTypes;
  label: string;
  category: string;
  icon: string;
}

const FIELD_TYPE_CATEGORIES = [
  'Text',
  'Number',
  'Choice',
  'Date & Time',
  'Other',
] as const;

const FIELD_TYPES: FieldTypeInfo[] = [
  { type: ValidJobInputTypes.TEXT, label: 'Text', category: 'Text', icon: 'Aa' },
  { type: ValidJobInputTypes.TEXTAREA, label: 'Textarea', category: 'Text', icon: '¶' },
  { type: ValidJobInputTypes.EMAIL, label: 'Email', category: 'Text', icon: '@' },
  { type: ValidJobInputTypes.PASSWORD, label: 'Password', category: 'Text', icon: '••' },
  { type: ValidJobInputTypes.URL, label: 'URL', category: 'Text', icon: '🔗' },
  { type: ValidJobInputTypes.SEARCH, label: 'Search', category: 'Text', icon: '🔍' },
  { type: ValidJobInputTypes.TEL, label: 'Telephone', category: 'Text', icon: '📞' },
  { type: ValidJobInputTypes.NUMBER, label: 'Number', category: 'Number', icon: '#' },
  { type: ValidJobInputTypes.RANGE, label: 'Range / Slider', category: 'Number', icon: '⟷' },
  { type: ValidJobInputTypes.BOOLEAN, label: 'Boolean (Switch)', category: 'Choice', icon: '⊘' },
  { type: ValidJobInputTypes.CHECKBOX, label: 'Checkbox', category: 'Choice', icon: '☑' },
  { type: ValidJobInputTypes.OPTION, label: 'Dropdown / Multi‑select', category: 'Choice', icon: '▾' },
  { type: ValidJobInputTypes.RADIO, label: 'Radio Buttons', category: 'Choice', icon: '◉' },
  { type: ValidJobInputTypes.DATE, label: 'Date', category: 'Date & Time', icon: '📅' },
  { type: ValidJobInputTypes.DATETIME_LOCAL, label: 'Date & Time', category: 'Date & Time', icon: '📅' },
  { type: ValidJobInputTypes.TIME, label: 'Time', category: 'Date & Time', icon: '⏰' },
  { type: ValidJobInputTypes.MONTH, label: 'Month', category: 'Date & Time', icon: '📆' },
  { type: ValidJobInputTypes.WEEK, label: 'Week', category: 'Date & Time', icon: '📆' },
  { type: ValidJobInputTypes.FILE, label: 'File Upload', category: 'Other', icon: '📎' },
  { type: ValidJobInputTypes.COLOR, label: 'Color Picker', category: 'Other', icon: '🎨' },
  { type: ValidJobInputTypes.HIDDEN, label: 'Hidden Field', category: 'Other', icon: '👁' },
  { type: ValidJobInputTypes.NONE, label: 'None (Display Only)', category: 'Other', icon: '—' },
];

// ── Validation metadata (from MIP-003 Attachment 01) ───────────────────

type ValidationType = ValidJobInputValidationTypes;
type FormatValue = ValidJobInputFormatValues;

interface ValidationRule {
  validation: ValidationType | string;
  value?: string | boolean;
}

const VALIDATIONS_BY_TYPE: Record<ValidJobInputTypes, ValidationType[]> = {
  [ValidJobInputTypes.TEXT]: [
    ValidJobInputValidationTypes.MIN,
    ValidJobInputValidationTypes.MAX,
    ValidJobInputValidationTypes.FORMAT,
    ValidJobInputValidationTypes.OPTIONAL,
  ],
  [ValidJobInputTypes.TEXTAREA]: [
    ValidJobInputValidationTypes.MIN,
    ValidJobInputValidationTypes.MAX,
    ValidJobInputValidationTypes.FORMAT,
    ValidJobInputValidationTypes.OPTIONAL,
  ],
  [ValidJobInputTypes.NUMBER]: [
    ValidJobInputValidationTypes.MIN,
    ValidJobInputValidationTypes.MAX,
    ValidJobInputValidationTypes.FORMAT,
    ValidJobInputValidationTypes.OPTIONAL,
  ],
  [ValidJobInputTypes.BOOLEAN]: [ValidJobInputValidationTypes.OPTIONAL],
  [ValidJobInputTypes.OPTION]: [
    ValidJobInputValidationTypes.MIN,
    ValidJobInputValidationTypes.MAX,
    ValidJobInputValidationTypes.OPTIONAL,
  ],
  [ValidJobInputTypes.FILE]: [
    ValidJobInputValidationTypes.ACCEPT,
    ValidJobInputValidationTypes.MIN,
    ValidJobInputValidationTypes.MAX,
    ValidJobInputValidationTypes.OPTIONAL,
  ],
  [ValidJobInputTypes.NONE]: [],
  [ValidJobInputTypes.EMAIL]: [
    ValidJobInputValidationTypes.MIN,
    ValidJobInputValidationTypes.MAX,
    ValidJobInputValidationTypes.FORMAT,
    ValidJobInputValidationTypes.OPTIONAL,
  ],
  [ValidJobInputTypes.PASSWORD]: [
    ValidJobInputValidationTypes.MIN,
    ValidJobInputValidationTypes.MAX,
    ValidJobInputValidationTypes.OPTIONAL,
  ],
  [ValidJobInputTypes.TEL]: [
    ValidJobInputValidationTypes.MIN,
    ValidJobInputValidationTypes.MAX,
    ValidJobInputValidationTypes.FORMAT,
    ValidJobInputValidationTypes.OPTIONAL,
  ],
  [ValidJobInputTypes.URL]: [
    ValidJobInputValidationTypes.MIN,
    ValidJobInputValidationTypes.MAX,
    ValidJobInputValidationTypes.FORMAT,
    ValidJobInputValidationTypes.OPTIONAL,
  ],
  [ValidJobInputTypes.DATE]: [
    ValidJobInputValidationTypes.MIN,
    ValidJobInputValidationTypes.MAX,
    ValidJobInputValidationTypes.OPTIONAL,
  ],
  [ValidJobInputTypes.DATETIME_LOCAL]: [
    ValidJobInputValidationTypes.MIN,
    ValidJobInputValidationTypes.MAX,
    ValidJobInputValidationTypes.OPTIONAL,
  ],
  [ValidJobInputTypes.TIME]: [
    ValidJobInputValidationTypes.MIN,
    ValidJobInputValidationTypes.MAX,
    ValidJobInputValidationTypes.OPTIONAL,
  ],
  [ValidJobInputTypes.MONTH]: [
    ValidJobInputValidationTypes.MIN,
    ValidJobInputValidationTypes.MAX,
    ValidJobInputValidationTypes.OPTIONAL,
  ],
  [ValidJobInputTypes.WEEK]: [
    ValidJobInputValidationTypes.MIN,
    ValidJobInputValidationTypes.MAX,
    ValidJobInputValidationTypes.OPTIONAL,
  ],
  [ValidJobInputTypes.COLOR]: [ValidJobInputValidationTypes.OPTIONAL],
  [ValidJobInputTypes.RANGE]: [
    ValidJobInputValidationTypes.MIN,
    ValidJobInputValidationTypes.MAX,
    ValidJobInputValidationTypes.OPTIONAL,
  ],
  [ValidJobInputTypes.HIDDEN]: [],
  [ValidJobInputTypes.SEARCH]: [
    ValidJobInputValidationTypes.MIN,
    ValidJobInputValidationTypes.MAX,
    ValidJobInputValidationTypes.FORMAT,
    ValidJobInputValidationTypes.OPTIONAL,
  ],
  [ValidJobInputTypes.CHECKBOX]: [
    ValidJobInputValidationTypes.MIN,
    ValidJobInputValidationTypes.MAX,
    ValidJobInputValidationTypes.OPTIONAL,
  ],
  [ValidJobInputTypes.RADIO]: [
    ValidJobInputValidationTypes.MIN,
    ValidJobInputValidationTypes.MAX,
    ValidJobInputValidationTypes.OPTIONAL,
  ],
};

const FORMAT_VALUES_BY_TYPE: Partial<Record<ValidJobInputTypes, FormatValue[]>> = {
  [ValidJobInputTypes.TEXT]: [
    ValidJobInputFormatValues.URL,
    ValidJobInputFormatValues.EMAIL,
    ValidJobInputFormatValues.NON_EMPTY,
  ],
  [ValidJobInputTypes.TEXTAREA]: [ValidJobInputFormatValues.NON_EMPTY],
  [ValidJobInputTypes.NUMBER]: [ValidJobInputFormatValues.INTEGER],
  [ValidJobInputTypes.EMAIL]: [ValidJobInputFormatValues.EMAIL],
  [ValidJobInputTypes.URL]: [ValidJobInputFormatValues.URL],
  [ValidJobInputTypes.TEL]: [ValidJobInputFormatValues.TEL_PATTERN],
  [ValidJobInputTypes.SEARCH]: [ValidJobInputFormatValues.NON_EMPTY],
};

const formatLabel: Record<FormatValue, string> = {
  [ValidJobInputFormatValues.URL]: 'URL',
  [ValidJobInputFormatValues.EMAIL]: 'Email',
  [ValidJobInputFormatValues.INTEGER]: 'Integer',
  [ValidJobInputFormatValues.NON_EMPTY]: 'Non-empty',
  [ValidJobInputFormatValues.TEL_PATTERN]: 'Telephone pattern',
};

// ── Default field templates ──────────────────────────────────────────

let fieldCounter = 0;

function generateFieldId(type: ValidJobInputTypes): string {
  fieldCounter++;
  return `${type}-${fieldCounter}`;
}

function createDefaultField(type: ValidJobInputTypes): Record<string, unknown> {
  const id = generateFieldId(type);
  const info = FIELD_TYPES.find((f) => f.type === type);
  const name = info?.label ?? type;

  const base = { id, type, name };

  switch (type) {
    case ValidJobInputTypes.TEXT:
      return { ...base, data: { placeholder: '', description: '' } };

    case ValidJobInputTypes.TEXTAREA:
      return { ...base, data: { placeholder: '', description: '' } };

    case ValidJobInputTypes.EMAIL:
      return {
        ...base,
        data: { placeholder: 'email@example.com', description: '' },
        validations: [{ validation: 'format', value: 'email' }],
      };

    case ValidJobInputTypes.PASSWORD:
      return { ...base, data: { placeholder: '', description: '' } };

    case ValidJobInputTypes.URL:
      return {
        ...base,
        data: { placeholder: 'https://', description: '' },
        validations: [{ validation: 'format', value: 'url' }],
      };

    case ValidJobInputTypes.SEARCH:
      return { ...base, data: { placeholder: 'Search…', description: '' } };

    case ValidJobInputTypes.TEL:
      return { ...base, data: { placeholder: '+1 (555) 000‑0000', description: '' } };

    case ValidJobInputTypes.NUMBER:
      return { ...base, data: { description: '' } };

    case ValidJobInputTypes.RANGE:
      return { ...base, data: { min: '0', max: '100', step: '1', description: '' } };

    case ValidJobInputTypes.BOOLEAN:
      return { ...base, data: { description: '' } };

    case ValidJobInputTypes.CHECKBOX:
      return { ...base, data: { description: '' } };

    case ValidJobInputTypes.OPTION:
      return {
        ...base,
        data: { description: '', values: ['Option 1', 'Option 2', 'Option 3'] },
        validations: [
          { validation: 'min', value: '1' },
          { validation: 'max', value: '1' },
        ],
      };

    case ValidJobInputTypes.RADIO:
      return {
        ...base,
        data: { description: '', values: ['Choice A', 'Choice B', 'Choice C'] },
      };

    case ValidJobInputTypes.DATE:
    case ValidJobInputTypes.DATETIME_LOCAL:
    case ValidJobInputTypes.TIME:
    case ValidJobInputTypes.MONTH:
    case ValidJobInputTypes.WEEK:
      return { ...base, data: { description: '' } };

    case ValidJobInputTypes.FILE:
      return {
        ...base,
        data: { description: '', outputFormat: 'url' },
      };

    case ValidJobInputTypes.COLOR:
      return { ...base, data: { description: '' } };

    case ValidJobInputTypes.HIDDEN:
      return { ...base, data: { value: '' } };

    case ValidJobInputTypes.NONE:
      return { ...base, data: { description: '' } };

    default:
      return { ...base, data: {} };
  }
}

// ── Helpers ──────────────────────────────────────────────────────────

function parseSchemaToFields(schemaInput: string): Record<string, unknown>[] {
  try {
    const parsed = JSON.parse(schemaInput);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.input_data)) return parsed.input_data;
    if (parsed && typeof parsed === 'object' && parsed.id) return [parsed];
    return [];
  } catch {
    return [];
  }
}

function fieldsToJson(fields: Record<string, unknown>[]): string {
  return JSON.stringify(fields, null, 2);
}

// ── Field type badge ─────────────────────────────────────────────────

function FieldTypeBadge({ type }: { type: string }) {
  const info = FIELD_TYPES.find((f) => f.type === type);
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
      <span>{info?.icon ?? '?'}</span>
      <span>{info?.label ?? type}</span>
    </span>
  );
}

// ── FieldCard ────────────────────────────────────────────────────────

interface FieldCardProps {
  field: Record<string, unknown>;
  index: number;
  totalFields: number;
  onUpdate: (index: number, field: Record<string, unknown>) => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

function FieldCard({ field, index, totalFields, onUpdate, onRemove, onMoveUp, onMoveDown }: FieldCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const data = (field.data ?? {}) as Record<string, unknown>;
  const fieldName = (field.name as string) ?? '';
  const fieldId = (field.id as string) ?? '';
  const fieldType = (field.type as string) ?? '';
  const description = (data.description as string) ?? '';
  const placeholder = (data.placeholder as string) ?? undefined;
  const values = (data.values as string[]) ?? undefined;
  const validations = (field.validations as ValidationRule[] | undefined) ?? [];

  const typedFieldType = (fieldType as ValidJobInputTypes) || ValidJobInputTypes.TEXT;
  const availableValidations = VALIDATIONS_BY_TYPE[typedFieldType] ?? [];
  const formatOptions = FORMAT_VALUES_BY_TYPE[typedFieldType];

  const hasOptionalValidation = validations.some(
    (v) => v.validation === ValidJobInputValidationTypes.OPTIONAL,
  );

  const updateField = (updates: Record<string, unknown>) => {
    onUpdate(index, { ...field, ...updates });
  };

  const updateData = (dataUpdates: Record<string, unknown>) => {
    onUpdate(index, { ...field, data: { ...data, ...dataUpdates } });
  };

  const updateValidations = (next: ValidationRule[]) => {
    if (next.length === 0) {
      // Remove validations key entirely when empty
      const { validations: _removed, ...rest } = field as any;
      onUpdate(index, rest);
    } else {
      onUpdate(index, { ...field, validations: next });
    }
  };

  const handleToggleOptional = () => {
    if (!availableValidations.includes(ValidJobInputValidationTypes.OPTIONAL)) return;
    if (hasOptionalValidation) {
      updateValidations(
        validations.filter(
          (v) => v.validation !== ValidJobInputValidationTypes.OPTIONAL,
        ),
      );
    } else {
      updateValidations([
        ...validations,
        { validation: ValidJobInputValidationTypes.OPTIONAL, value: 'true' },
      ]);
    }
  };

  const handleAddValidation = () => {
    const nonOptionalValidations = availableValidations.filter(
      (v) => v !== ValidJobInputValidationTypes.OPTIONAL,
    );
    if (nonOptionalValidations.length === 0) return;

    const newType = nonOptionalValidations[0];
    let defaultValue: string | boolean = '';

    if (newType === ValidJobInputValidationTypes.FORMAT) {
      const allowedFormats = formatOptions ?? [];
      defaultValue = allowedFormats[0] ?? ValidJobInputFormatValues.NON_EMPTY;
    }

    updateValidations([...validations, { validation: newType, value: defaultValue }]);
  };

  const handleUpdateValidation = (idx: number, rule: Partial<ValidationRule>) => {
    const next = validations.map((v, i) => (i === idx ? { ...v, ...rule } : v));
    updateValidations(next);
  };

  const handleRemoveValidation = (idx: number) => {
    const next = validations.filter((_, i) => i !== idx);
    updateValidations(next);
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm transition-shadow hover:shadow-md">
      {/* Header - always visible */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Reorder buttons */}
        <div className="flex flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMoveUp(index)}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs leading-none"
            title="Move up"
          >
            ▲
          </button>
          <button
            type="button"
            disabled={index === totalFields - 1}
            onClick={() => onMoveDown(index)}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs leading-none"
            title="Move down"
          >
            ▼
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
              {fieldName || 'Untitled Field'}
            </span>
            <FieldTypeBadge type={fieldType} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            id: {fieldId}
            {description ? ` · ${description}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            title="Remove field"
          >
            <svg
              className="w-4 h-4"
              style={{ width: '16px', height: '16px' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <svg
          className={cn(
            "w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform",
            isExpanded && "rotate-180"
          )}
          style={{ width: '16px', height: '16px' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded edit section */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Name</label>
              <input
                type="text"
                className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={fieldName}
                onChange={(e) => updateField({ name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">ID</label>
              <input
                type="text"
                className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={fieldId}
                onChange={(e) => updateField({ id: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
            <input
              type="text"
              className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={description}
              onChange={(e) => updateData({ description: e.target.value })}
            />
          </div>

          {placeholder !== undefined && (
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Placeholder</label>
              <input
                type="text"
                className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={placeholder ?? ''}
                onChange={(e) => updateData({ placeholder: e.target.value })}
              />
            </div>
          )}

          {values !== undefined && (
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Options <span className="text-gray-400 dark:text-gray-500">(one per line)</span>
              </label>
              <textarea
                className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
                value={values.join('\n')}
                onChange={(e) => {
                  const newValues = e.target.value.split('\n').filter((v) => v.length > 0);
                  updateData({ values: newValues.length > 0 ? newValues : ['Option 1'] });
                }}
              />
            </div>
          )}

          {availableValidations.length > 0 && (
            <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-3 mt-1 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Validations
                </span>
                <div className="flex items-center gap-2">
                  {availableValidations.includes(
                    ValidJobInputValidationTypes.OPTIONAL,
                  ) && (
                    <button
                      type="button"
                      onClick={handleToggleOptional}
                      className={cn(
                        'text-[11px] px-2 py-1 rounded-full border transition-colors',
                        hasOptionalValidation
                          ? 'border-green-500 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30'
                          : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-green-500 hover:text-green-600',
                      )}
                    >
                      {hasOptionalValidation ? 'Optional' : 'Required'}
                    </button>
                  )}
                  {availableValidations.some(
                    (v) => v !== ValidJobInputValidationTypes.OPTIONAL,
                  ) && (
                    <button
                      type="button"
                      onClick={handleAddValidation}
                      className="text-[11px] px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors"
                    >
                      + Add rule
                    </button>
                  )}
                </div>
              </div>

              {validations.filter(
                (v) => v.validation !== ValidJobInputValidationTypes.OPTIONAL,
              ).length > 0 && (
                <div className="space-y-1.5">
                  {validations.map((rule, idx) => {
                    if (rule.validation === ValidJobInputValidationTypes.OPTIONAL) {
                      return null;
                    }

                    const currentType = rule
                      .validation as ValidJobInputValidationTypes;
                    const typeOptions = availableValidations.filter(
                      (v) => v !== ValidJobInputValidationTypes.OPTIONAL,
                    );
                    const canUseFormat =
                      currentType === ValidJobInputValidationTypes.FORMAT;
                    const allowedFormats = formatOptions ?? [];

                    return (
                      <div
                        key={`${currentType}-${idx}`}
                        className="flex items-center gap-2"
                      >
                        <select
                          className="text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-1.5 py-1"
                          value={currentType}
                          onChange={(e) =>
                            handleUpdateValidation(idx, {
                              validation: e
                                .target
                                .value as ValidJobInputValidationTypes,
                              value:
                                e.target.value ===
                                ValidJobInputValidationTypes.FORMAT
                                  ? (allowedFormats[0] ??
                                    ValidJobInputFormatValues.NON_EMPTY)
                                  : '',
                            })
                          }
                        >
                          {typeOptions.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>

                        {canUseFormat && allowedFormats.length > 0 ? (
                          <select
                            className="flex-1 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-1.5 py-1"
                            value={String(rule.value ?? allowedFormats[0])}
                            onChange={(e) =>
                              handleUpdateValidation(idx, {
                                value: e.target.value,
                              })
                            }
                          >
                            {allowedFormats.map((fv) => (
                              <option key={fv} value={fv}>
                                {formatLabel[fv]}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            className="flex-1 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1"
                            placeholder={
                              currentType === ValidJobInputValidationTypes.MIN
                                ? 'Minimum value/length'
                                : currentType === ValidJobInputValidationTypes.MAX
                                ? 'Maximum value/length'
                                : currentType === ValidJobInputValidationTypes.ACCEPT
                                ? 'e.g. image/*,.pdf'
                                : 'Value'
                            }
                            value={String(rule.value ?? '')}
                            onChange={(e) =>
                              handleUpdateValidation(idx, {
                                value: e.target.value,
                              })
                            }
                          />
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveValidation(idx)}
                          className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 p-1 rounded"
                          title="Remove validation"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── AddFieldDropdown ─────────────────────────────────────────────────

function AddFieldDropdown({ onAdd }: { onAdd: (type: ValidJobInputTypes) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed transition-colors text-sm font-medium",
          isOpen
            ? "border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        )}
      >
        <svg
          className="w-5 h-5"
          style={{ width: '20px', height: '20px' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Field
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
          {FIELD_TYPE_CATEGORIES.map((category) => {
            const typesInCategory = FIELD_TYPES.filter((f) => f.category === category);
            if (typesInCategory.length === 0) return null;
            return (
              <div key={category}>
                <div className="sticky top-0 px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                  {category}
                </div>
                {typesInCategory.map((fieldType) => (
                  <button
                    key={fieldType.type}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm flex items-center gap-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    onClick={() => {
                      onAdd(fieldType.type);
                      setIsOpen(false);
                    }}
                  >
                    <span className="w-6 text-center text-base">{fieldType.icon}</span>
                    <span>{fieldType.label}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── SchemaBuilder (main export) ──────────────────────────────────────

export interface SchemaBuilderProps {
  schemaInput: string;
  onSchemaChange: (schema: string) => void;
  className?: string;
}

export default function SchemaBuilder({ schemaInput, onSchemaChange, className }: SchemaBuilderProps) {
  const fields = parseSchemaToFields(schemaInput);

  const updateFields = (newFields: Record<string, unknown>[]) => {
    onSchemaChange(fieldsToJson(newFields));
  };

  const handleAddField = (type: ValidJobInputTypes) => {
    const newField = createDefaultField(type);
    updateFields([...fields, newField]);
  };

  const handleUpdateField = (index: number, updatedField: Record<string, unknown>) => {
    const newFields = [...fields];
    newFields[index] = updatedField;
    updateFields(newFields);
  };

  const handleRemoveField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    updateFields(newFields);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newFields = [...fields];
    [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
    updateFields(newFields);
  };

  const handleMoveDown = (index: number) => {
    if (index === fields.length - 1) return;
    const newFields = [...fields];
    [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
    updateFields(newFields);
  };

  return (
    <div className={cn("flex flex-col gap-3 h-full", className)}>
      <div className="flex-shrink-0">
        <AddFieldDropdown onAdd={handleAddField} />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {fields.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 py-12">
            <svg
              className="w-12 h-12 mb-3"
              style={{ width: '48px', height: '48px' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-medium">No fields yet</p>
            <p className="text-xs mt-1">Click "+ Add Field" above to get started</p>
          </div>
        ) : (
          fields.map((field, index) => (
            <FieldCard
              key={`${(field.id as string) ?? index}-${index}`}
              field={field}
              index={index}
              totalFields={fields.length}
              onUpdate={handleUpdateField}
              onRemove={handleRemoveField}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          ))
        )}
      </div>
    </div>
  );
}
