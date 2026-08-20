import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request): Promise<NextResponse> {
  const url = process.env.ANALYSIS_API_URL
  if (!url) {
    return NextResponse.json({ error: 'ANALYSIS_API_URL is not configured' }, { status: 500 })
  }
  let email = ''
  try {
    const body = (await request.json()) as { email?: unknown }
    email = typeof body.email === 'string' ? body.email : ''
  } catch {
    email = ''
  }
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (process.env.ARENA_API_KEY) headers['X-API-Key'] = process.env.ARENA_API_KEY
    const res = await fetch(url, {
      method: 'POST',
      headers,
      cache: 'no-store',
      body: JSON.stringify({
        email,
        id: '',
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
