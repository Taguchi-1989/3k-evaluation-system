/**
 * Electron環境用Repository実装
 * better-sqlite3 (SQLite)
 */

import type { EvaluationRepository, NotesRepository, ComprehensiveEvaluation, Note } from '@3k/ports'
import Database from 'better-sqlite3'
import { app } from 'electron'
import * as path from 'path'

/**
 * SQLite EvaluationRepository
 */
export class SQLiteEvaluationRepository implements EvaluationRepository {
  private db: Database.Database

  constructor(dbPath?: string) {
    const defaultPath = path.join(app.getPath('userData'), '3k-evaluations.db')
    this.db = new Database(dbPath || defaultPath)
    this.initializeSchema()
  }

  private initializeSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS evaluations (
        id TEXT PRIMARY KEY,
        createdAt TEXT NOT NULL,
        updatedAt TEXT,
        workDescription TEXT NOT NULL,
        physicalScore INTEGER,
        mentalScore INTEGER,
        environmentalScore INTEGER,
        hazardScore INTEGER,
        workTimeScore REAL,
        final3KIndex TEXT,
        finalKitsusaScore INTEGER,
        calculationDetails TEXT,
        data TEXT
      )
    `)
  }

  async save(evaluation: ComprehensiveEvaluation): Promise<string> {
    const stmt = this.db.prepare(`
      INSERT INTO evaluations (
        id, createdAt, updatedAt, workDescription,
        physicalScore, mentalScore, environmentalScore, hazardScore,
        workTimeScore, final3KIndex, finalKitsusaScore,
        calculationDetails, data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      evaluation.id,
      evaluation.createdAt,
      evaluation.updatedAt || null,
      evaluation.workDescription,
      evaluation.physicalScore || null,
      evaluation.mentalScore || null,
      evaluation.environmentalScore || null,
      evaluation.hazardScore || null,
      evaluation.workTimeScore || null,
      evaluation.final3KIndex || null,
      evaluation.finalKitsusaScore || null,
      evaluation.calculationDetails ? JSON.stringify(evaluation.calculationDetails) : null,
      JSON.stringify(evaluation)
    )

    return evaluation.id
  }

  async get(id: string): Promise<ComprehensiveEvaluation | null> {
    const stmt = this.db.prepare('SELECT data FROM evaluations WHERE id = ?')
    const row = stmt.get(id) as { data: string } | undefined

    if (!row) {
      return null
    }

    return JSON.parse(row.data) as ComprehensiveEvaluation
  }

  async getAll(): Promise<ComprehensiveEvaluation[]> {
    const stmt = this.db.prepare('SELECT data FROM evaluations ORDER BY createdAt DESC')
    const rows = stmt.all() as { data: string }[]

    return rows.map(row => JSON.parse(row.data) as ComprehensiveEvaluation)
  }

  async delete(id: string): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM evaluations WHERE id = ?')
    stmt.run(id)
  }

  async update(id: string, evaluation: Partial<ComprehensiveEvaluation>): Promise<ComprehensiveEvaluation> {
    // 既存データ取得
    const existing = await this.get(id)
    if (!existing) {
      throw new Error(`Evaluation not found: ${id}`)
    }

    // マージ
    const updated = {
      ...existing,
      ...evaluation,
      updatedAt: new Date().toISOString()
    }

    // 更新
    const stmt = this.db.prepare(`
      UPDATE evaluations
      SET updatedAt = ?,
          workDescription = ?,
          physicalScore = ?,
          mentalScore = ?,
          environmentalScore = ?,
          hazardScore = ?,
          workTimeScore = ?,
          final3KIndex = ?,
          finalKitsusaScore = ?,
          calculationDetails = ?,
          data = ?
      WHERE id = ?
    `)

    stmt.run(
      updated.updatedAt,
      updated.workDescription,
      updated.physicalScore || null,
      updated.mentalScore || null,
      updated.environmentalScore || null,
      updated.hazardScore || null,
      updated.workTimeScore || null,
      updated.final3KIndex || null,
      updated.finalKitsusaScore || null,
      updated.calculationDetails ? JSON.stringify(updated.calculationDetails) : null,
      JSON.stringify(updated),
      id
    )

    return updated
  }

  close(): void {
    this.db.close()
  }
}

/**
 * SQLite NotesRepository
 */
export class SQLiteNotesRepository implements NotesRepository {
  private db: Database.Database

  constructor(dbPath?: string) {
    const defaultPath = path.join(app.getPath('userData'), '3k-notes.db')
    this.db = new Database(dbPath || defaultPath)
    this.initializeSchema()
  }

  private initializeSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT
      )
    `)
  }

  async list(): Promise<Note[]> {
    const stmt = this.db.prepare('SELECT * FROM notes ORDER BY createdAt DESC')
    return stmt.all() as Note[]
  }

  async get(id: string): Promise<Note | null> {
    const stmt = this.db.prepare('SELECT * FROM notes WHERE id = ?')
    const row = stmt.get(id) as Note | undefined
    return row || null
  }

  async create(note: Omit<Note, 'id' | 'createdAt'>): Promise<Note> {
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    }

    const stmt = this.db.prepare(`
      INSERT INTO notes (id, title, body, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)
    `)

    stmt.run(
      newNote.id,
      newNote.title,
      newNote.body,
      newNote.createdAt,
      newNote.updatedAt || null
    )

    return newNote
  }

  async update(id: string, patch: Partial<Omit<Note, 'id'>>): Promise<Note> {
    const existing = await this.get(id)
    if (!existing) {
      throw new Error(`Note not found: ${id}`)
    }

    const updated: Note = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString()
    }

    const stmt = this.db.prepare(`
      UPDATE notes
      SET title = ?, body = ?, updatedAt = ?
      WHERE id = ?
    `)

    stmt.run(updated.title, updated.body, updated.updatedAt, id)

    return updated
  }

  async remove(id: string): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM notes WHERE id = ?')
    stmt.run(id)
  }

  close(): void {
    this.db.close()
  }
}

/**
 * ファクトリー関数
 */
export function createSQLiteRepositories(
  evaluationsDbPath?: string,
  notesDbPath?: string
): {
  evaluationRepo: EvaluationRepository
  notesRepo: NotesRepository
} {
  return {
    evaluationRepo: new SQLiteEvaluationRepository(evaluationsDbPath),
    notesRepo: new SQLiteNotesRepository(notesDbPath)
  }
}