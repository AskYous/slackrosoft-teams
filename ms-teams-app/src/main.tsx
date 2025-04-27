import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import validateEnv from './utils/validateEnv.ts'

// Validate environment variables
validateEnv();

console.log('Starting application...');

try {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error('Root element not found!');
    throw new Error('Root element not found');
  }

  console.log('Creating React root...');
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  console.log('React application rendered');
} catch (error) {
  console.error('Failed to render application:', error);
  // Display a visible error on the page
  document.body.innerHTML = `
    <div style="padding: 20px; color: red; font-family: sans-serif;">
      <h1>Application Error</h1>
      <p>Failed to start the application. Please check the console for details.</p>
      <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
    </div>
  `;
}
