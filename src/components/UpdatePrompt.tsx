import { useRegisterSW } from 'virtual:pwa-register/react'

export default function UpdatePrompt() {
  const registration = useRegisterSW({
    onRegistered(reg) {
      if (reg) {
        window.setInterval(() => {
          void reg.update()
        }, 60 * 60 * 1000)
      }
    },
    onRegisterError(error) {
      console.warn('SW register failed:', error)
    },
  })

  const needRefresh = Boolean(registration?.needRefresh?.[0])
  const setNeedRefresh = registration?.needRefresh?.[1]
  const updateServiceWorker = registration?.updateServiceWorker

  if (!needRefresh) return null

  return (
    <div className="fixed inset-x-0 top-0 z-[60] mx-auto max-w-[430px] bg-emerald-600 px-4 py-3 text-white shadow-lg">
      <p className="text-sm font-medium">发现新版本，请刷新以更新界面</p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => updateServiceWorker?.(true)}
          className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-emerald-700"
        >
          立即刷新
        </button>
        <button
          type="button"
          onClick={() => setNeedRefresh?.(false)}
          className="rounded-lg px-3 py-1.5 text-xs text-emerald-100"
        >
          稍后
        </button>
      </div>
    </div>
  )
}
