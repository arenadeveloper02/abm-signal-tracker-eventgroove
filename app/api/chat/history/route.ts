import { NextResponse } from 'next/server'
import { arenaChatHeaders, DEFAULT_CHAT_HISTORY_API_URL, readEmailAndId } from '@/lib/arena-chat'

export const dynamic = 'force-dynamic'

export async function POST(request: Request): Promise<NextResponse> {
  const url = process.env.CHAT_HISTORY_API_URL || DEFAULT_CHAT_HISTORY_API_URL
  let email = ''
  try {
    const body = (await request.json()) as unknown
    email = readEmailAndId(body).email
  } catch {
    email = ''
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: arenaChatHeaders(),
      cache: 'no-store',
      body: JSON.stringify({
        email,
        stream: false,
        selectedOutputs: ['table1.rows'],
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
    return NextResponse.json({ error: 'Failed to reach the chat history API' }, { status: 502 })
  }
}
