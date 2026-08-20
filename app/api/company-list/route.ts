import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const DEFAULT_COMPANY_LIST_API_URL = 'https://agent.thearena.ai/api/workflows/0e7886e4-020e-418a-898d-997689d70488/execute'
const DEFAULT_ARENA_API_KEY = 'sk-sim-XIrT-6iI4EYx5gI_FRRu_lGomlXF-qra'

export async function POST(request: Request): Promise<NextResponse> {
  const url = process.env.COMPANY_LIST_API_URL || DEFAULT_COMPANY_LIST_API_URL
  let email = ''
  try {
    const body = (await request.json()) as { email?: unknown }
    email = typeof body.email === 'string' ? body.email : ''
  } catch {
    email = ''
  }
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    headers['X-API-Key'] = process.env.ARENA_API_KEY || DEFAULT_ARENA_API_KEY
    const res = await fetch(url, {
      method: 'POST',
      headers,
      cache: 'no-store',
      body: JSON.stringify({ email, stream: false, selectedOutputs: ['data.rows'] }),
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
    return NextResponse.json({ error: 'Failed to reach the company list API' }, { status: 502 })
  }
}
