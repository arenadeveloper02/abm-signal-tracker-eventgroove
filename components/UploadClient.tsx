"use client"

import { useRef, useState } from 'react'
import * as XLSX from 'xlsx'

interface UploadClientProps {
  email: string
  onSaved: () => void
  heading?: string
  description?: string
}

export default function UploadClient({
  email,
  onSaved,
  heading = 'No companies are currently configured',
  description = 'Upload a company list (CSV or XLSX) to start tracking ABM signals. Columns such as Company Name, City, State and Country will be combined automatically.',
}: UploadClientProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState<string[]>([])
  const [parsing, setParsing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const parseFile = async (file: File) => {
    setParsing(true)
    setError(null)
    try {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      if (!sheetName) throw new Error('The file contains no sheets')
      const sheet = workbook.Sheets[sheetName]
      if (!sheet) throw new Error('The file contains no readable sheet')
      const grid = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '', raw: false })
      const cells = grid.map((r) => (Array.isArray(r) ? r : []).map((c) => String(c ?? '').trim()))
      const nonEmpty = cells.filter((r) => r.some((c) => c !== ''))
      if (nonEmpty.length === 0) throw new Error('No rows were found in the file')
      const header = nonEmpty[0].map((c) => c.toLowerCase())
      const nameIdx = header.findIndex((h) => h.includes('company') || h === 'name' || h.includes('organization'))
      const cityIdx = header.findIndex((h) => h.includes('city'))
      const stateIdx = header.findIndex((h) => h.includes('state') || h.includes('region'))
      const countryIdx = header.findIndex((h) => h.includes('country'))
      let parsed: string[]
      if (nameIdx >= 0) {
        parsed = nonEmpty
          .slice(1)
          .map((r) => {
            const parts = [
              r[nameIdx] ?? '',
              cityIdx >= 0 ? r[cityIdx] ?? '' : '',
              stateIdx >= 0 ? r[stateIdx] ?? '' : '',
              countryIdx >= 0 ? r[countryIdx] ?? '' : '',
            ]
            return parts.filter((p) => p !== '').join(',')
          })
          .filter((v) => v !== '')
      } else {
        parsed = nonEmpty.map((r) => r.filter((c) => c !== '').join(',')).filter((v) => v !== '')
      }
      if (parsed.length === 0) throw new Error('No valid company rows were found in the file')
      setRows(parsed)
      setFileName(file.name)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse the file')
      setRows([])
      setFileName('')
    } finally {
      setParsing(false)
    }
  }

  const removeRow = (idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSave = async () => {
    if (rows.length === 0 || saving) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/save-companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, companyDetails: rows }),
      })
      if (!res.ok) throw new Error('Failed to save the company list')
      await res.json()
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save the company list')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="ds-card p-6">
        <h2 className="text-xl font-semibold">{heading}</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--ds-text-secondary)' }}>
          {description}
        </p>

        <div
          className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center"
          style={{
            borderColor: dragging ? 'var(--ds-border-focus)' : 'var(--ds-border-strong)',
            background: dragging ? 'var(--ds-brand-surface)' : 'var(--ds-surface-subtle)',
          }}
          onClick={() => {
            if (inputRef.current) inputRef.current.click()
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            const file = e.dataTransfer.files.item(0)
            if (file) void parseFile(file)
          }}
        >
          <p className="text-sm font-medium">Drag and drop your company file here</p>
          <p className="mt-1 text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>Supported formats: CSV, XLSX</p>
          <button
            type="button"
            className="ds-btn ds-btn-primary mt-4"
            disabled={parsing}
            onClick={(e) => {
              e.stopPropagation()
              if (inputRef.current) inputRef.current.click()
            }}
          >
            {parsing ? 'Parsing...' : 'Upload Companies'}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files ? e.target.files.item(0) : null
              if (file) void parseFile(file)
              e.target.value = ''
            }}
          />
        </div>

        {error ? (
          <p className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--ds-status-error-surface)', color: 'var(--ds-status-error-text)' }}>
            {error}
          </p>
        ) : null}

        {rows.length > 0 ? (
          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">
                {rows.length} companies ready to import{fileName ? ` · ${fileName}` : ''}
              </p>
              <button type="button" className="ds-btn ds-btn-primary" onClick={() => void handleSave()} disabled={saving}>
                {saving ? 'Saving...' : 'Analyze Companies'}
              </button>
            </div>
            <div className="ds-scroll mt-3 max-h-96 overflow-y-auto rounded-lg border" style={{ borderColor: 'var(--ds-border-default)' }}>
              <table className="ds-table w-full">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Company row</th>
                    <th className="text-right">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={`${idx}-${row}`}>
                      <td>{idx + 1}</td>
                      <td className="break-all">{row}</td>
                      <td className="text-right">
                        <button type="button" className="ds-btn ds-btn-secondary ds-btn-sm" onClick={() => removeRow(idx)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  )
}
