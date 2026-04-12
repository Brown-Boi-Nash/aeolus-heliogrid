import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ui/ErrorBoundary.jsx'

try {
  const savedTheme = localStorage.getItem('aeolus-theme')
  const resolvedTheme = savedTheme === 'dark' || savedTheme === 'light'
    ? savedTheme
    : (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

  document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
  document.documentElement.style.colorScheme = resolvedTheme
} catch {}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
