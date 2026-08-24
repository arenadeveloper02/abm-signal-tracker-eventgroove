export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  createdAt: string
}

export interface ChatHistoryItem {
  id: string
  title: string
  createdAt: string
}

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function asArr(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function asStr(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return ''
}

function rowData(row: unknown): Record<string, unknown> {
  return asRecord(asRecord(row).data)
}

export function parseChatHistory(payload: unknown): ChatHistoryItem[] {
  const output = asRecord(asRecord(payload).output)
  const rows = asArr(output.rows)
  const items: ChatHistoryItem[] = []
  for (const row of rows) {
    const data = rowData(row)
    const id = asStr(data.id).trim()
    if (!id) continue
    items.push({
      id,
      title: asStr(data.title).trim() || 'Untitled chat',
      createdAt: asStr(data.created_at) || asStr(asRecord(row).createdAt),
    })
  }
  items.sort((a, b) => {
    const ta = new Date(a.createdAt).getTime()
    const tb = new Date(b.createdAt).getTime()
    return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta)
  })
  return items
}

export function parseChatThread(payload: unknown): { messages: ChatMessage[]; signalId: string } {
  const output = asRecord(asRecord(payload).output)
  const rows = asArr(output.rows)
  const messages: ChatMessage[] = []
  let signalId = ''
  for (const [index, row] of rows.entries()) {
    const rec = asRecord(row)
    const data = rowData(row)
    const rowId = asStr(rec.id) || `row-${index}`
    const createdAt = asStr(data.created_at) || asStr(rec.createdAt)
    const nextSignalId = asStr(data.signal_id).trim()
    if (nextSignalId) signalId = nextSignalId
    const input = asStr(data.input).trim()
    const outputText = asStr(data.output).trim()
    if (input) {
      messages.push({ id: `${rowId}-in`, role: 'user', content: input, createdAt })
    }
    if (outputText) {
      messages.push({ id: `${rowId}-out`, role: 'assistant', content: outputText, createdAt })
    }
  }
  return { messages, signalId }
}

export function parseChatSendResponse(payload: unknown): { output: string; signalId: string } {
  const output = asRecord(asRecord(payload).output)
  const row = asRecord(output.row)
  const data = asRecord(row.data)
  const fromRows = asArr(output.rows)[0]
  const rowDataFallback = rowData(fromRows)
  const source = Object.keys(data).length > 0 ? data : rowDataFallback
  return {
    output: asStr(source.output).trim(),
    signalId: asStr(source.signal_id).trim(),
  }
}

export function isSseDoneText(text: string): boolean {
  return (
    text.includes('[DONE]') ||
    /"event"\s*:\s*"final"/.test(text) ||
    /(?:^|\n|\r)event:\s*final\b/i.test(text)
  )
}

export function parseSseChunkLine(line: string): { done: boolean; chunk: string } {
  const trimmed = line.trim()
  if (!trimmed) return { done: false, chunk: '' }
  if (trimmed === '[DONE]' || trimmed.includes('[DONE]')) return { done: true, chunk: '' }
  if (trimmed.startsWith('event:') && trimmed.slice(6).trim() === 'final') {
    return { done: true, chunk: '' }
  }
  if (!trimmed.startsWith('data:')) return { done: false, chunk: '' }
  const payload = trimmed.slice(5).trim()
  if (!payload) return { done: false, chunk: '' }
  if (payload === '[DONE]' || payload === '"[DONE]"') return { done: true, chunk: '' }
  try {
    const json = JSON.parse(payload) as unknown
    if (json === '[DONE]') return { done: true, chunk: '' }
    const rec = asRecord(json)
    if (rec.event === 'final') return { done: true, chunk: asStr(rec.chunk) }
    return { done: isSseDoneText(payload), chunk: asStr(rec.chunk) }
  } catch {
    return { done: isSseDoneText(payload), chunk: '' }
  }
}
