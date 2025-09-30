/**
 * Web環境用Repository実装
 * Supabase (クラウド) + IndexedDB (ローカルキャッシュ)
 */

import type { EvaluationRepository, NotesRepository } from '@3k/ports'
import type { ComprehensiveEvaluation, Note } from '@3k/ports'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { StoragePort } from '@3k/ports'

/**
 * Supabase EvaluationRepository
 */
export class SupabaseEvaluationRepository implements EvaluationRepository {
  private supabase: SupabaseClient
  private storage: StoragePort
  private tableName = 'evaluations'

  constructor(supabase: SupabaseClient, storage: StoragePort) {
    this.supabase = supabase
    this.storage = storage
  }

  async save(evaluation: ComprehensiveEvaluation): Promise<string> {
    // Supabaseに保存
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(evaluation)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save evaluation: ${error.message}`)
    }

    // ローカルキャッシュに保存
    await this.storage.kv.set(`eval:${evaluation.id}`, evaluation)

    return data.id
  }

  async get(id: string): Promise<ComprehensiveEvaluation | null> {
    // まずローカルキャッシュを確認
    const cached = await this.storage.kv.get<ComprehensiveEvaluation>(`eval:${id}`)
    if (cached) {
      return cached
    }

    // Supabaseから取得
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return null
    }

    // キャッシュに保存
    await this.storage.kv.set(`eval:${id}`, data)

    return data as ComprehensiveEvaluation
  }

  async getAll(): Promise<ComprehensiveEvaluation[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .order('createdAt', { ascending: false })

    if (error) {
      throw new Error(`Failed to get evaluations: ${error.message}`)
    }

    // 全件をローカルキャッシュに保存
    for (const evaluation of data) {
      await this.storage.kv.set(`eval:${evaluation.id}`, evaluation)
    }

    return data as ComprehensiveEvaluation[]
  }

  async delete(id: string): Promise<void> {
    // Supabaseから削除
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete evaluation: ${error.message}`)
    }

    // ローカルキャッシュから削除
    await this.storage.kv.remove(`eval:${id}`)
  }

  async update(id: string, evaluation: Partial<ComprehensiveEvaluation>): Promise<ComprehensiveEvaluation> {
    // Supabaseで更新
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({ ...evaluation, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      throw new Error(`Failed to update evaluation: ${error?.message || 'No data'}`)
    }

    // ローカルキャッシュを更新
    await this.storage.kv.set(`eval:${id}`, data)

    return data as ComprehensiveEvaluation
  }
}

/**
 * Supabase NotesRepository
 */
export class SupabaseNotesRepository implements NotesRepository {
  private supabase: SupabaseClient
  private storage: StoragePort
  private tableName = 'notes'

  constructor(supabase: SupabaseClient, storage: StoragePort) {
    this.supabase = supabase
    this.storage = storage
  }

  async list(): Promise<Note[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .order('createdAt', { ascending: false })

    if (error) {
      throw new Error(`Failed to list notes: ${error.message}`)
    }

    return data as Note[]
  }

  async get(id: string): Promise<Note | null> {
    // ローカルキャッシュ確認
    const cached = await this.storage.kv.get<Note>(`note:${id}`)
    if (cached) {
      return cached
    }

    // Supabaseから取得
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return null
    }

    // キャッシュに保存
    await this.storage.kv.set(`note:${id}`, data)

    return data as Note
  }

  async create(note: Omit<Note, 'id' | 'createdAt'>): Promise<Note> {
    const newNote = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    }

    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(newNote)
      .select()
      .single()

    if (error || !data) {
      throw new Error(`Failed to create note: ${error?.message || 'No data'}`)
    }

    return data as Note
  }

  async update(id: string, patch: Partial<Omit<Note, 'id'>>): Promise<Note> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({ ...patch, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      throw new Error(`Failed to update note: ${error?.message || 'No data'}`)
    }

    // キャッシュを更新
    await this.storage.kv.set(`note:${id}`, data)

    return data as Note
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to remove note: ${error.message}`)
    }

    // キャッシュから削除
    await this.storage.kv.remove(`note:${id}`)
  }
}

/**
 * LocalOnly EvaluationRepository (テスト用・オフライン用)
 * IndexedDB/LocalStorageのみを使用
 */
export class LocalEvaluationRepository implements EvaluationRepository {
  private storage: StoragePort
  private prefix = 'eval:'

  constructor(storage: StoragePort) {
    this.storage = storage
  }

  async save(evaluation: ComprehensiveEvaluation): Promise<string> {
    await this.storage.kv.set(`${this.prefix}${evaluation.id}`, evaluation)
    return evaluation.id
  }

  async get(id: string): Promise<ComprehensiveEvaluation | null> {
    const data = await this.storage.kv.get<ComprehensiveEvaluation>(`${this.prefix}${id}`)
    return data || null
  }

  async getAll(): Promise<ComprehensiveEvaluation[]> {
    const allKeys = await this.storage.kv.keys()
    const evalKeys = allKeys.filter(key => key.startsWith(this.prefix))

    const evaluations = await Promise.all(
      evalKeys.map(key => this.storage.kv.get<ComprehensiveEvaluation>(key))
    )

    const validEvaluations = evaluations.filter(
      (e): e is ComprehensiveEvaluation => e !== null
    )

    // 作成日時の降順でソート
    return validEvaluations.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  async delete(id: string): Promise<void> {
    await this.storage.kv.remove(`${this.prefix}${id}`)
  }

  async update(id: string, evaluation: Partial<ComprehensiveEvaluation>): Promise<ComprehensiveEvaluation> {
    const existing = await this.get(id)
    if (!existing) {
      throw new Error(`Evaluation ${id} not found`)
    }

    const updated: ComprehensiveEvaluation = {
      ...existing,
      ...evaluation,
      id: existing.id, // IDは変更不可
      updatedAt: new Date().toISOString()
    }

    await this.save(updated)
    return updated
  }
}

/**
 * ファクトリー関数（Supabase版）
 */
export function createSupabaseRepositories(
  supabase: SupabaseClient,
  storage: StoragePort
): {
  evaluationRepo: EvaluationRepository
  notesRepo: NotesRepository
} {
  return {
    evaluationRepo: new SupabaseEvaluationRepository(supabase, storage),
    notesRepo: new SupabaseNotesRepository(supabase, storage)
  }
}

/**
 * ファクトリー関数（ローカルのみ版 - テスト・オフライン用）
 */
export function createWebEvaluationRepository(
  storage?: StoragePort
): EvaluationRepository {
  // StoragePortが渡されない場合は簡易実装を使用
  const storageImpl = storage || createInMemoryStorage()
  return new LocalEvaluationRepository(storageImpl)
}

/**
 * インメモリStorage実装（テスト用）
 */
function createInMemoryStorage(): StoragePort {
  const store = new Map<string, unknown>()

  return {
    kv: {
      get: async <T>(key: string): Promise<T | null> => {
        return (store.get(key) as T) || null
      },
      set: async <T>(key: string, value: T): Promise<void> => {
        store.set(key, value)
      },
      remove: async (key: string): Promise<void> => {
        store.delete(key)
      },
      clear: async (): Promise<void> => {
        store.clear()
      },
      keys: async (): Promise<string[]> => {
        return Array.from(store.keys())
      }
    },
    blob: {
      save: async (): Promise<string> => '',
      get: async (): Promise<Blob | null> => null,
      remove: async (): Promise<void> => {},
      list: async (): Promise<string[]> => []
    }
  }
}