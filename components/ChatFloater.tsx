'use client'

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useArenaEmailId } from '@/components/arena-email-provider'
import ChatMarkdown from '@/components/ChatMarkdown'
import { isSseDoneText, parseChatHistory, parseChatSendResponse, parseChatThread, parseSseChunkLine, type ChatHistoryItem, type ChatMessage } from '@/lib/chat'
import { formatDateTime, formatRelative } from '@/lib/utils'

type PanelTab = 'chat' | 'history'

function nextId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

async function readSseStream(res: Response, onChunk: (chunk: string) => void, signal: AbortSignal): Promise<void> {
  if (!res.body) throw new Error('Chat stream returned no body')
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let receivedChunk = false
  let settled = false

  const finish = async (): Promise<void> => {
    if (settled) return
    settled = true
    await reader.cancel().catch(() => undefined)
  }

  await new Promise<void>((resolve, reject) => {
    let idle: ReturnType<typeof setTimeout> | null = null
    const bumpIdle = () => {
      if (!receivedChunk) return
      if (idle) clearTimeout(idle)
      idle = setTimeout(() => {
        void finish().finally(resolve)
      }, 900)
    }
    const fail = (error: unknown) => {
      if (idle) clearTimeout(idle)
      void finish().finally(() => reject(error))
    }
    const onLine = (line: string): boolean => {
      const parsed = parseSseChunkLine(line)
      if (parsed.chunk) {
        receivedChunk = true
        onChunk(parsed.chunk)
        bumpIdle()
      }
      if (parsed.done) {
        if (idle) clearTimeout(idle)
        void finish().finally(resolve)
        return true
      }
      return false
    }

    const pump = (): void => {
      if (signal.aborted) {
        fail(new DOMException('Aborted', 'AbortError'))
        return
      }
      reader
        .read()
        .then(({ done, value }) => {
          if (settled) return
          if (done) {
            if (buffer.trim()) onLine(buffer)
            if (idle) clearTimeout(idle)
            void finish().finally(resolve)
            return
          }
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split(/\r?\n/)
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            if (onLine(line)) return
          }
          if (isSseDoneText(buffer) && onLine(buffer)) return
          bumpIdle()
          pump()
        })
        .catch((error: unknown) => {
          if (settled) return
          fail(error)
        })
    }

    signal.addEventListener('abort', () => fail(new DOMException('Aborted', 'AbortError')), { once: true })
    pump()
  })
}

export default function ChatFloater() {
  const email = useArenaEmailId()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<PanelTab>('chat')
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [signalId, setSignalId] = useState('')
  const [title, setTitle] = useState('New chat')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<ChatHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [threadLoading, setThreadLoading] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const scrollToBottom = useCallback(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, sending, scrollToBottom])

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => inputRef.current?.focus(), 50)
    return () => window.clearTimeout(t)
  }, [open, tab, threadLoading])

  const resetChat = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setMessages([])
    setSignalId('')
    setTitle('New chat')
    setDraft('')
    setError(null)
    setSending(false)
    setThreadLoading(false)
    setTab('chat')
  }, [])

  const loadHistory = useCallback(async () => {
    setHistory([])
    setHistoryError(null)
    setHistoryLoading(true)
    try {
      const res = await fetch('/api/chat/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const json: unknown = await res.json()
      if (!res.ok) throw new Error('Could not load chat history')
      setHistory(parseChatHistory(json))
    } catch (e) {
      setHistoryError(e instanceof Error ? e.message : 'Could not load chat history')
    } finally {
      setHistoryLoading(false)
    }
  }, [email])

  useEffect(() => {
    if (open && tab === 'history') void loadHistory()
  }, [open, tab, loadHistory])

  const openThread = useCallback(
    async (item: ChatHistoryItem) => {
      abortRef.current?.abort()
      abortRef.current = null
      setTab('chat')
      setThreadLoading(true)
      setError(null)
      setSending(false)
      setDraft('')
      setTitle(item.title)
      setSignalId(item.id)
      setMessages([])
      try {
        const res = await fetch('/api/chat/thread', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, id: item.id }),
        })
        const json: unknown = await res.json()
        if (!res.ok) throw new Error('Could not load this conversation')
        const parsed = parseChatThread(json)
        setMessages(parsed.messages)
        setSignalId(parsed.signalId || item.id)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not load this conversation')
      } finally {
        setThreadLoading(false)
      }
    },
    [email]
  )

  const sendMessage = useCallback(async () => {
    const input = draft.trim()
    if (!input || sending || threadLoading) return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const userMessage: ChatMessage = {
      id: nextId('user'),
      role: 'user',
      content: input,
      createdAt: new Date().toISOString(),
    }
    const assistantId = nextId('assistant')
    const conversationId = signalId
    setDraft('')
    setError(null)
    setSending(true)
    setMessages((prev) => [...prev, userMessage])
    if (!conversationId) setTitle(input)

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, input, id: conversationId }),
        signal: controller.signal,
      })
      if (!res.ok) throw new Error('The chat request failed')

      if (conversationId) {
        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: 'assistant', content: '', createdAt: new Date().toISOString() },
        ])
        await readSseStream(
          res,
          (chunk) => {
            setMessages((prev) =>
              prev.map((message) =>
                message.id === assistantId ? { ...message, content: message.content + chunk } : message
              )
            )
          },
          controller.signal
        )
        setMessages((prev) => {
          const last = prev.find((message) => message.id === assistantId)
          if (last && last.content.trim()) return prev
          return prev.map((message) =>
            message.id === assistantId
              ? { ...message, content: 'No response was returned. Try asking again.' }
              : message
          )
        })
      } else {
        const json: unknown = await res.json()
        const parsed = parseChatSendResponse(json)
        if (!parsed.output) throw new Error('No chat output was returned')
        if (parsed.signalId) setSignalId(parsed.signalId)
        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: 'assistant',
            content: parsed.output,
            createdAt: new Date().toISOString(),
          },
        ])
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return
      setError(e instanceof Error ? e.message : 'Failed to send the message')
      setMessages((prev) => prev.filter((message) => message.id !== assistantId || message.content.trim() !== ''))
    } finally {
      if (abortRef.current === controller) abortRef.current = null
      setSending(false)
    }
  }, [draft, email, sending, signalId, threadLoading])

  const onComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void sendMessage()
    }
  }

  const lastMessage = messages[messages.length - 1]
  const waitingForResponse =
    sending && (lastMessage?.role !== 'assistant' || lastMessage.content.trim() === '')

  return (
    <div className="chat-floater">
      {open ? (
        <section className="chat-panel" aria-label="Signal chat">
          <header className="chat-panel-header">
            <div className="min-w-0">
              <p className="chat-panel-kicker">Assistant</p>
              <h2 className="chat-panel-title">{tab === 'history' ? 'History' : title}</h2>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {tab === 'chat' && (messages.length > 0 || signalId) ? (
                <button type="button" className="chat-icon-btn" onClick={resetChat} aria-label="Start a new chat" title="New chat">
                  <PlusIcon />
                </button>
              ) : null}
              <button type="button" className="chat-icon-btn" onClick={() => setOpen(false)} aria-label="Close chat">
                <CloseIcon />
              </button>
            </div>
          </header>

          <nav className="chat-tabs" aria-label="Chat views">
            <button
              type="button"
              className={`chat-tab ${tab === 'chat' ? 'chat-tab-active' : ''}`}
              onClick={() => setTab('chat')}
            >
              New Chat
            </button>
            <button
              type="button"
              className={`chat-tab ${tab === 'history' ? 'chat-tab-active' : ''}`}
              onClick={() => {
                setHistory([])
                setHistoryError(null)
                setHistoryLoading(true)
                if (tab === 'history') void loadHistory()
                else setTab('history')
              }}
            >
              History
            </button>
          </nav>

          {tab === 'history' ? (
            <div className="chat-body ds-scroll">
              {historyLoading ? (
                <div className="chat-state">
                  <span className="ds-spinner" />
                  <span>Loading history...</span>
                </div>
              ) : null}
              {historyError ? <p className="chat-error">{historyError}</p> : null}
              {!historyLoading && !historyError && history.length === 0 ? (
                <div className="chat-empty">
                  <p>No saved chats yet.</p>
                  <p>Start a new conversation to see it here.</p>
                </div>
              ) : null}
              {!historyLoading && history.length > 0 ? (
                <ul className="chat-history-list">
                  {history.map((item) => (
                    <li key={item.id}>
                      <button type="button" className="chat-history-item" onClick={() => void openThread(item)}>
                        <span className="chat-history-title">{item.title}</span>
                        <span className="chat-history-meta">
                          {item.createdAt ? `${formatDateTime(item.createdAt)} · ${formatRelative(item.createdAt)}` : ''}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : (
            <>
              <div ref={listRef} className="chat-body ds-scroll">
                {threadLoading ? (
                  <div className="chat-state">
                    <span className="ds-spinner" />
                    <span>Loading conversation...</span>
                  </div>
                ) : null}
                {!threadLoading && messages.length === 0 ? (
                  <div className="chat-empty">
                    <p>Ask about your tracked signals.</p>
                    <p>Try “Get me the list of signals?” or a follow-up on a company.</p>
                  </div>
                ) : null}
                {messages.map((message) => {
                  if (message.role === 'assistant' && message.content.trim() === '' && sending) return null
                  return (
                    <article
                      key={message.id}
                      className={message.role === 'user' ? 'chat-bubble chat-bubble-user' : 'chat-bubble chat-bubble-assistant'}
                    >
                      {message.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <ChatMarkdown content={message.content} />
                      )}
                    </article>
                  )
                })}
                {waitingForResponse ? (
                  <div className="chat-loading" role="status" aria-live="polite">
                    <span className="ds-spinner" />
                    <span>Waiting for response...</span>
                  </div>
                ) : null}
                {error ? <p className="chat-error">{error}</p> : null}
              </div>
              <form
                className="chat-composer"
                onSubmit={(event) => {
                  event.preventDefault()
                  void sendMessage()
                }}
              >
                <textarea
                  ref={inputRef}
                  className="chat-input"
                  rows={2}
                  value={draft}
                  placeholder="Ask about signals..."
                  disabled={sending || threadLoading}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={onComposerKeyDown}
                />
                <button
                  type="submit"
                  className="ds-btn ds-btn-primary ds-btn-sm chat-send"
                  disabled={sending || threadLoading || !draft.trim()}
                >
                  {sending ? <span className="ds-spinner ds-spinner-sm" /> : 'Send'}
                </button>
              </form>
            </>
          )}
        </section>
      ) : null}

      {open ? null : (
        <button type="button" className="chat-fab" onClick={() => setOpen(true)} aria-label="Open chat">
          <ChatIcon />
        </button>
      )}
    </div>
  )
}

function ChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 19.5V6.8A2.8 2.8 0 0 1 7.8 4h8.4A2.8 2.8 0 0 1 19 6.8v6.4A2.8 2.8 0 0 1 16.2 16H9.2L5 19.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9 9.2h6M9 12.2h3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
