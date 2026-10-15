import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

// ----- Find the mount point -----
// index.html provides the #root element where React will render the interface.
const rootElement = document.getElementById('root');

// ----- Start the React application -----
// Fail clearly if the HTML entry point is missing its required root element.
if (!rootElement) {
  throw new Error('Root element "#root" was not found.');
}

// StrictMode helps identify potential problems during development.
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
