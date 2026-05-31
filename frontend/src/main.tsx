import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { preloadEphemeris } from './lib/core/ephemeris'
import './index.css'

// Start fetching the Swiss Ephemeris WASM immediately so the first chart
// calculation doesn't have to wait for the ~12 MB data file.
preloadEphemeris().catch(err => console.error('Ephemeris preload failed:', err))

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
