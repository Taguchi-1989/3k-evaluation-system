/**
 * HTTP Client Port
 * Platform-agnostic HTTP request interface
 */

export interface HttpClient {
  /** GET request */
  get<T>(url: string, init?: RequestInit): Promise<T>

  /** POST request */
  post<T>(url: string, body: unknown, init?: RequestInit): Promise<T>

  /** PUT request */
  put<T>(url: string, body: unknown, init?: RequestInit): Promise<T>

  /** DELETE request */
  delete<T>(url: string, init?: RequestInit): Promise<T>

  /** PATCH request */
  patch<T>(url: string, body: unknown, init?: RequestInit): Promise<T>
}