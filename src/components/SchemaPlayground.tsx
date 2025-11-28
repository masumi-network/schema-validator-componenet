import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import JobInputsFormRenderer from './JobInputsFormRenderer';
import { validateSchemaWithZod } from '../lib/validation';
import { cn } from './JobInputsFormRenderer';

export interface SchemaPlaygroundProps {
  initialSchema?: string;
  examples?: Array<{ label: string; value: string }>;
  className?: string;
  onSchemaChange?: (schema: string, isValid: boolean) => void;
}

export default function SchemaPlayground({
  initialSchema = '[]',
  examples = [],
  className,
  onSchemaChange,
}: SchemaPlaygroundProps) {
  const [schemaInput, setSchemaInput] = useState(initialSchema);
  const [selectedExample, setSelectedExample] = useState(examples.length > 0 ? examples[0].label : '');
  const [, setFormData] = useState({});
  
  // Reset form data when schema changes
  useEffect(() => {
    setFormData({});
  }, [schemaInput]);

  // Use effect for initial example selection if provided and initialSchema is not set/matches
  useEffect(() => {
    if (examples.length > 0 && !selectedExample) {
        // If current input matches an example, select it
        const match = examples.find(e => e.value === schemaInput);
        if (match) setSelectedExample(match.label);
    }
  }, [examples, schemaInput, selectedExample]);

  const handleSelectExample = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedExample(val);
    const found = examples.find((ex) => ex.label === val);
    if (found) {
      setSchemaInput(found.value);
    }
  };

  const validationResult = validateSchemaWithZod(schemaInput);

  useEffect(() => {
    if (onSchemaChange) {
        onSchemaChange(schemaInput, validationResult.valid);
    }
  }, [schemaInput, validationResult.valid, onSchemaChange]);

  // Detect dark mode for Monaco Editor
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      const isDark = 
        document.documentElement.classList.contains('dark') ||
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      setIsDarkMode(isDark);
    };

    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Watch for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => checkTheme();
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return (
    <div className={cn("grid grid-cols-2 gap-4 h-full", className)}>
      {/* Left Column: Schema Editor */}
      <div className="flex flex-col gap-4 h-full min-h-[500px]">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">1. Schema Definition (JSON)</h2>
        
        <div className="flex-1 relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm bg-white dark:bg-gray-800 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center gap-2">
             {examples.length > 0 && (
                <>
                 <span className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Load Example:</span>
                  <select
                    className="border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[200px]"
                    value={selectedExample}
                    onChange={handleSelectExample}
                  >
                    {examples.map((ex) => (
                      <option key={ex.label} value={ex.label}>
                        {ex.label}
                      </option>
                    ))}
                  </select>
                </>
             )}
            </div>
            <div className={`text-xs px-2 py-1 rounded-full font-medium ${validationResult.valid ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
              {validationResult.valid ? 'Valid Schema' : 'Invalid Schema'}
            </div>
          </div>

          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="json"
              theme={isDarkMode ? 'vs-dark' : 'vs-light'}
              value={schemaInput}
              onChange={(value) => {
                setSchemaInput(value || '');
                if (examples.length > 0) {
                     // Check if still matches an example, otherwise clear selection
                     const match = examples.find(e => e.value === (value || ''));
                     if (match) {
                         setSelectedExample(match.label);
                     } else {
                         setSelectedExample('');
                     }
                }
              }}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                formatOnPaste: true,
                automaticLayout: true,
              }}
            />
          </div>
          
          {!validationResult.valid && (
            <div className="border-t border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/20 p-4 text-sm max-h-40 overflow-y-auto z-10 relative">
              <p className="font-bold text-red-800 dark:text-red-300 mb-2">Validation Errors:</p>
              <ul className="list-disc pl-5 space-y-1 text-red-700 dark:text-red-300">
                {validationResult.errors.map((err, i) => (
                  <li key={i}>
                    {err.line ? <span className="font-mono bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 px-1 rounded mr-1">line {err.line}</span> : null}
                    {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Preview */}
      <div className="flex flex-col gap-4 h-full overflow-hidden min-h-[500px]">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">2. Form Preview</h2>
        </div>
        
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {validationResult.valid ? (
            <>
              <div className="flex-1 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 p-1">
                {/* Component Preview Wrapper */}
                <JobInputsFormRenderer
                  jobInputSchemas={validationResult.parsedSchemas || []}
                  onFormDataChange={setFormData}
                  className="h-full border-0 shadow-none" 
                />
              </div>
            </>
          ) : (
            <div className="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500">
              <div className="text-center">
                <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Preview Unavailable</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Fix schema errors to see the form</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

