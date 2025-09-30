/**
 * @3k/ports - Interface definitions for 3K Evaluation System
 *
 * This package contains all Port interfaces (Hexagonal Architecture).
 * Ports define the boundaries between core domain logic and external adapters.
 *
 * NO IMPLEMENTATIONS should exist in this package - only types and interfaces.
 */

// Configuration
export type { AppConfig, ConfigPort } from './config'

// Storage
export type { KV, BlobStore, StoragePort } from './storage'

// Authentication
export type { Session, AuthPort } from './auth'

// HTTP
export type { HttpClient } from './http'

// Repositories
export type {
  EvaluationRepository,
  Note,
  NotesRepository
} from './repositories'

// Logging
export type { LogLevel, LogMetadata, Logger } from './logger'

// LLM (AI features)
export type { ChatRole, ChatMessage, LLMUsage, LLMResponse, LLMPort } from './llm'