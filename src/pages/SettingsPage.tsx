import { useEffect, useRef, useState } from 'react'
import { clearAllCheckIns, getStorageBackend, notifyLocalStorageChange } from '../db'
import {
  copyBackupToClipboard,
  downloadBackup,
  exportBackup,
  importBackup,
  importBackupFromText,
} from '../lib/backup'

export default function SettingsPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge')
  const [busy, setBusy] = useState(false)
  const [storageBackend, setStorageBackend] = useState('')
  const [pasteText, setPasteText] = useState('')

  useEffect(() => {
    setStorageBackend(getStorageBackend())
  }, [])

  const showMessage = (text: string) => {
    setMessage(text)
    setTimeout(() => setMessage(''), 4000)
  }

  const handleExport = async () => {
    setBusy(true)
    try {
      const data = await exportBackup()
      downloadBackup(data)
      showMessage(`已导出 ${data.checkIns.length} 条记录`)
    } finally {
      setBusy(false)
    }
  }

  const handleCopy = async () => {
    setBusy(true)
    try {
      const count = await copyBackupToClipboard()
      showMessage(`已复制 ${count} 条记录到剪贴板，可在另一设备粘贴导入`)
    } catch (err) {
      showMessage(err instanceof Error ? err.message : '复制失败，请改用导出文件')
    } finally {
      setBusy(false)
    }
  }

  const handlePasteImport = async () => {
    if (!pasteText.trim()) {
      showMessage('请先粘贴备份数据')
      return
    }
    setBusy(true)
    try {
      const count = await importBackupFromText(pasteText, importMode)
      setPasteText('')
      showMessage(`已导入 ${count} 条记录`)
    } catch (err) {
      showMessage(err instanceof Error ? err.message : '导入失败')
    } finally {
      setBusy(false)
    }
  }

  const handleClipboardImport = async () => {
    setBusy(true)
    try {
      const text = await navigator.clipboard.readText()
      const count = await importBackupFromText(text, importMode)
      showMessage(`已从剪贴板导入 ${count} 条记录`)
    } catch (err) {
      showMessage(err instanceof Error ? err.message : '读取剪贴板失败，请手动粘贴到下方文本框')
    } finally {
      setBusy(false)
    }
  }

  const handleImport = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    try {
      const count = await importBackup(file, importMode)
      showMessage(`已导入 ${count} 条记录`)
    } catch (err) {
      showMessage(err instanceof Error ? err.message : '导入失败')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleClear = async () => {
    if (!confirm('确定清空所有打卡数据？此操作不可恢复，建议先导出备份。')) return
    if (!confirm('再次确认：将删除全部本地数据。')) return
    await clearAllCheckIns()
    notifyLocalStorageChange()
    showMessage('已清空所有数据')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold">数据管理</h1>
        <p className="mt-1 text-sm text-slate-500">
          数据保存在本机浏览器
          {storageBackend && `（${storageBackend === 'indexeddb' ? 'IndexedDB' : 'localStorage'}）`}
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
        <p className="font-medium">手机和电脑不会自动同步</p>
        <p className="mt-1 text-xs leading-relaxed opacity-90">
          每台设备的数据各自存在本机浏览器里。要在手机与电脑之间同步，请在一端「复制/导出」后，在另一端「粘贴/导入」。建议使用「合并导入」保留两边记录。
        </p>
      </div>

      {message && (
        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          {message}
        </div>
      )}

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="font-medium">跨设备同步（推荐）</h2>
        <p className="text-sm text-slate-500">
          手机端：复制数据 → 发到电脑（微信/备忘录）→ 电脑端粘贴导入。
        </p>

        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-700">
          <button
            type="button"
            onClick={() => setImportMode('merge')}
            className={[
              'flex-1 rounded-lg py-2 text-sm',
              importMode === 'merge' ? 'bg-white shadow dark:bg-slate-600' : '',
            ].join(' ')}
          >
            合并导入
          </button>
          <button
            type="button"
            onClick={() => setImportMode('replace')}
            className={[
              'flex-1 rounded-lg py-2 text-sm',
              importMode === 'replace' ? 'bg-white shadow dark:bg-slate-600' : '',
            ].join(' ')}
          >
            覆盖导入
          </button>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          disabled={busy}
          className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          复制全部数据到剪贴板
        </button>

        <button
          type="button"
          onClick={handleClipboardImport}
          disabled={busy}
          className="w-full rounded-xl border border-slate-200 py-3 text-sm font-medium dark:border-slate-600 disabled:opacity-50"
        >
          从剪贴板导入
        </button>

        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="或将备份 JSON 粘贴到这里…"
          rows={4}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900"
        />
        <button
          type="button"
          onClick={handlePasteImport}
          disabled={busy || !pasteText.trim()}
          className="w-full rounded-xl border border-emerald-300 py-3 text-sm font-medium text-emerald-700 disabled:opacity-50 dark:border-emerald-800 dark:text-emerald-300"
        >
          从文本框导入
        </button>
      </section>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="font-medium">文件备份</h2>
        <p className="text-sm text-slate-500">下载或选择 JSON 文件备份。</p>
        <button
          type="button"
          onClick={handleExport}
          disabled={busy}
          className="w-full rounded-xl bg-slate-900 py-3 text-sm font-medium text-white disabled:opacity-50 dark:bg-slate-700"
        >
          导出 JSON 文件
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => handleImport(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="w-full rounded-xl border border-slate-200 py-3 text-sm font-medium dark:border-slate-600 disabled:opacity-50"
        >
          选择 JSON 文件导入
        </button>
      </section>

      <section className="space-y-3 rounded-xl border border-red-200 bg-white p-4 dark:border-red-900/50 dark:bg-slate-800">
        <h2 className="font-medium text-red-600">危险操作</h2>
        <button
          type="button"
          onClick={handleClear}
          className="w-full rounded-xl border border-red-300 py-3 text-sm font-medium text-red-600 dark:border-red-800"
        >
          清空所有数据
        </button>
      </section>

      <p className="text-center text-xs text-slate-400">健身打卡 · 本地存储 · 数据归你所有</p>
    </div>
  )
}
