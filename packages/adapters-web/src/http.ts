/**
 * Web環境用HttpClient実装
 * Fetch API
 */

import type { HttpClient } from '@3k/ports'

export class FetchHttpClient implements HttpClient {
  private baseUrl: string

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  async get<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(this.resolveUrl(url), {
      ...init,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP GET failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async post<T>(url: string, body: unknown, init?: RequestInit): Promise<T> {
    const response = await fetch(this.resolveUrl(url), {
      ...init,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      throw new Error(`HTTP POST failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async put<T>(url: string, body: unknown, init?: RequestInit): Promise<T> {
    const response = await fetch(this.resolveUrl(url), {
      ...init,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      throw new Error(`HTTP PUT failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async delete<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(this.resolveUrl(url), {
      ...init,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP DELETE failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async patch<T>(url: string, body: unknown, init?: RequestInit): Promise<T> {
    const response = await fetch(this.resolveUrl(url), {
      ...init,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      throw new Error(`HTTP PATCH failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
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
export function createFetchClient(baseUrl?: string): HttpClient {
  return new FetchHttpClient(baseUrl)
}