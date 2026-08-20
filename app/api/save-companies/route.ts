import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request): Promise<NextResponse> {
  const url = process.env.SAVE_COMPANIES_API_URL
  if (!url) {
    return NextResponse.json({ error: 'SAVE_COMPANIES_API_URL is not configured' }, { status: 500 })
  }
  let email = ''
  let companyDetails: string[] = []
  try {
    const body = (await request.json()) as { email?: unknown; companyDetails?: unknown }
    email = typeof body.email === 'string' ? body.email : ''
    if (Array.isArray(body.companyDetails)) {
      companyDetails = body.companyDetails
        .filter((c): c is string => typeof c === 'string' && c.trim() !== '')
        .map((c) => c.trim())
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  if (companyDetails.length === 0) {
    return NextResponse.json({ error: 'companyDetails must contain at least one company row' }, { status: 400 })
  }
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (process.env.ARENA_API_KEY) headers['X-API-Key'] = process.env.ARENA_API_KEY
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
