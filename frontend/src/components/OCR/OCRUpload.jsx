import { useCallback, useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Loader2, Camera, FileImage } from 'lucide-react'
import Tesseract from 'tesseract.js'

export default function OCRUpload({ onExtract }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const onDrop = useCallback((accepted) => {
    if (accepted && accepted[0]) {
      const f = accepted[0]
      setFile(f)
      setResult(null)
      setError(null)
      const url = URL.createObjectURL(f)
      setPreview(url)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    },
    multiple: false,
  })

  const zoneClass = useMemo(() => (
    `border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center transition ` +
    (isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-slate-700' : 'border-slate-300 dark:border-slate-600')
  ), [isDragActive])

  const scan = async () => {
    if (!file) return
    setLoading(true)
    setProgress(0)
    setError(null)
    try {
      const { data } = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text' && m.progress) setProgress(Math.round(m.progress * 100))
        }
      })
      const text = data.text || ''
      // Very simple heuristics. Can be improved later.
      const amountMatch = text.match(/(?:total|amt|amount)\s*[:\-]?\s*([0-9]+(?:\.[0-9]{1,2})?)/i) || text.match(/\b([0-9]+(?:\.[0-9]{1,2})?)\b/)
      const dateMatch = text.match(/(\d{4}[\/-]\d{1,2}[\/-]\d{1,2}|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/)
      const merchantMatch = text.split('\n').find(l => /inc|llc|ltd|mart|store|hotel|restaurant|cafe|shop/i.test(l))
      const lines = text.split('\n').filter(l => l.trim().length > 0).slice(0, 20)

      const extracted = {
        amount: amountMatch ? Number(amountMatch[1]) : '',
        date: dateMatch ? new Date(dateMatch[1]).toISOString().slice(0,10) : '',
        description: merchantMatch || lines[0] || 'Expense',
        category: /meal|food|restaurant|cafe/i.test(text) ? 'Meals' : (/travel|uber|taxi|flight|hotel/i.test(text) ? 'Travel' : ''),
        merchant: merchantMatch || '',
        lines,
      }
      setResult(extracted)
      onExtract && onExtract(extracted)
    } catch (e) {
      setError('Failed to scan receipt')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg p-4 shadow">
      <div {...getRootProps({ className: zoneClass })}>
        <input {...getInputProps()} />
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <Camera size={18} />
          <span>Drag & drop receipt or click to upload (JPG, PNG, PDF)</span>
        </div>
        {preview && (
          <div className="mt-3 w-full max-h-48 overflow-hidden rounded-md border dark:border-slate-600">
            <img src={preview} alt="preview" className="w-full object-contain" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button onClick={scan} disabled={!file || loading} className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-2">
          {loading ? <Loader2 className="animate-spin" size={16} /> : <FileImage size={16} />}
          Scan Receipt
        </button>
        {loading && (
          <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded">
            <div className="h-2 bg-blue-600 rounded" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      {result && (
        <div className="mt-3 text-sm text-slate-700 dark:text-slate-200">
          <div className="font-medium">Extracted:</div>
          <pre className="mt-1 whitespace-pre-wrap text-xs bg-slate-50 dark:bg-slate-900 p-2 rounded border dark:border-slate-700">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
