import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/600.css';
import '@fontsource/fredoka/700.css';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/600.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';
import './styles/index.css';
import App from './App';
import { invitationConfig } from './config/invitation.config';

// Apply configurable theme colours to the Tailwind design tokens.
const root = document.documentElement;
for (const [name, value] of Object.entries(invitationConfig.theme)) {
  root.style.setProperty(`--color-toy-${name}`, value);
}

// Every visit starts at the gate: the cover must be opened before exploring.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
