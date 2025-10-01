/**
 * Web Speech API の型定義
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
 */

/** SpeechRecognitionResult インターフェース */
export interface SpeechRecognitionResult {
  readonly length: number
  readonly isFinal: boolean
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

/** SpeechRecognitionAlternative インターフェース */
export interface SpeechRecognitionAlternative {
  readonly transcript: string
  readonly confidence: number
}

/** SpeechRecognitionResultList インターフェース */
export interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

/** SpeechRecognitionEvent インターフェース */
export interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultList
}

/** SpeechRecognitionErrorEvent インターフェース */
export interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string
  readonly message: string
}

/** SpeechRecognition インターフェース */
export interface SpeechRecognition extends EventTarget {
  // プロパティ
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number

  // イベントハンドラ
  onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null
  onaudioend: ((this: SpeechRecognition, ev: Event) => void) | null
  onend: ((this: SpeechRecognition, ev: Event) => void) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
  onsoundstart: ((this: SpeechRecognition, ev: Event) => void) | null
  onsoundend: ((this: SpeechRecognition, ev: Event) => void) | null
  onspeechstart: ((this: SpeechRecognition, ev: Event) => void) | null
  onspeechend: ((this: SpeechRecognition, ev: Event) => void) | null
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null

  // メソッド
  start(): void
  stop(): void
  abort(): void
}

/** SpeechRecognition コンストラクタ */
export interface SpeechRecognitionConstructor {
  prototype: SpeechRecognition
  new (): SpeechRecognition
}

/** Window インターフェース拡張 */
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

/** SpeechRecognition の取得 */
export function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null
}

/** SpeechRecognition サポート確認 */
export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognition() !== null
}
