/**
 * Storage Ports
 * Platform-agnostic key-value and blob storage interfaces
 */

/**
 * Key-Value Store Port
 * For structured data (JSON-serializable)
 */
export interface KV {
  /** Get value by key */
  get<T>(key: string): Promise<T | undefined>
  /** Set value for key */
  set<T>(key: string, value: T): Promise<void>
  /** Remove key */
  remove(key: string): Promise<void>
  /** List all keys (optional, for debugging) */
  keys?(): Promise<string[]>
}

/**
 * Blob Store Port
 * For binary data (files, images, etc.)
 */
export interface BlobStore {
  /** Read blob data */
  read(path: string): Promise<Uint8Array>
  /** Write blob data */
  write(path: string, data: Uint8Array): Promise<void>
  /** Check if blob exists */
  exists(path: string): Promise<boolean>
  /** Delete blob */
  delete(path: string): Promise<void>
  /** List blobs in directory (optional) */
  list?(directory: string): Promise<string[]>
}

/**
 * Combined Storage Port
 */
export interface StoragePort {
  kv: KV
  blobs: BlobStore
}