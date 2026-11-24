import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './editor/App';
import './index.css';
import { useStore } from './store';

// Handy for debugging and automated browser tests: window.__sfub.getState()
if (import.meta.env.DEV) (window as any).__sfub = useStore;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
