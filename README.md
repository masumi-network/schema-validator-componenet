# schema-validator-component

React component that allows you to dynamically validate input schema and see how it would render in Sokosumi.

## Installation

```bash
npm install @masumi/schema-validator
```

## Prerequisites

This library is built with **Tailwind CSS** and relies on specific CSS variables (compatible with [shadcn/ui](https://ui.shadcn.com/)). 

### 1. Tailwind Configuration

You must add this package to your `tailwind.config.js` content array so Tailwind can scan for class names:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    // ... your other paths
    "./node_modules/@masumi/schema-validator/dist/**/*.{js,mjs}"
  ],
  // ...
}
```

### 2. CSS Variables

Your application must define the standard `shadcn/ui` CSS variables (e.g., `--primary`, `--background`, `--foreground`) in your global CSS file for the component to be styled correctly.

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
