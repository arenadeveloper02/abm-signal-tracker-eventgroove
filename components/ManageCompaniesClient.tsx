"use client"

import { useState } from 'react'
import { extractSavedRowId, MAX_IMPORT_ROWS, capImportRows } from '@/lib/utils'
import LoadingOverlay from '@/components/LoadingOverlay'

interface ManageCompaniesClientProps {
  email: string
  savedCompanies: string[]
  onSaved: (rowId: string) => void
}

export default function ManageCompaniesClient({ email, savedCompanies, onSaved }: ManageCompaniesClientProps) {
  const [rows, setRows] = useState<string[]>(() => capImportRows(savedCompanies))
  const [newEntry, setNewEntry] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addRow = () => {
    const value = newEntry.trim()
    if (!value || saving) return
    if (rows.length >= MAX_IMPORT_ROWS) {
      setError(`You can import a maximum of ${MAX_IMPORT_ROWS} companies.`)
      return
    }
    const next = capImportRows([...rows, value])
    if (next.length === rows.length) {
      setError('That company is already in the list.')
      return
    }
    setRows(next)
    setNewEntry('')
    setError(null)
  }

  const removeRow = (idx: number) => {
    if (saving) return
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
        body: JSON.stringify({ email, companyDetails: capImportRows(rows) }),
      })
      if (!res.ok) throw new Error('Failed to save the company list')
      const json: unknown = await res.json()
      const rowId = extractSavedRowId(json)
      onSaved(rowId)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save the company list')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-3 w-full">
      <div className="ds-card p-6">
        <h2 className="text-xl font-semibold">Import Companies</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--ds-text-secondary)' }}>
          Your previously imported companies are listed below. Add new companies or remove existing ones, then save to re-run the analysis.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <input
            type="text"
            className="ds-input w-full max-w-md flex-1"
            placeholder="Add a company (e.g. Acme Inc,San Francisco,CA,USA)"
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addRow()
              }
            }}
            disabled={saving || rows.length >= MAX_IMPORT_ROWS}
          />
          <button type="button" className="ds-btn ds-btn-primary" onClick={addRow} disabled={saving || newEntry.trim() === '' || rows.length >= MAX_IMPORT_ROWS}>
            Add Company
          </button>
        </div>

        {error ? (
          <p className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--ds-status-error-surface)', color: 'var(--ds-status-error-text)' }}>
            {error}
          </p>
        ) : null}

        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">{rows.length} of {MAX_IMPORT_ROWS} companies in the list</p>
            <button type="button" className="ds-btn ds-btn-primary" onClick={() => void handleSave()} disabled={saving || rows.length === 0}>
              {saving ? (
                <>
                  <span className="ds-spinner ds-spinner-sm" />
                  Saving...
                </>
              ) : (
                'Save & Analyze'
              )}
            </button>
          </div>
          {rows.length === 0 ? (
            <p className="mt-3 text-sm" style={{ color: 'var(--ds-text-tertiary)' }}>
              No companies in the list yet. Add at least one company to continue.
            </p>
          ) : (
            <div className="ds-scroll mt-3 max-h-96 overflow-y-auto rounded-lg border" style={{ borderColor: 'var(--ds-border-default)' }}>
              <table className="ds-table w-full">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Companies</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={`${idx}-${row}`}>
                      <td>{idx + 1}</td>
                      <td className="break-all">{row}</td>
                      <td className="text-right">
                        <button type="button" className="ds-btn ds-btn-secondary ds-btn-sm" onClick={() => removeRow(idx)} disabled={saving}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {saving ? <LoadingOverlay message="Saving companies..." /> : null}
    </div>
  )
}
