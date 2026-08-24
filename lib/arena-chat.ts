export const DEFAULT_ARENA_API_KEY = 'sk-sim-XIrT-6iI4EYx5gI_FRRu_lGomlXF-qra'

export const DEFAULT_CHAT_HISTORY_API_URL =
  'https://agent.thearena.ai/api/workflows/6dc41a2a-3191-4cd4-85db-e4692b35135f/execute'

export const DEFAULT_CHAT_THREAD_API_URL =
  'https://agent.thearena.ai/api/workflows/56dfdbb4-95e0-4cc8-b94a-6aaa2c4394a4/execute'

export const DEFAULT_CHAT_SEND_API_URL =
  'https://agent.thearena.ai/api/workflows/ef2164d0-b032-4997-8605-01333e14efe9/execute'

export function arenaChatHeaders(stream = false): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.ARENA_API_KEY || DEFAULT_ARENA_API_KEY,
  }
  if (stream) headers['X-Sim-Stream-Protocol'] = 'agent-events-v1'
  return headers
}

export function readEmailAndId(body: unknown): { email: string; id: string } {
  const obj = body !== null && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>) : {}
  return {
    email: typeof obj.email === 'string' ? obj.email : '',
    id: typeof obj.id === 'string' ? obj.id : '',
  }
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}
