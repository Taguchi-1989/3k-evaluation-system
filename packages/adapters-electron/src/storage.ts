/**
 * Electron環境用StoragePort実装
 * electron-store (KV) + Node.js fs (Blob)
 */

import type { StoragePort, KV, BlobStore } from '@3k/ports'
import Store from 'electron-store'
import { app } from 'electron'
import * as fs from 'fs/promises'
import * as path from 'path'

/**
 * electron-store ベースのKV実装
 */
class ElectronStoreKV implements KV {
  private store: Store

  constructor() {
    this.store = new Store({
      name: '3k-evaluation-kv'
    })
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.store.get(key) as T | undefined
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.store.set(key, value)
  }

  async remove(key: string): Promise<void> {
    this.store.delete(key)
  }

  async keys(): Promise<string[]> {
    const store = this.store.store as Record<string, unknown>
    return Object.keys(store)
  }
}

/**
 * Node.js fs ベースのBlobStore実装
 */
class FileSystemBlobStore implements BlobStore {
  private blobDir: string

  constructor() {
    // アプリケーションデータディレクトリにblobs保存
    this.blobDir = path.join(app.getPath('userData'), 'blobs')
  }

  async ensureBlobDir(): Promise<void> {
    try {
      await fs.mkdir(this.blobDir, { recursive: true })
    } catch (error) {
      // ディレクトリが既に存在する場合は無視
    }
  }

  async read(filePath: string): Promise<Uint8Array> {
    await this.ensureBlobDir()
    const fullPath = path.join(this.blobDir, filePath)
    const buffer = await fs.readFile(fullPath)
    return new Uint8Array(buffer)
  }

  async write(filePath: string, data: Uint8Array): Promise<void> {
    await this.ensureBlobDir()
    const fullPath = path.join(this.blobDir, filePath)

    // ディレクトリ作成
    const dir = path.dirname(fullPath)
    await fs.mkdir(dir, { recursive: true })

    await fs.writeFile(fullPath, data)
  }

  async exists(filePath: string): Promise<boolean> {
    const fullPath = path.join(this.blobDir, filePath)
    try {
      await fs.access(fullPath)
      return true
    } catch {
      return false
    }
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(this.blobDir, filePath)
    await fs.unlink(fullPath)
  }

  async list(directory: string): Promise<string[]> {
    await this.ensureBlobDir()
    const fullPath = path.join(this.blobDir, directory)

    try {
      const entries = await fs.readdir(fullPath, { withFileTypes: true })
      return entries
        .filter(entry => entry.isFile())
        .map(entry => path.join(directory, entry.name))
    } catch {
      return []
    }
  }
}

/**
 * Electron Storage Adapter
 */
export class ElectronStorageAdapter implements StoragePort {
  kv: KV
  blobs: BlobStore

  constructor() {
    this.kv = new ElectronStoreKV()
    this.blobs = new FileSystemBlobStore()
  }
}

/**
 * シングルトンインスタンス
 */
export const electronStorage = new ElectronStorageAdapter()