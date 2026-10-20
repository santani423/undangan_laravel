import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { asset, TEXTURES } from './config/assets'
import './index.css'

// Batik tiles from the asset pack, resolved against the deploy base for CSS backgrounds.
document.documentElement.style.setProperty('--tex-kawung', `url("${asset(TEXTURES.kawung)}")`)
document.documentElement.style.setProperty('--tex-parang', `url("${asset(TEXTURES.parang)}")`)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
