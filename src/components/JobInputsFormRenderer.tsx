import React, { useState, useEffect } from 'react';
import JobInputRenderer from './JobInputRenderer';
import { JobInputSchemaType, getDefaultValue } from '../lib/job-input-schema';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for merging class names
export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// --- Simplified UI Components embedded for library portability ---
// In a real scenario, you might want to accept these as props or peer dependencies,
// but for a self-contained library that uses Tailwind, we can provide simple versions.

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link' }>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: "bg-gray-900 dark:bg-gray-100 text-gray-100 dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200",
      outline: "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700",
      destructive: "bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-800",
      secondary: "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600",
      ghost: "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100",
      link: "text-gray-900 dark:text-gray-100 underline-offset-4 hover:underline",
    };
    
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm", className)} {...props} />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const Separator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("shrink-0 bg-gray-200 dark:bg-gray-700 h-[1px] w-full", className)} {...props} />
));
Separator.displayName = "Separator";

// --- Main Component ---

export interface JobInputsFormRendererProps {
  jobInputSchemas: JobInputSchemaType[];
  onFormDataChange?: (
    formData: Record<string, string | number | boolean | number[] | null>,
  ) => void;
  disabled?: boolean;
  className?: string;
}

export default function JobInputsFormRenderer({
  jobInputSchemas,
  onFormDataChange,
  disabled = false,
  className,
}: JobInputsFormRendererProps) {
  const [formData, setFormData] = useState<
    Record<string, string | number | boolean | number[] | null>
  >({});

  // Initialize form data with default values
  useEffect(() => {
    const initialData: Record<
      string,
      string | number | boolean | number[] | null
    > = {};
    jobInputSchemas.forEach((schema) => {
      initialData[schema.id] = getDefaultValue(schema);
    });
    setFormData(initialData);
    // Intentionally omitting jobInputSchemas from dependency array to prevent infinite loops 
    // if the array reference changes on every render from the parent.
    // We really only want to reset when the *content* of schemas changes significantly 
    // or on mount, but basic array comparison is reference-based.
    // A better approach would be to use a JSON.stringify comparison or just let parent handle keying.
    // For now, we will depend on JSON.stringify(jobInputSchemas) to detect actual changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(jobInputSchemas)]);

  // Notify parent of form data changes
  useEffect(() => {
    if (onFormDataChange) {
      onFormDataChange(formData);
    }
  }, [formData, onFormDataChange]);

  const handleFieldChange = (
    fieldId: string,
    value: string | number | boolean | number[] | null,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleClear = () => {
    const clearedData: Record<
      string,
      string | number | boolean | number[] | null
    > = {};
    jobInputSchemas.forEach((schema) => {
      clearedData[schema.id] = getDefaultValue(schema);
    });
    setFormData(clearedData);
  };

  if (jobInputSchemas.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            No input fields defined in the schema.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-gray-50/50 dark:bg-gray-800/50", className)}>
      <CardContent className="space-y-6 pt-6">
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {jobInputSchemas.map((schema, index) => (
            <div key={schema.id} className="space-y-0">
              <JobInputRenderer
                jobInputSchema={schema}
                value={formData[schema.id]}
                onChange={(value) => handleFieldChange(schema.id, value)}
                disabled={disabled}
              />
              {index < jobInputSchemas.length - 1 && (
                <Separator className="mt-6" />
              )}
            </div>
          ))}
        </form>

        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            disabled={disabled}
          >
            Clear Form
          </Button>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            {Object.keys(formData).length} field
            {Object.keys(formData).length !== 1 ? 's' : ''}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

