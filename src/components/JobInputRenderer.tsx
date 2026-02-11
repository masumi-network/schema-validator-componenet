import { JobInputSchemaType, ValidJobInputTypes } from '../lib/job-input-schema';
import { Label } from './ui-components';
import { renderInput } from './input-renderers';

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
  const description = data && 'description' in data ? data.description : undefined;
  const placeholder = data && 'placeholder' in data ? (data as any).placeholder : '';

  const renderProps = {
    id,
    value,
    onChange,
    disabled,
    placeholder,
    description,
    jobInputSchema,
    data,
  };

  // Skip label/description for hidden inputs
  if (type === ValidJobInputTypes.HIDDEN) {
    return renderInput(type, renderProps);
  }

  const isOptionalField =
    'validations' in jobInputSchema &&
    jobInputSchema.validations?.some((v: any) => v.validation === 'optional');

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label htmlFor={id} className="flex items-baseline gap-1.5">
          <span>{name}</span>
          {isOptionalField && (
            <span className="text-gray-500 dark:text-gray-400 font-normal text-xs">(Optional)</span>
          )}
        </Label>
        {description && type !== ValidJobInputTypes.BOOLEAN && type !== ValidJobInputTypes.CHECKBOX && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      {renderInput(type, renderProps)}
    </div>
  );
}

