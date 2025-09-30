/**
 * Web環境用StoragePort実装
 * IndexedDB (idb) + localStorage
 */

import type { StoragePort, KV, BlobStore } from '@3k/ports'
import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = '3k-evaluation-db'
const DB_VERSION = 1
const KV_STORE = 'kv-store'
const BLOB_STORE = 'blob-store'

/**
 * IndexedDB ベースのKV実装
 */
class IndexedDBKV implements KV {
  private dbPromise: Promise<IDBPDatabase>

  constructor() {
    this.dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // KVストア作成
        if (!db.objectStoreNames.contains(KV_STORE)) {
          db.createObjectStore(KV_STORE)
        }
        // Blobストア作成
        if (!db.objectStoreNames.contains(BLOB_STORE)) {
          db.createObjectStore(BLOB_STORE)
        }
      }
    })
  }

  async get<T>(key: string): Promise<T | undefined> {
    const db = await this.dbPromise
    return db.get(KV_STORE, key)
  }

  async set<T>(key: string, value: T): Promise<void> {
    const db = await this.dbPromise
    await db.put(KV_STORE, value, key)
  }

  async remove(key: string): Promise<void> {
    const db = await this.dbPromise
    await db.delete(KV_STORE, key)
  }

  async keys(): Promise<string[]> {
    const db = await this.dbPromise
    return db.getAllKeys(KV_STORE) as Promise<string[]>
  }
}

/**
 * IndexedDB ベースのBlobStore実装
 */
class IndexedDBBlobStore implements BlobStore {
  private dbPromise: Promise<IDBPDatabase>

  constructor(dbPromise: Promise<IDBPDatabase>) {
    this.dbPromise = dbPromise
  }

  async read(path: string): Promise<Uint8Array> {
    const db = await this.dbPromise
    const data = await db.get(BLOB_STORE, path)
    if (!data) {
      throw new Error(`Blob not found: ${path}`)
    }
    return data
  }

  async write(path: string, data: Uint8Array): Promise<void> {
    const db = await this.dbPromise
    await db.put(BLOB_STORE, data, path)
  }

  async exists(path: string): Promise<boolean> {
    const db = await this.dbPromise
    const data = await db.get(BLOB_STORE, path)
    return data !== undefined
  }

  async delete(path: string): Promise<void> {
    const db = await this.dbPromise
    await db.delete(BLOB_STORE, path)
  }

  async list(directory: string): Promise<string[]> {
    const db = await this.dbPromise
    const keys = await db.getAllKeys(BLOB_STORE)
    return (keys as string[]).filter(key => key.startsWith(directory))
  }
}

/**
 * localStorage フォールバック用KV実装
 * IndexedDBが使えない環境向け
 */
class LocalStorageKV implements KV {
  private prefix = '3k-eval:'

  async get<T>(key: string): Promise<T | undefined> {
    const data = localStorage.getItem(this.prefix + key)
    return data ? JSON.parse(data) : undefined
  }

  async set<T>(key: string, value: T): Promise<void> {
    localStorage.setItem(this.prefix + key, JSON.stringify(value))
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(this.prefix + key)
  }

  async keys(): Promise<string[]> {
    const allKeys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.prefix)) {
        allKeys.push(key.substring(this.prefix.length))
      }
    }
    return allKeys
  }
}

/**
 * localStorage用BlobStore実装（Base64エンコード）
 */
class LocalStorageBlobStore implements BlobStore {
  private prefix = '3k-blob:'

  async read(path: string): Promise<Uint8Array> {
    const base64 = localStorage.getItem(this.prefix + path)
    if (!base64) {
      throw new Error(`Blob not found: ${path}`)
    }
    // Base64デコード
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
  }

  async write(path: string, data: Uint8Array): Promise<void> {
    // Base64エンコード
    let binaryString = ''
    for (let i = 0; i < data.length; i++) {
      const byte = data[i]
      if (byte !== undefined) {
        binaryString += String.fromCharCode(byte)
      }
    }
    const base64 = btoa(binaryString)
    localStorage.setItem(this.prefix + path, base64)
  }

  async exists(path: string): Promise<boolean> {
    return localStorage.getItem(this.prefix + path) !== null
  }

  async delete(path: string): Promise<void> {
    localStorage.removeItem(this.prefix + path)
  }

  async list(directory: string): Promise<string[]> {
    const paths: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.prefix + directory)) {
        paths.push(key.substring(this.prefix.length))
      }
    }
    return paths
  }
}

/**
 * Web Storage Adapter
 * IndexedDB優先、フォールバックでlocalStorage
 */
export class WebStorageAdapter implements StoragePort {
  kv: KV
  blobs: BlobStore

  constructor() {
    // IndexedDB利用可能性チェック
    if (typeof indexedDB !== 'undefined') {
      const kvAdapter = new IndexedDBKV()
      this.kv = kvAdapter
      this.blobs = new IndexedDBBlobStore(kvAdapter['dbPromise'])
    } else {
      // フォールバック: localStorage
      this.kv = new LocalStorageKV()
      this.blobs = new LocalStorageBlobStore()
    }
  }
}

/**
 * シングルトンインスタンス
 */
export const webStorage = new WebStorageAdapter()