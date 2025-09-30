/**
 * Electron環境用HttpClient実装
 * Electron net module (Chromium networking)
 */

import type { HttpClient } from '@3k/ports'
import { net } from 'electron'

export class ElectronHttpClient implements HttpClient {
  private baseUrl: string

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  async get<T>(url: string, init?: RequestInit): Promise<T> {
    return this.request<T>(this.resolveUrl(url), {
      ...init,
      method: 'GET'
    })
  }

  async post<T>(url: string, body: unknown, init?: RequestInit): Promise<T> {
    return this.request<T>(this.resolveUrl(url), {
      ...init,
      method: 'POST',
      body: JSON.stringify(body)
    })
  }

  async put<T>(url: string, body: unknown, init?: RequestInit): Promise<T> {
    return this.request<T>(this.resolveUrl(url), {
      ...init,
      method: 'PUT',
      body: JSON.stringify(body)
    })
  }

  async delete<T>(url: string, init?: RequestInit): Promise<T> {
    return this.request<T>(this.resolveUrl(url), {
      ...init,
      method: 'DELETE'
    })
  }

  async patch<T>(url: string, body: unknown, init?: RequestInit): Promise<T> {
    return this.request<T>(this.resolveUrl(url), {
      ...init,
      method: 'PATCH',
      body: JSON.stringify(body)
    })
  }

  private async request<T>(url: string, init: RequestInit): Promise<T> {
    return new Promise((resolve, reject) => {
      const request = net.request({
        url,
        method: init.method || 'GET'
      })

      // ヘッダー設定
      request.setHeader('Content-Type', 'application/json')
      if (init.headers) {
        Object.entries(init.headers).forEach(([key, value]) => {
          if (typeof value === 'string') {
            request.setHeader(key, value)
          }
        })
      }

      // レスポンスハンドリング
      request.on('response', (response) => {
        const chunks: Buffer[] = []

        response.on('data', (chunk) => {
          chunks.push(chunk)
        })

        response.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf-8')

          if (response.statusCode && response.statusCode >= 400) {
            reject(new Error(`HTTP ${init.method} failed: ${response.statusCode} ${response.statusMessage}`))
            return
          }

          try {
            const json = JSON.parse(body)
            resolve(json as T)
          } catch (error) {
            reject(new Error(`Failed to parse JSON response: ${error}`))
          }
        })

        response.on('error', (error: Error) => {
          reject(new Error(`Response error: ${error.message}`))
        })
      })

      request.on('error', (error: Error) => {
        reject(new Error(`Request error: ${error.message}`))
      })

      // ボディ送信
      if (init.body && typeof init.body === 'string') {
        request.write(init.body)
      }

      request.end()
    })
  }

  private resolveUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    return this.baseUrl + url
  }
}

/**
 * ファクトリー関数
 */
export function createElectronHttpClient(baseUrl?: string): HttpClient {
  return new ElectronHttpClient(baseUrl)
}