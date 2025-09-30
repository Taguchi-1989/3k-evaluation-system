/**
 * Repository Ports
 * Data access layer interfaces for domain entities
 */

import type {
  PhysicalDetails,
  MentalDetails,
  EnvironmentalDetails,
  HazardDetails,
  WorkTimeFactor,
  ComprehensiveEvaluation
} from '@/types/evaluation'

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
 * Notes Repository Port (for future features)
 */
export interface Note {
  id: string
  title: string
  body: string
  createdAt: string
  updatedAt?: string
}

export interface NotesRepository {
  list(): Promise<Note[]>
  get(id: string): Promise<Note | null>
  create(note: Omit<Note, 'id' | 'createdAt'>): Promise<Note>
  update(id: string, patch: Partial<Omit<Note, 'id'>>): Promise<Note>
  remove(id: string): Promise<void>
}