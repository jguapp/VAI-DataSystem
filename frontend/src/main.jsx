// Import the fonts for this project
import '@fontsource/hanken-grotesk/300.css';  // Light
import '@fontsource/hanken-grotesk/400.css';  // Regular
import '@fontsource/hanken-grotesk/500.css';  // Medium
import '@fontsource/hanken-grotesk/600.css';  // SemiBold
import '@fontsource/hanken-grotesk/700.css';  // Bold

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './i18n/index.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
