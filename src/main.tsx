import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './lib/fonts'; // registra as fontes empacotadas
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
