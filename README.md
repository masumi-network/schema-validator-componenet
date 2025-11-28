# schema-validator-component

React component that allows you to dynamically validate input schema and see how it would render in Sokosumi.

## Installation

```bash
npm install @masumi/schema-validator
```

## Usage

### Component

Import `JobInputsFormRenderer` to render a form based on your schema definition.

```tsx
import { useState } from 'react';
import { JobInputsFormRenderer } from '@masumi/schema-validator';

const MyComponent = () => {
  const [formData, setFormData] = useState({});

  const schemas = [
    {
      id: "name",
      type: "string",
      name: "Full Name",
      data: {
        placeholder: "Enter your full name",
        description: "Your complete name as it appears on official documents"
      },
      validations: [
        { validation: "min", value: "2" }
      ]
    }
    // ... more schema items
  ];

  return (
    <JobInputsFormRenderer
      jobInputSchemas={schemas}
      onFormDataChange={setFormData}
      className="my-custom-class"
    />
  );
};
```

### Schema Validation

You can also use the exported validation utilities to check if your schema JSON is valid before rendering.

```tsx
import { validateSchemaWithZod } from '@masumi/schema-validator';

const schemaJson = `[...]`; // Your JSON string

const result = validateSchemaWithZod(schemaJson);

if (result.valid) {
  console.log("Valid schemas:", result.parsedSchemas);
} else {
  console.error("Validation errors:", result.errors);
}
```
