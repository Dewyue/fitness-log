import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import { initStorage } from './db'
import './index.css'
import App from './App.tsx'

window.addEventListener('vite:preloadError', () => {
  window.location.reload()
})

function Bootstrap() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    initStorage()
      .then(() => {
        if (!cancelled) setReady(true)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : '存储初始化失败')
        setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        正在初始化…
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <p className="text-lg font-semibold text-red-600">无法使用本地存储</p>
        <p className="mt-2 text-sm text-slate-500">{error}</p>
        <button
          type="button"
          className="mt-4 rounded-xl bg-emerald-500 px-4 py-2 text-sm text-white"
          onClick={() => window.location.reload()}
        >
          重试
        </button>
      </div>
    )
  }

  return <App />
}

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter basename={basename}>
        <Bootstrap />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
