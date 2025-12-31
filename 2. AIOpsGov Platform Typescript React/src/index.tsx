/**
 * Application Entry Point
 * Renders the main App component
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import './app/App.css';
import './assets/styles/aiopsgov-theme.css';

// Get root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Make sure index.html has a <div id="root"></div>');
}

// Create root and render app
const root = ReactDOM.createRoot(rootElement);

root.render(
  <App />
);
