'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import type {
  SpeechRecognition,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent
} from '@/types/web-speech-api'
import { getSpeechRecognition, isSpeechRecognitionSupported } from '@/types/web-speech-api'

export interface VoiceInputProps {
  onTranscription?: (text: string) => void
  onAudioCapture?: (audioBlob: Blob) => void
  disabled?: boolean
  className?: string
  placeholder?: string
}

export function VoiceInput({
  onTranscription,
  onAudioCapture,
  disabled = false,
  className = '',
  placeholder = '音声で作業内容を説明してください'
}: VoiceInputProps): React.JSX.Element {
  const [isRecording, setIsRecording] = useState(false)
  const [transcribedText, setTranscribedText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    // Web Speech API の初期化
    if (isSpeechRecognitionSupported()) {
      const SpeechRecognitionConstructor = getSpeechRecognition()
      if (!SpeechRecognitionConstructor) return

      recognitionRef.current = new SpeechRecognitionConstructor()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'ja-JP'

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent): void => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const alternative = result[0]
          if (result.isFinal) {
            finalTranscript += alternative.transcript
          } else {
            interimTranscript += alternative.transcript
          }
        }

        const fullTranscript = finalTranscript || interimTranscript
        setTranscribedText(fullTranscript)

        if (finalTranscript && onTranscription) {
          onTranscription(finalTranscript)
        }
      }

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent): void => {
        console.error('Speech recognition error:', event.error)
        setError(`音声認識エラー: ${event.error}`)
        setIsRecording(false)
      }

      recognitionRef.current.onend = (): void => {
        setIsRecording(false)
      }
    }

    return (): void => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [onTranscription])

  const startRecording = async (): Promise<void> => {
    try {
      setError(null)

      // 音声録音の開始
      if (onAudioCapture) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaRecorderRef.current = new MediaRecorder(stream)
        audioChunksRef.current = []

        mediaRecorderRef.current.ondataavailable = (event: BlobEvent): void => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        }

        mediaRecorderRef.current.onstop = (): void => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
          onAudioCapture(audioBlob)
          stream.getTracks().forEach(track => { track.stop() })
        }

        mediaRecorderRef.current.start()
      }

      // 音声認識の開始
      if (recognitionRef.current) {
        recognitionRef.current.start()
      } else {
        throw new Error('音声認識がサポートされていません')
      }

      setIsRecording(true)
    } catch (error) {
      console.error('Recording error:', error)
      const errorMessage = error instanceof Error ? error.message : 'マイクへのアクセスが拒否されました'
      setError(errorMessage)
    }
  }

  const stopRecording = (): void => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
  }

  const clearTranscription = (): void => {
    setTranscribedText('')
    setError(null)
  }

  return (
    <div className={`bg-white border rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <Button
          onClick={(): void => { void (isRecording ? stopRecording() : startRecording()) }}
          disabled={disabled}
          variant={isRecording ? "secondary" : "primary"}
          className={`flex items-center gap-2 ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
        >
          {isRecording ? (
            <>
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              録音停止
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              音声入力
            </>
          )}
        </Button>

        {transcribedText && (
          <Button
            onClick={clearTranscription}
            variant="outline"
            size="sm"
          >
            クリア
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="min-h-[80px] p-3 border border-gray-200 rounded bg-gray-50">
        {transcribedText ? (
          <p className="text-sm text-gray-800">{transcribedText}</p>
        ) : (
          <p className="text-sm text-gray-500 italic">
            {isRecording ? '音声を認識中...' : placeholder}
          </p>
        )}
      </div>

      {!recognitionRef.current && (
        <div className="mt-2 text-xs text-gray-500">
          ※ このブラウザは音声認識をサポートしていません。Chrome等をご利用ください。
        </div>
      )}
    </div>
  )
}
