"use client"

import { useState } from 'react'
import { extractSavedRowId } from '@/lib/utils'

interface ManageCompaniesClientProps {
  email: string
  savedCompanies: string[]
  onSaved: (rowId: string) => void
}

export default function ManageCompaniesClient({ email, savedCompanies, onSaved }: ManageCompaniesClientProps) {
  const [rows, setRows] = useState<string[]>(savedCompanies)
  const [newEntry, setNewEntry] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addRow = () => {
    const value = newEntry.trim()
    if (!value || saving) return
    setRows((prev) => [...prev, value])
    setNewEntry('')
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
        body: JSON.stringify({ email, companyDetails: rows }),
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
            disabled={saving}
          />
          <button type="button" className="ds-btn ds-btn-primary" onClick={addRow} disabled={saving || newEntry.trim() === ''}>
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
            <p className="text-sm font-medium">{rows.length} companies in the list</p>
            <button type="button" className="ds-btn ds-btn-primary" onClick={() => void handleSave()} disabled={saving || rows.length === 0}>
              {saving ? 'Analyzing...' : 'Save & Analyze'}
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
    </div>
  )
}
