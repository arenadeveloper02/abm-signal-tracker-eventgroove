import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const DEFAULT_ANALYSIS_API_URL = 'https://agent.thearena.ai/api/workflows/99cc0f44-94a2-4e42-8aa5-31656739d857/execute'
const DEFAULT_ARENA_API_KEY = 'sk-sim-XIrT-6iI4EYx5gI_FRRu_lGomlXF-qra'

export async function POST(request: Request): Promise<NextResponse> {
  const url = process.env.ANALYSIS_API_URL || DEFAULT_ANALYSIS_API_URL
  let email = ''
  let rowId = ''
  try {
    const body = (await request.json()) as { email?: unknown; id?: unknown }
    email = typeof body.email === 'string' ? body.email : ''
    rowId = typeof body.id === 'string' ? body.id : ''
  } catch {
    email = ''
    rowId = ''
  }
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    headers['X-API-Key'] = process.env.ARENA_API_KEY || DEFAULT_ARENA_API_KEY
    const res = await fetch(url, {
      method: 'POST',
      headers,
      cache: 'no-store',
      body: JSON.stringify({
        email,
        id: rowId,
        stream: false,
        selectedOutputs: ['function1.result'],
        includeThinking: false,
        includeToolCalls: false,
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
    return NextResponse.json({ error: 'Failed to reach the analysis API' }, { status: 502 })
  }
}
