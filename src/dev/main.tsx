import React from 'react';
import ReactDOM from 'react-dom/client';
import SchemaPlayground from '../components/SchemaPlayground';
import { EXAMPLES } from './examples';
import './styles.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Schema Validator Playground</h1>
          <p className="text-gray-500 dark:text-gray-400">Test your input schemas and form rendering</p>
        </header>

        <div className="h-[calc(100vh-180px)]">
           <SchemaPlayground 
             initialSchema={EXAMPLES[0].value}
             examples={EXAMPLES}
           />
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
