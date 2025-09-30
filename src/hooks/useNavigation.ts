'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { useEvaluationStore } from './useEvaluationStore';

interface NavigationOptions {
  preserveQuery?: boolean;
  replace?: boolean;
}

export const useNavigation = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { pushToHistory, getLastPath, setReturnPath } = useEvaluationStore();

  const navigate = useCallback((
    destination: string, 
    options: NavigationOptions = {}
  ) => {
    const { preserveQuery = false, replace = false } = options;
    
    // 現在のパスを履歴に追加
    const currentPath = window.location.pathname;
    pushToHistory(currentPath);
    
    let targetUrl = destination;
    
    if (preserveQuery && searchParams.toString()) {
      const separator = destination.includes('?') ? '&' : '?';
      targetUrl = `${destination}${separator}${searchParams.toString()}`;
    }

    if (replace) {
      router.replace(targetUrl);
    } else {
      router.push(targetUrl);
    }
  }, [router, searchParams, pushToHistory]);

  const goBack = useCallback((fallbackPath?: string) => {
    const lastPath = getLastPath();
    
    if (lastPath) {
      router.push(lastPath);
    } else if (window.history.length > 1) {
      router.back();
    } else if (fallbackPath) {
      navigate(fallbackPath);
    } else {
      navigate('/');
    }
  }, [router, navigate, getLastPath]);

  const navigateToDetail = useCallback((
    factorType: 'physical' | 'mental' | 'environmental' | 'hazard' | 'worktime',
    returnPath?: string
  ) => {
    const currentPath = returnPath || window.location.pathname;
    setReturnPath(currentPath);
    const query = returnPath ? `?return=${encodeURIComponent(returnPath)}` : '';
    navigate(`/evaluation/${factorType}${query}`);
  }, [navigate, setReturnPath]);

  const getReturnPath = useCallback(() => {
    return searchParams.get('return') || '/evaluation/new';
  }, [searchParams]);

  const navigateHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const navigateToDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const navigateToNewEvaluation = useCallback(() => {
    navigate('/evaluation/new');
  }, [navigate]);

  const navigateToEvaluationList = useCallback(() => {
    navigate('/evaluation/list');
  }, [navigate]);

  const navigateToEditEvaluation = useCallback((id: string) => {
    navigate(`/evaluation/edit/${id}`);
  }, [navigate]);

  return {
    navigate,
    goBack,
    navigateToDetail,
    getReturnPath,
    navigateHome,
    navigateToDashboard,
    navigateToNewEvaluation,
    navigateToEvaluationList,
    navigateToEditEvaluation,
  };
};