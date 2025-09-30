/**
 * LLM (Language Model) Port
 * For AI-powered features (future)
 */

export type ChatRole = 'system' | 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface LLMUsage {
  inputTokens: number
  outputTokens: number
}

export interface LLMResponse {
  content: string
  usage?: LLMUsage
}

export interface LLMPort {
  /** Complete chat conversation */
  complete(request: {
    model: string
    messages: ChatMessage[]
    temperature?: number
    maxTokens?: number
  }): Promise<LLMResponse>

  /** Stream chat response (optional) */
  stream?(request: {
    model: string
    messages: ChatMessage[]
    temperature?: number
  }): AsyncGenerator<string, void, unknown>
}