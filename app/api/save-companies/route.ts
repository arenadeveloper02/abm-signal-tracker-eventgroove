import { NextResponse } from 'next/server'
import { uniqueCompanyRows, MAX_IMPORT_ROWS } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const DEFAULT_SAVE_COMPANIES_API_URL = 'https://agent.thearena.ai/api/workflows/260c7841-b1a9-4e5d-a63a-bee55904eaac/execute'
const DEFAULT_ARENA_API_KEY = 'sk-sim-XIrT-6iI4EYx5gI_FRRu_lGomlXF-qra'

export async function POST(request: Request): Promise<NextResponse> {
  const url = process.env.SAVE_COMPANIES_API_URL || DEFAULT_SAVE_COMPANIES_API_URL
  let email = ''
  let companyDetails: string[] = []
  try {
    const body = (await request.json()) as { email?: unknown; companyDetails?: unknown }
    email = typeof body.email === 'string' ? body.email : ''
    if (Array.isArray(body.companyDetails)) {
      companyDetails = uniqueCompanyRows(
        body.companyDetails.filter((c): c is string => typeof c === 'string' && c.trim() !== '')
      ).slice(0, MAX_IMPORT_ROWS)
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  if (companyDetails.length === 0) {
    return NextResponse.json({ error: 'companyDetails must contain at least one company row' }, { status: 400 })
  }
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    headers['X-API-Key'] = process.env.ARENA_API_KEY || DEFAULT_ARENA_API_KEY
    const res = await fetch(url, {
      method: 'POST',
      headers,
      cache: 'no-store',
      body: JSON.stringify({
        companyDetails,
        email,
        stream: false,
        selectedOutputs: ['updateTable.success', 'insertTable.success'],
      }),
    })
    const text = await res.text()
    let json: unknown
    try {
      json = JSON.parse(text)
    } catch {
      json = { raw: text }
    }
    return NextResponse.json(json, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Failed to reach the save companies API' }, { status: 502 })
  }
}
