// Placeholder for JobInputRenderer component
// This will be replaced by the actual content if provided, 
// or we need to request it. 
// Based on imports in JobInputsFormRenderer, this file is expected to exist.

import React from 'react';
import { JobInputSchemaType, ValidJobInputTypes } from '../lib/job-input-schema';

// Simple UI Components for the renderer
import { cn } from './JobInputsFormRenderer';

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(({ className, ...props }, ref) => (
  <label ref={ref} className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block text-gray-900 dark:text-gray-100", className)} {...props} />
));
Label.displayName = "Label";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm ring-offset-white dark:ring-offset-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:focus-visible:ring-gray-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      // File input specific styling - remove border and padding
      type === 'file' && "border-0 p-0 bg-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-200 hover:file:bg-gray-200 dark:hover:file:bg-gray-600 file:cursor-pointer file:transition-colors",
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex min-h-[80px] w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm ring-offset-white dark:ring-offset-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:focus-visible:ring-gray-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";

const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
    <input type="checkbox" ref={ref} className={cn("h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-gray-400 dark:focus:ring-gray-500 focus:ring-2", className)} {...props} />
));
Checkbox.displayName = "Checkbox";


export interface JobInputRendererProps {
  jobInputSchema: JobInputSchemaType;
  value: string | number | boolean | number[] | null;
  onChange: (value: string | number | boolean | number[] | null) => void;
  disabled?: boolean;
}

export default function JobInputRenderer({
  jobInputSchema,
  value,
  onChange,
  disabled,
}: JobInputRendererProps) {
  const { id, name, type, data } = jobInputSchema;
  const description = data?.description;
  const placeholder = 'placeholder' in (data || {}) ? (data as any).placeholder : '';

  const renderInput = () => {
    switch (type) {
      case ValidJobInputTypes.STRING:
        return (
          <Input
            id={id}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
          />
        );
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
      case ValidJobInputTypes.BOOLEAN:
        return (
          <div className="flex items-center gap-2">
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
                {placeholder || 'Yes'}
            </label>
          </div>
        );
      case ValidJobInputTypes.OPTION:
          const options = (data as any).values || [];
        return (
           <select
            id={id}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={Array.isArray(value) && value.length > 0 ? value[0] : ''} // Simple single select for now
            onChange={(e) => {
                 // Assuming single select maps to index for now based on schema definition or simple value
                 // The schema definition says number[] for value, suggesting indices
                 // But let's verify logic.
                 // For now, just passing index if possible or finding index
                 const selectedIndex = options.indexOf(e.target.value);
                 onChange(selectedIndex >= 0 ? [selectedIndex] : []);
            }}
            disabled={disabled}
           >
               <option value="">Select...</option>
               {options.map((opt: string) => (
                   <option key={opt} value={opt}>{opt}</option>
               ))}
           </select>
        );
       case ValidJobInputTypes.FILE:
        return (
            <Input
                id={id}
                type="file"
                disabled={disabled}
                onChange={() => {
                    // File handling logic would go here
                    // For now, just a placeholder
                }}
            />
        )
      default:
        return <div>Unsupported input type: {type}</div>;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col space-y-1">
        <Label htmlFor={id}>
          {name}
          {'validations' in jobInputSchema && jobInputSchema.validations?.some((v: any) => v.validation === 'optional' && v.value === 'true') && 
            <span className="text-muted-foreground font-normal ml-1">(Optional)</span>
          }
        </Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {renderInput()}
    </div>
  );
}

