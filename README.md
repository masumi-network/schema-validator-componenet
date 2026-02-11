# Masumi Schema Validator Component

A React component library for validating and previewing job input schemas for the Masumi platform. This component provides a playground interface where you can write, validate, and preview how input schemas will render as forms.

## Features

- ✅ **Schema Validation**: Real-time validation of JSON schemas against the Masumi Job Input Schema specification
- 🎨 **Live Preview**: See how your schema renders as a form in real-time
- 📝 **Monaco Editor**: Syntax-highlighted JSON editor with error detection
- 🔍 **Detailed Error Messages**: Clear validation errors with line numbers and helpful suggestions
- 🌓 **Dark Mode Support**: Automatic theme detection and support
- 📦 **TypeScript**: Fully typed with TypeScript definitions
- 🎯 **Multiple Schema Formats**: Supports wrapped format, array format, and single schema format

## Installation

```bash
npm install masumi-schema-validator-component
```

### Peer Dependencies

This package requires the following peer dependencies:

- `react` >= 18
- `react-dom` >= 18
- `tailwindcss` >= 3

## Quick Start

```tsx
import { SchemaPlayground } from 'masumi-schema-validator-component';

function App() {
  const examples = [
    {
      label: 'Simple Form',
      value: JSON.stringify([
        {
          id: 'name',
          type: 'text',
          name: 'Full Name',
          data: {
            placeholder: 'Enter your name'
          }
        }
      ])
    }
  ];

  return (
    <SchemaPlayground
      initialSchema="[]"
      examples={examples}
      onSchemaChange={(schema, isValid) => {
        console.log('Schema changed:', schema, 'Valid:', isValid);
      }}
    />
  );
}
```

## Components

### SchemaPlayground

The main component that provides a split-pane interface with a schema editor on the left and form preview on the right.

#### Props

```typescript
interface SchemaPlaygroundProps {
  initialSchema?: string;           // Initial JSON schema string (default: '[]')
  examples?: Array<{                 // Array of example schemas to load
    label: string;
    value: string;
  }>;
  className?: string;               // Additional CSS classes
  onSchemaChange?: (                // Callback when schema changes
    schema: string,
    isValid: boolean
  ) => void;
}
```

#### Example

```tsx
<SchemaPlayground
  initialSchema={mySchema}
  examples={[
    { label: 'Example 1', value: '[...]' },
    { label: 'Example 2', value: '[...]' }
  ]}
  onSchemaChange={(schema, isValid) => {
    if (isValid) {
      // Save valid schema
    }
  }}
/>
```

### JobInputsFormRenderer

Renders a form based on validated job input schemas. This component is used internally by `SchemaPlayground` but can also be used standalone.

#### Props

```typescript
interface JobInputsFormRendererProps {
  jobInputSchemas: JobInputSchemaType[];
  onFormDataChange?: (
    formData: Record<string, string | number | boolean | number[] | null>
  ) => void;
  disabled?: boolean;
  className?: string;
}
```

#### Example

```tsx
import { JobInputsFormRenderer } from 'masumi-schema-validator-component';

<JobInputsFormRenderer
  jobInputSchemas={validatedSchemas}
  onFormDataChange={(data) => {
    console.log('Form data:', data);
  }}
/>
```

## Schema Format

The component validates schemas according to the Masumi Job Input Schema specification. Schemas can be provided in three formats:

### 1. Wrapped Format
```json
{
  "input_data": [
    {
      "id": "field1",
      "type": "text",
      "name": "Field 1"
    }
  ]
}
```

### 2. Array Format
```json
[
  {
    "id": "field1",
    "type": "text",
    "name": "Field 1"
  }
]
```

### 3. Single Schema Format
```json
{
  "id": "field1",
  "type": "text",
  "name": "Field 1"
}
```

## Supported Input Types

- `text` - Single-line text input
- `textarea` - Multi-line text input
- `number` - Number input
- `email` - Email input with validation
- `password` - Password input
- `tel` - Telephone number input
- `url` - URL input
- `date` - Date picker
- `datetime-local` - Date and time picker
- `time` - Time picker
- `month` - Month picker
- `week` - Week picker
- `color` - Color picker
- `range` - Range slider
- `file` - File upload
- `option` - Select dropdown (single or multi-select)
- `checkbox` - Checkbox input
- `radio` - Radio button group
- `boolean` - Boolean toggle
- `hidden` - Hidden field
- `search` - Search input
- `none` - No input (display only)

## Validations

Schemas can include validation rules:

```json
{
  "id": "email",
  "type": "email",
  "name": "Email",
  "validations": [
    { "validation": "format", "value": "email" },
    { "validation": "min", "value": "5" },
    { "validation": "max", "value": "100" },
    { "validation": "optional" }
  ]
}
```

### Supported Validation Types

- `min` - Minimum length or value
- `max` - Maximum length or value
- `format` - Format validation (email, url, non-empty, integer)
- `optional` - Makes the field optional
- `accept` - File type acceptance (for file inputs)

## Validation API

### validateSchemaWithZod

Validates a JSON schema string and returns validation results.

```typescript
import { validateSchemaWithZod } from 'masumi-schema-validator-component';

const result = validateSchemaWithZod(schemaString);

if (result.valid) {
  console.log('Valid schemas:', result.parsedSchemas);
} else {
  console.log('Errors:', result.errors);
  // Errors include line numbers and helpful messages
}
```

#### Return Type

```typescript
interface ValidationResult {
  valid: boolean;
  errors: { message: string; line?: number }[];
  parsedSchemas?: JobInputSchemaType[];
}
```

## Development

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build library
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

### Project Structure

```
src/
  components/
    SchemaPlayground.tsx      # Main playground component
    JobInputsFormRenderer.tsx # Form renderer component
    JobInputRenderer.tsx      # Individual input renderer
  lib/
    validation.ts              # Schema validation logic
    job-input-schema.ts        # Schema type definitions
  dev/
    main.tsx                  # Development app
    examples.ts               # Example schemas
    styles.css                # Global styles
  index.ts                    # Main exports
```

## Styling

This component uses Tailwind CSS for styling. Make sure Tailwind CSS is configured in your project. The component includes its own minimal UI components but relies on Tailwind for styling.

### Tailwind Configuration

**Important**: To ensure all styles (including dark mode variants) are properly generated, you must configure Tailwind to scan the component's TypeScript/JavaScript files. Add the following to your CSS file (e.g., `global.css` or `app.css`):

```css
@import 'tailwindcss';

/* Ensure Tailwind scans external schema validator classes (including dark variants) */
@source "../node_modules/masumi-schema-validator-component/dist/index.mjs";
@source "../node_modules/masumi-schema-validator-component/dist/index.js";
```

This ensures that Tailwind generates all necessary utility classes used by the component, including dark mode variants like `dark:bg-red-900/30`, `dark:text-red-200`, etc.

## TypeScript

Full TypeScript support is included. All components and functions are fully typed:

```typescript
import type {
  JobInputSchemaType,
  ValidationResult,
  SchemaPlaygroundProps,
  JobInputsFormRendererProps
} from 'masumi-schema-validator-component';
```

## License

See LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
