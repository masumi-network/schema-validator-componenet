import { useEffect, useRef, useState } from 'react';
import { JobInputSchemaType, ValidJobInputTypes } from '../lib/job-input-schema';
import { Input, Textarea, Checkbox } from './ui-components';

// Map of simple input types that only need type prop change
export const SIMPLE_INPUT_TYPES: Record<string, string> = {
  [ValidJobInputTypes.TEXT]: 'text',
  [ValidJobInputTypes.EMAIL]: 'email',
  [ValidJobInputTypes.PASSWORD]: 'password',
  [ValidJobInputTypes.TEL]: 'tel',
  [ValidJobInputTypes.URL]: 'url',
  [ValidJobInputTypes.DATE]: 'date',
  [ValidJobInputTypes.DATETIME_LOCAL]: 'datetime-local',
  [ValidJobInputTypes.TIME]: 'time',
  [ValidJobInputTypes.MONTH]: 'month',
  [ValidJobInputTypes.WEEK]: 'week',
  [ValidJobInputTypes.SEARCH]: 'search',
};

interface RenderInputProps {
  id: string;
  value: string | number | boolean | number[] | null;
  onChange: (value: string | number | boolean | number[] | null) => void;
  disabled?: boolean;
  placeholder?: string;
  description?: string;
  jobInputSchema: JobInputSchemaType;
  data: any;
}

// Render simple string input (most common case)
export function renderSimpleInput(
  inputType: string,
  { id, value, onChange, placeholder, disabled }: RenderInputProps
) {
  return (
    <Input
      id={id}
      type={inputType}
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}

// Render number input with conversion
export function renderNumberInput({
  id,
  value,
  onChange,
  placeholder,
  disabled,
}: RenderInputProps) {
  return (
    <Input
      id={id}
      type="number"
      value={value !== null ? String(value) : ''}
      onChange={(e) => {
        const val = e.target.value;
        onChange(val === '' ? null : Number(val));
      }}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}

// Render checkbox/boolean with label
export function renderCheckboxInput(
  { id, value, onChange, disabled, description, placeholder }: RenderInputProps,
  labelText?: string
) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <Checkbox
        id={id}
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-gray-900 dark:text-gray-100"
      >
        {labelText || description || placeholder || 'Yes'}
      </label>
    </div>
  );
}

// Dropdown-style option selector with single- and multi-select support
interface OptionSelectProps extends RenderInputProps {
  jobInputSchema: JobInputSchemaType;
}

function OptionSelect(props: OptionSelectProps) {
  const { id, value, onChange, disabled, jobInputSchema, data } = props;
  const options = (data as any).values || [];
  const validations =
    'validations' in jobInputSchema ? jobInputSchema.validations : undefined;

  // Multi-select when not explicitly constrained to exactly one selection (min 1, max 1)
  const isMultiSelect = !validations?.some(
    (v: any) =>
      v.validation === 'min' &&
      v.value === '1' &&
      validations?.some(
        (v2: any) => v2.validation === 'max' && v2.value === '1',
      ),
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  const selectedIndices = Array.isArray(value) ? value : [];
  const selectedLabels = selectedIndices
    .map((idx) => options[idx])
    .filter(Boolean);

  const maxValidation = validations?.find(
    (v: any) => v.validation === 'max',
  ) as { validation: string; value?: number } | undefined;
  const maxAllowed =
    typeof maxValidation?.value === 'number' ? maxValidation.value : undefined;

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [open]);

  const toggleOption = (idx: number) => {
    if (disabled) return;

    if (!isMultiSelect) {
      // For single-select, allow deselecting by clicking the same option again
      const alreadySelected =
        selectedIndices.length === 1 && selectedIndices[0] === idx;
      onChange(alreadySelected ? [] : [idx]);
      setOpen(false);
      return;
    }

    const isSelected = selectedIndices.includes(idx);
    let next: number[];

    if (isSelected) {
      next = selectedIndices.filter((i) => i !== idx);
    } else {
      next = [...selectedIndices, idx];
      if (maxAllowed !== undefined && next.length > maxAllowed) {
        return;
      }
    }

    onChange(next);
  };

  const placeholderText = isMultiSelect
    ? 'Select one or more...'
    : 'Select...';

  const summaryText =
    selectedLabels.length > 0 ? selectedLabels.join(', ') : placeholderText;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-h-[2.5rem] w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm ring-offset-white dark:ring-offset-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span
          className={
            selectedLabels.length === 0
              ? 'text-gray-400 dark:text-gray-500'
              : ''
          }
        >
          {summaryText}
        </span>
        <svg
          className="ml-2 h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M5.25 7.5L10 12.25L14.75 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              No options available
            </div>
          ) : (
            <ul
              role="listbox"
              aria-multiselectable={isMultiSelect}
              className="py-1"
            >
              {options.map((opt: string, idx: number) => {
                const isSelected = selectedIndices.includes(idx);
                return (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => toggleOption(idx)}
                      className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${
                        isSelected
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {isMultiSelect && (
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleOption(idx)}
                          className="h-4 w-4"
                        />
                      )}
                      <span>{opt}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// Render option/select dropdown
export function renderOptionInput(props: RenderInputProps) {
  return <OptionSelect {...props} />;
}

// Render file input
export function renderFileInput(props: RenderInputProps) {
  const { id, disabled, jobInputSchema } = props;
  const validations = 'validations' in jobInputSchema ? jobInputSchema.validations : undefined;
  const acceptValidation = validations?.find(
    (v: any) => v.validation === 'accept'
  );
  return (
    <Input
      id={id}
      type="file"
      accept={acceptValidation?.value as string}
      disabled={disabled}
      onChange={() => {
        // File handling logic would go here
        // For now, just a placeholder
      }}
      className="flex items-center"
    />
  );
}

// Render color input with display
export function renderColorInput({
  id,
  value,
  onChange,
  disabled,
}: RenderInputProps) {
  return (
    <div className="flex items-center gap-3">
      <Input
        id={id}
        type="color"
        value={(value as string) || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-10 w-20 cursor-pointer"
      />
      <span className="text-sm text-gray-500 dark:text-gray-400">{(value as string) || '#000000'}</span>
    </div>
  );
}

// Render range input with min/max display
export function renderRangeInput({
  id,
  value,
  onChange,
  disabled,
  data,
}: RenderInputProps) {
  const rangeData = data as any;
  return (
    <div className="space-y-2">
      <Input
        id={id}
        type="range"
        min={rangeData?.min ?? 0}
        max={rangeData?.max ?? 100}
        step={rangeData?.step ?? 1}
        value={value !== null ? String(value) : String(rangeData?.min ?? 0)}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{rangeData?.min ?? 0}</span>
        <span className="font-medium">{value !== null ? value : rangeData?.min ?? 0}</span>
        <span>{rangeData?.max ?? 100}</span>
      </div>
    </div>
  );
}

// Render radio button group
export function renderRadioInput({
  id,
  value,
  onChange,
  disabled,
  data,
}: RenderInputProps) {
  const radioOptions = (data as any).values || [];
  const radioDefault = (data as any).default;
  const currentRadioValue = value !== null && value !== undefined 
    ? (typeof value === 'number' ? radioOptions[value] : value)
    : radioDefault || '';
  
  return (
    <div className="space-y-2">
      {radioOptions.map((opt: string, idx: number) => (
        <div key={idx} className="flex items-center gap-2">
          <input
            type="radio"
            id={`${id}-${idx}`}
            name={id}
            value={opt}
            checked={currentRadioValue === opt}
            onChange={() => onChange(idx)}
            disabled={disabled}
            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-gray-400 dark:focus:ring-gray-500 focus:ring-2 cursor-pointer"
          />
          <label
            htmlFor={`${id}-${idx}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-gray-900 dark:text-gray-100"
          >
            {opt}
          </label>
        </div>
      ))}
    </div>
  );
}

// Main render function that handles all input types
export function renderInput(
  type: ValidJobInputTypes,
  props: RenderInputProps
) {
  const { id, value, onChange, placeholder, disabled, data } = props;

  // Handle simple input types (most common case)
  if (SIMPLE_INPUT_TYPES[type]) {
    return renderSimpleInput(SIMPLE_INPUT_TYPES[type], props);
  }

  // Handle special cases
  switch (type) {
    case ValidJobInputTypes.TEXTAREA:
      return (
        <Textarea
          id={id}
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
      );

    case ValidJobInputTypes.NUMBER:
      return renderNumberInput(props);

    case ValidJobInputTypes.BOOLEAN:
      return renderCheckboxInput(props, placeholder);

    case ValidJobInputTypes.CHECKBOX:
      return renderCheckboxInput(props);

    case ValidJobInputTypes.OPTION:
      return renderOptionInput(props);

    case ValidJobInputTypes.FILE:
      return renderFileInput(props);

    case ValidJobInputTypes.COLOR:
      return renderColorInput(props);

    case ValidJobInputTypes.RANGE:
      return renderRangeInput(props);

    case ValidJobInputTypes.HIDDEN:
      return (
        <Input
          id={id}
          type="hidden"
          value={(data as any).value || ''}
          disabled={disabled}
        />
      );

    case ValidJobInputTypes.RADIO:
      return renderRadioInput(props);

    default:
      return <div>Unsupported input type: {type}</div>;
  }
}
