import type { Evaluation, EvaluationForm } from '@/types/evaluation';
import { prisma } from './prisma';
import { supabase } from './supabase';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ApiService {
  private static instance: ApiService;

  private constructor() {}

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  async saveEvaluation(form: EvaluationForm): Promise<ApiResponse<Evaluation>> {
    try {
      // ここでPrismaまたはSupabaseにデータを保存
      // 現在はモックデータを返す
      const evaluation: Evaluation = {
        id: `eval_${Date.now()}`,
        workName: form.workName || '',
        factoryName: form.factoryName || '',
        processName: form.processName || '',
        workHearing: form.workHearing,
        remarks: form.remarks,
        finalScoreKitsusa: 0,
        finalScore3K: 'E',
        createdAt: new Date(),
        updatedAt: new Date(),
        creatorId: 'current_user', // 実際の実装では認証から取得
        status: 'draft'
      };

      return {
        success: true,
        data: evaluation,
        message: '評価が保存されました'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '保存に失敗しました'
      };
    }
  }

  async updateEvaluation(id: string, form: Partial<EvaluationForm>): Promise<ApiResponse<Evaluation>> {
    try {
      // 実際の実装では既存データを更新
      const evaluation: Evaluation = {
        id,
        workName: form.workName || '',
        factoryName: form.factoryName || '',
        processName: form.processName || '',
        workHearing: form.workHearing,
        remarks: form.remarks,
        finalScoreKitsusa: 0,
        finalScore3K: 'E',
        createdAt: new Date(),
        updatedAt: new Date(),
        creatorId: 'current_user',
        status: 'draft'
      };

      return {
        success: true,
        data: evaluation,
        message: '評価が更新されました'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新に失敗しました'
      };
    }
  }

  async getEvaluation(id: string): Promise<ApiResponse<Evaluation>> {
    try {
      // 実際の実装ではDBからデータを取得
      const evaluation: Evaluation = {
        id,
        workName: 'サンプル作業',
        factoryName: '〇〇工場',
        processName: '△△工程',
        workHearing: '',
        remarks: '',
        finalScoreKitsusa: 0,
        finalScore3K: 'E',
        createdAt: new Date(),
        updatedAt: new Date(),
        creatorId: 'current_user',
        status: 'draft'
      };

      return {
        success: true,
        data: evaluation
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'データの取得に失敗しました'
      };
    }
  }

  async getEvaluationList(): Promise<ApiResponse<Evaluation[]>> {
    try {
      // 実際の実装ではDBから一覧を取得
      const evaluations: Evaluation[] = [
        {
          id: 'eval_1',
          workName: 'サンプル作業1',
          factoryName: '〇〇工場',
          processName: '△△工程',
          workHearing: '',
          remarks: '',
          finalScoreKitsusa: 5,
          finalScore3K: 'B',
          createdAt: new Date(),
          updatedAt: new Date(),
          creatorId: 'current_user',
          status: 'approved'
        },
        {
          id: 'eval_2',
          workName: 'サンプル作業2',
          factoryName: '△△工場',
          processName: '□□工程',
          workHearing: '',
          remarks: '',
          finalScoreKitsusa: 3,
          finalScore3K: 'D',
          createdAt: new Date(),
          updatedAt: new Date(),
          creatorId: 'current_user',
          status: 'draft'
        }
      ];

      return {
        success: true,
        data: evaluations
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'データの取得に失敗しました'
      };
    }
  }

  async deleteEvaluation(id: string): Promise<ApiResponse<void>> {
    try {
      // 実際の実装ではDBからデータを削除
      return {
        success: true,
        message: '評価が削除されました'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '削除に失敗しました'
      };
    }
  }

  async uploadPhoto(file: File): Promise<ApiResponse<{path: string, url: string}>> {
    try {
      // Supabaseにファイルをアップロード
      const filePath = `evaluations/${Date.now()}-${file.name}`;
      
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }

      const { data, error } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      const { data: publicData } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      return {
        success: true,
        data: {
          path: filePath,
          url: publicData.publicUrl
        },
        message: 'ファイルがアップロードされました'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'アップロードに失敗しました'
      };
    }
  }
}

export const apiService = ApiService.getInstance();