import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// スコア計算ユーティリティ
export function calculateFinalScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

// 3K指数変換
export function scoreTo3KIndex(score: number): string {
  if (score <= 2) return 'I';
  if (score <= 4) return 'II';
  if (score <= 6) return 'III';
  if (score <= 8) return 'IV';
  return 'V';
}

// スコアに基づく色付け
export function getScoreColor(score: number): string {
  if (score <= 2) return 'text-green-600 bg-green-50';
  if (score <= 4) return 'text-lime-600 bg-lime-50';
  if (score <= 6) return 'text-yellow-600 bg-yellow-50';
  if (score <= 8) return 'text-orange-600 bg-orange-50';
  return 'text-red-600 bg-red-50';
}

// 3K指数の色付け
export function get3KIndexColor(index: string): string {
  switch (index) {
    case 'I': return 'text-green-600 bg-green-50';
    case 'II': return 'text-lime-600 bg-lime-50';
    case 'III': return 'text-yellow-600 bg-yellow-50';
    case 'IV': return 'text-orange-600 bg-orange-50';
    case 'V': return 'text-red-600 bg-red-50';
    default: return 'text-gray-600 bg-gray-50';
  }
}

// 日付フォーマット
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// フォームバリデーション
export function validateRequired(value: string | undefined | null): boolean {
  return value != null && value.trim().length > 0;
}

export function validateScore(score: number): boolean {
  return score >= 1 && score <= 10 && Number.isInteger(score);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ファイルサイズフォーマット
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 配列の重複削除
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  return array.filter((item, index) => 
    array.findIndex(other => other[key] === item[key]) === index
  );
}

// 安全なJSON parse
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
}

// デバウンス
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}