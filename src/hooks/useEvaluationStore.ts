import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Evaluation, EvaluationForm } from '@/types/evaluation';

interface EvaluationStore {
  // 現在の評価データ
  currentEvaluation: Evaluation | null;
  evaluationForm: EvaluationForm;
  
  // UI状態
  isLoading: boolean;
  activeTab: string;
  selectedFactorType: string;
  
  // ナビゲーション状態
  navigationHistory: string[];
  currentPath: string;
  returnPath: string | null;
  
  // アクション
  setCurrentEvaluation: (evaluation: Evaluation | null) => void;
  updateEvaluationForm: (updates: Partial<EvaluationForm>) => void;
  resetEvaluationForm: () => void;
  setLoading: (loading: boolean) => void;
  setActiveTab: (tab: string) => void;
  setSelectedFactorType: (type: string) => void;
  
  // ナビゲーションアクション
  pushToHistory: (path: string) => void;
  setCurrentPath: (path: string) => void;
  setReturnPath: (path: string | null) => void;
  getLastPath: () => string | null;
  clearHistory: () => void;
}

const initialEvaluationForm: EvaluationForm = {
  workName: '',
  factoryName: '',
  processName: '',
  workHearing: '',
  remarks: '',
  physicalFactor: {},
  mentalFactor: {},
  environmentalFactor: {},
  hazardFactor: {},
  workTime: {
    duration: 8,
    category: 'c'
  }
};

export const useEvaluationStore = create<EvaluationStore>()(
  persist(
    (set, get) => ({
      currentEvaluation: null,
      evaluationForm: initialEvaluationForm,
      isLoading: false,
      activeTab: 'basic',
      selectedFactorType: 'physical',
      
      // ナビゲーション初期状態
      navigationHistory: [],
      currentPath: '/',
      returnPath: null,
      
      setCurrentEvaluation: (evaluation) => 
        set({ currentEvaluation: evaluation }),
        
      updateEvaluationForm: (updates) =>
        set((state) => ({
          evaluationForm: { ...state.evaluationForm, ...updates }
        })),
        
      resetEvaluationForm: () =>
        set({ evaluationForm: initialEvaluationForm }),
        
      setLoading: (loading) => 
        set({ isLoading: loading }),
        
      setActiveTab: (tab) => 
        set({ activeTab: tab }),
        
      setSelectedFactorType: (type) => 
        set({ selectedFactorType: type }),
        
      // ナビゲーションアクション
      pushToHistory: (path) =>
        set((state) => ({
          navigationHistory: [...state.navigationHistory.slice(-9), path] // 最大10個の履歴を保持
        })),
        
      setCurrentPath: (path) =>
        set({ currentPath: path }),
        
      setReturnPath: (path) =>
        set({ returnPath: path }),
        
      getLastPath: () => {
        const state = get();
        return state.navigationHistory.length > 0
          ? (state.navigationHistory[state.navigationHistory.length - 1] ?? null)
          : null;
      },
      
      clearHistory: () =>
        set({ navigationHistory: [], returnPath: null }),
    }),
    {
      name: 'evaluation-store',
      // 永続化から除外するキー
      partialize: (state) => ({
        evaluationForm: state.evaluationForm,
        activeTab: state.activeTab,
        selectedFactorType: state.selectedFactorType,
        navigationHistory: state.navigationHistory,
        returnPath: state.returnPath,
      }),
    }
  )
);