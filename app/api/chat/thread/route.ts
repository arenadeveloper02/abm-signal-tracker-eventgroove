import { NextResponse } from 'next/server'
import { arenaChatHeaders, DEFAULT_CHAT_THREAD_API_URL, readEmailAndId } from '@/lib/arena-chat'

export const dynamic = 'force-dynamic'

export async function POST(request: Request): Promise<NextResponse> {
  const url = process.env.CHAT_THREAD_API_URL || DEFAULT_CHAT_THREAD_API_URL
  let email = ''
  let id = ''
  try {
    const body = (await request.json()) as unknown
    const parsed = readEmailAndId(body)
    email = parsed.email
    id = parsed.id
  } catch {
    email = ''
    id = ''
  }
  if (!id) {
    return NextResponse.json({ error: 'Chat id is required' }, { status: 400 })
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: arenaChatHeaders(),
      cache: 'no-store',
      body: JSON.stringify({
        email,
        id,
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
    return NextResponse.json({ error: 'Failed to reach the chat thread API' }, { status: 502 })
  }
}
