import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import JobInputsFormRenderer from './JobInputsFormRenderer';
import { validateSchemaWithZod } from '../lib/validation';
import { cn } from './JobInputsFormRenderer';
import SchemaBuilder from './SchemaBuilder';

type EditorMode = 'json' | 'builder';

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
  const [editorMode, setEditorMode] = useState<EditorMode>('json');
  
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

  // Re-validate whenever schemaInput changes
  const validationResult = React.useMemo(() => {
    try {
      const result = validateSchemaWithZod(schemaInput);
      // Ensure errors is always an array
      if (!Array.isArray(result.errors)) {
        console.warn('⚠️ Errors is not an array!', result.errors);
        return { ...result, errors: [] };
      }
      
      return result;
    } catch (error) {
      console.error('❌ Validation error:', error);
      return {
        valid: false,
        errors: [{ message: 'Failed to validate schema: ' + (error as Error).message }],
        parsedSchemas: undefined
      };
    }
  }, [schemaInput]);

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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">1. Schema Definition</h2>
          
          {/* Mode toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setEditorMode('json')}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                editorMode === 'json'
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              JSON Editor
            </button>
            <button
              type="button"
              onClick={() => setEditorMode('builder')}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                editorMode === 'builder'
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              Visual Builder
            </button>
          </div>
        </div>
        
        <div className={cn(
          "flex-1 relative border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 flex flex-col",
          editorMode === 'json' ? "overflow-hidden" : "overflow-visible"
        )}>
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              {editorMode === 'json' && examples.length > 0 && (
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
              {editorMode === 'builder' && (
                <span className="text-xs text-gray-500 dark:text-gray-400">Add and configure fields visually</span>
              )}
            </div>
            <div className={`text-xs px-2 py-1 rounded-full font-medium ${validationResult.valid ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
              {validationResult.valid ? 'Valid Schema' : 'Invalid Schema'}
            </div>
          </div>

          {/* Editor / Builder content */}
          {editorMode === 'json' ? (
            <div className="flex-1">
              <Editor
                height="100%"
                defaultLanguage="json"
                theme={isDarkMode ? 'vs-dark' : 'vs-light'}
                value={schemaInput}
                onChange={(value) => {
                  setSchemaInput(value || '');
                  if (examples.length > 0) {
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
          ) : (
            <div className="flex-1 overflow-visible p-4">
              <SchemaBuilder
                schemaInput={schemaInput}
                onSchemaChange={(newSchema) => {
                  setSchemaInput(newSchema);
                  setSelectedExample('');
                }}
                className="h-full"
              />
            </div>
          )}
          
          {!validationResult.valid && (
            <div className="border-t-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 p-4 text-sm max-h-60 overflow-y-auto z-10 relative">
              {validationResult.errors && Array.isArray(validationResult.errors) && validationResult.errors.length > 0 ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="font-bold text-red-800 dark:text-red-200 text-base">
                      Validation Errors ({validationResult.errors.length})
                    </p>
                  </div>
                  <ul className="list-disc pl-6 space-y-2.5 text-red-700 dark:text-red-200">
                    {validationResult.errors.map((err, i) => (
                      <li key={i} className="break-words leading-relaxed">
                        {err.line ? (
                          <span className="font-mono bg-red-100 dark:bg-red-800/50 text-red-900 dark:text-red-100 px-2 py-0.5 rounded mr-2 text-xs font-semibold">
                            line {err.line}
                          </span>
                        ) : null}
                        <span className="text-sm">{err.message}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-yellow-800 dark:text-yellow-200 font-semibold mb-1">
                      Schema is invalid but no specific errors were detected.
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-300 text-xs">
                      Debug info: valid={String(validationResult.valid)}, errors={validationResult.errors ? String(validationResult.errors.length) : 'undefined'}
                    </p>
                  </div>
                </div>
              )}
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
            <div className="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 overflow-hidden flex flex-col">
              <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 p-4">
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-1">Preview Unavailable</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Fix schema errors to see the form</p>
                </div>
              </div>
              
              {validationResult.errors && Array.isArray(validationResult.errors) && validationResult.errors.length > 0 && (
                <div className="border-t-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 p-4 max-h-60 overflow-y-auto">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="font-bold text-red-800 dark:text-red-200 text-base">
                      Validation Errors ({validationResult.errors.length})
                    </p>
                  </div>
                  <ul className="list-disc pl-6 space-y-2.5 text-red-700 dark:text-red-200">
                    {validationResult.errors.map((err, i) => (
                      <li key={i} className="break-words leading-relaxed text-sm">
                        {err.line ? (
                          <span className="font-mono bg-red-100 dark:bg-red-800/50 text-red-900 dark:text-red-100 px-2 py-0.5 rounded mr-2 text-xs font-semibold">
                            line {err.line}
                          </span>
                        ) : null}
                        <span>{err.message}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

