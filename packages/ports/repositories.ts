/**
 * Repository Ports
 * Data access layer interfaces for domain entities
 */

/**
 * ComprehensiveEvaluation Domain Model
 * Re-export from domain for repository interface
 */
export interface ComprehensiveEvaluation {
  readonly id: string
  readonly createdAt: string
  readonly updatedAt?: string
  readonly workDescription: string
  readonly physicalScore?: number
  readonly mentalScore?: number
  readonly environmentalScore?: number
  readonly hazardScore?: number
  readonly workTimeScore?: number
  readonly final3KIndex?: 'A' | 'B' | 'C' | 'D'
  readonly finalKitsusaScore?: number
  readonly calculationDetails?: Record<string, unknown>
  // 他の詳細フィールドは必要に応じて拡張
  [key: string]: unknown
}

/**
 * Evaluation Repository Port
 */
export interface EvaluationRepository {
  /** Save evaluation */
  save(evaluation: ComprehensiveEvaluation): Promise<string>

  /** Get evaluation by ID */
  get(id: string): Promise<ComprehensiveEvaluation | null>

  /** List all evaluations */
  getAll(): Promise<ComprehensiveEvaluation[]>

  /** Delete evaluation */
  delete(id: string): Promise<void>

  /** Update evaluation */
  update(id: string, evaluation: Partial<ComprehensiveEvaluation>): Promise<ComprehensiveEvaluation>
}

/**
 * Note Domain Model
 */
export interface Note {
  readonly id: string
  readonly title: string
  readonly body: string
  readonly createdAt: string
  readonly updatedAt?: string
}

/**
 * Notes Repository Port
 */
export interface NotesRepository {
  list(): Promise<Note[]>
  get(id: string): Promise<Note | null>
  create(note: Omit<Note, 'id' | 'createdAt'>): Promise<Note>
  update(id: string, patch: Partial<Omit<Note, 'id'>>): Promise<Note>
  remove(id: string): Promise<void>
}