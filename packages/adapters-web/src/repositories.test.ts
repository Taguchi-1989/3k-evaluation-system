import { describe, it, expect, beforeEach } from 'vitest'
import { createWebEvaluationRepository } from './repositories'
import type { ComprehensiveEvaluation } from '@3k/ports'

/**
 * Contract Tests for EvaluationRepository
 *
 * これらのテストはPort interfaceの契約を検証します。
 * Webアダプターが正しく実装されているかをテストします。
 */
describe('WebEvaluationRepository - Contract Tests', () => {
  let repository: ReturnType<typeof createWebEvaluationRepository>

  beforeEach(async () => {
    // 新しいリポジトリインスタンスを作成
    repository = createWebEvaluationRepository()

    // テスト前にデータをクリア
    const all = await repository.getAll()
    await Promise.all(all.map(e => repository.delete(e.id)))
  })

  describe('save() and get()', () => {
    it('評価データを保存して取得できる', async () => {
      const evaluation: ComprehensiveEvaluation = {
        id: 'test-1',
        createdAt: new Date().toISOString(),
        workDescription: 'テスト作業',
        physicalScore: 5,
        mentalScore: 6,
        environmentalScore: 4,
        hazardScore: 3,
        workTimeScore: 1.0,
        final3KIndex: 'B',
        finalKitsusaScore: 6
      }

      const savedId = await repository.save(evaluation)
      expect(savedId).toBe('test-1')

      const retrieved = await repository.get('test-1')
      expect(retrieved).toBeDefined()
      expect(retrieved?.id).toBe('test-1')
      expect(retrieved?.workDescription).toBe('テスト作業')
      expect(retrieved?.physicalScore).toBe(5)
      expect(retrieved?.final3KIndex).toBe('B')
    })

    it('存在しないIDでnullを返す', async () => {
      const result = await repository.get('non-existent-id')
      expect(result).toBeNull()
    })

    it('同じIDで上書き保存できる', async () => {
      const evaluation: ComprehensiveEvaluation = {
        id: 'test-2',
        createdAt: new Date().toISOString(),
        workDescription: '初回保存',
        physicalScore: 3
      }

      await repository.save(evaluation)

      const updated: ComprehensiveEvaluation = {
        ...evaluation,
        workDescription: '更新後',
        physicalScore: 7,
        updatedAt: new Date().toISOString()
      }

      await repository.save(updated)

      const retrieved = await repository.get('test-2')
      expect(retrieved?.workDescription).toBe('更新後')
      expect(retrieved?.physicalScore).toBe(7)
      expect(retrieved?.updatedAt).toBeDefined()
    })
  })

  describe('getAll()', () => {
    it('空の配列を返す（データなし）', async () => {
      const all = await repository.getAll()
      expect(all).toEqual([])
    })

    it('複数の評価データをリスト取得できる', async () => {
      const eval1: ComprehensiveEvaluation = {
        id: 'test-3',
        createdAt: '2025-01-01T00:00:00Z',
        workDescription: '評価1',
        physicalScore: 3
      }

      const eval2: ComprehensiveEvaluation = {
        id: 'test-4',
        createdAt: '2025-01-02T00:00:00Z',
        workDescription: '評価2',
        mentalScore: 5
      }

      await repository.save(eval1)
      await repository.save(eval2)

      const all = await repository.getAll()
      expect(all).toHaveLength(2)

      const ids = all.map(e => e.id)
      expect(ids).toContain('test-3')
      expect(ids).toContain('test-4')
    })

    it('作成日時の降順でソートされる', async () => {
      await repository.save({
        id: 'test-5',
        createdAt: '2025-01-01T00:00:00Z',
        workDescription: '古い'
      })

      await repository.save({
        id: 'test-6',
        createdAt: '2025-01-03T00:00:00Z',
        workDescription: '新しい'
      })

      await repository.save({
        id: 'test-7',
        createdAt: '2025-01-02T00:00:00Z',
        workDescription: '中間'
      })

      const all = await repository.getAll()
      expect(all[0]?.id).toBe('test-6') // 最新
      expect(all[1]?.id).toBe('test-7')
      expect(all[2]?.id).toBe('test-5') // 最古
    })
  })

  describe('delete()', () => {
    it('評価データを削除できる', async () => {
      await repository.save({
        id: 'test-8',
        createdAt: new Date().toISOString(),
        workDescription: '削除対象'
      })

      let retrieved = await repository.get('test-8')
      expect(retrieved).not.toBeNull()

      await repository.delete('test-8')

      retrieved = await repository.get('test-8')
      expect(retrieved).toBeNull()
    })

    it('存在しないIDの削除でエラーにならない', async () => {
      await expect(
        repository.delete('non-existent')
      ).resolves.not.toThrow()
    })
  })

  describe('update()', () => {
    it('部分更新ができる', async () => {
      await repository.save({
        id: 'test-9',
        createdAt: '2025-01-01T00:00:00Z',
        workDescription: '初期',
        physicalScore: 3,
        mentalScore: 4
      })

      const updated = await repository.update('test-9', {
        physicalScore: 7,
        final3KIndex: 'A'
      })

      expect(updated.id).toBe('test-9')
      expect(updated.physicalScore).toBe(7)
      expect(updated.final3KIndex).toBe('A')
      expect(updated.mentalScore).toBe(4) // 変更なし
      expect(updated.workDescription).toBe('初期') // 変更なし
      expect(updated.updatedAt).toBeDefined()
    })

    it('存在しないIDの更新でエラーをスロー', async () => {
      await expect(
        repository.update('non-existent', { physicalScore: 5 })
      ).rejects.toThrow()
    })
  })

  describe('データ永続性', () => {
    it('保存したデータが複数回取得可能', async () => {
      await repository.save({
        id: 'test-10',
        createdAt: new Date().toISOString(),
        workDescription: '永続化テスト',
        physicalScore: 5
      })

      const retrieved1 = await repository.get('test-10')
      const retrieved2 = await repository.get('test-10')
      const retrieved3 = await repository.get('test-10')

      expect(retrieved1).toEqual(retrieved2)
      expect(retrieved2).toEqual(retrieved3)
    })
  })

  describe('型安全性', () => {
    it('未定義のフィールドはundefined', async () => {
      await repository.save({
        id: 'test-11',
        createdAt: new Date().toISOString(),
        workDescription: 'スコアなし'
      })

      const retrieved = await repository.get('test-11')
      expect(retrieved?.physicalScore).toBeUndefined()
      expect(retrieved?.mentalScore).toBeUndefined()
      expect(retrieved?.final3KIndex).toBeUndefined()
    })

    it('calculationDetailsオブジェクトを保存・取得できる', async () => {
      await repository.save({
        id: 'test-12',
        createdAt: new Date().toISOString(),
        workDescription: '詳細あり',
        calculationDetails: {
          method: 'test',
          factors: [1, 2, 3],
          nested: {
            value: 'test'
          }
        }
      })

      const retrieved = await repository.get('test-12')
      expect(retrieved?.calculationDetails).toEqual({
        method: 'test',
        factors: [1, 2, 3],
        nested: {
          value: 'test'
        }
      })
    })
  })
})
