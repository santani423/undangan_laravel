import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Self-hosted, latin-only font subsets (OFL licensed).
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/cormorant-garamond/latin-600.css';
import '@fontsource/great-vibes/latin-400.css';
import '@fontsource/jost/latin-400.css';
import '@fontsource/jost/latin-500.css';
import './styles/index.css';
import App from './App';

const root = document.getElementById('root');
if (!root) throw new Error('Elemen #root tidak ditemukan');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
