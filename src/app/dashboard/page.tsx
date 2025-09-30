'use client';

import React from 'react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          3K評価ダッシュボード
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">肉体因子</h2>
            <p className="text-sm text-gray-600 mb-4">身体的負荷の評価</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">未開始</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">精神因子</h2>
            <p className="text-sm text-gray-600 mb-4">心理的ストレスの評価</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">未開始</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">環境因子</h2>
            <p className="text-sm text-gray-600 mb-4">作業環境の評価</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">未開始</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">評価一覧</h2>
          <div className="space-y-4">
            <a
              href="/evaluation/physical"
              className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900">肉体因子評価</h3>
              <p className="text-sm text-gray-600">身体的負荷を評価します</p>
            </a>
            <a
              href="/evaluation/mental"
              className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900">精神因子評価</h3>
              <p className="text-sm text-gray-600">心理的ストレスを評価します</p>
            </a>
            <a
              href="/evaluation/environmental"
              className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900">環境因子評価</h3>
              <p className="text-sm text-gray-600">作業環境を評価します</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}