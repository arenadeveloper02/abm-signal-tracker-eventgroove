import { NextResponse } from 'next/server'
import { asRecord, arenaChatHeaders, DEFAULT_CHAT_SEND_API_URL } from '@/lib/arena-chat'
import { isSseDoneText } from '@/lib/chat'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

function closeChatStream(source: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder()
  let buffer = ''
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = source.getReader()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          controller.enqueue(value)
          buffer += decoder.decode(value, { stream: true })
          if (isSseDoneText(buffer)) break
          if (buffer.length > 16000) buffer = buffer.slice(-4000)
        }
      } finally {
        controller.close()
        await reader.cancel().catch(() => undefined)
      }
    },
  })
}

export async function POST(request: Request): Promise<Response> {
  const url = process.env.CHAT_SEND_API_URL || DEFAULT_CHAT_SEND_API_URL
  let email = ''
  let id = ''
  let input = ''
  try {
    const body = asRecord(await request.json())
    email = typeof body.email === 'string' ? body.email : ''
    id = typeof body.id === 'string' ? body.id.trim() : ''
    input = typeof body.input === 'string' ? body.input : ''
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  if (!input.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  const stream = id.length > 0
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: arenaChatHeaders(true),
      cache: 'no-store',
      body: JSON.stringify({
        email,
        input,
        id,
        stream,
        selectedOutputs: ['agent1.content'],
        includeThinking: false,
        includeToolCalls: false,
      }),
    })

    if (stream) {
      if (!res.body) {
        return NextResponse.json({ error: 'Chat stream returned no body' }, { status: 502 })
      }
      return new Response(closeChatStream(res.body), {
        status: res.status,
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      })
    }

    const text = await res.text()
    let json: unknown
    try {
      json = JSON.parse(text)
    } catch {
      json = { raw: text }
    }
    return NextResponse.json(json, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Failed to reach the chat API' }, { status: 502 })
  }
}
