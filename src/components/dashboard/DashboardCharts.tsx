'use client'

import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
} from 'chart.js'
import { Bar, Pie, Line, Radar } from 'react-chartjs-2'
import { WorkItem } from '@/components/evaluation/EvaluationListView'

// Chart.js コンポーネントの登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale
)

export interface DashboardChartsProps {
  workItems: WorkItem[]
  className?: string
}

export function DashboardCharts({ workItems, className = '' }: DashboardChartsProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg p-6 border">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 3K指数別の分布
  const threekIndexData = {
    labels: ['A (7-10点)', 'B (4-6点)', 'C (2-3点)', 'D (1点)'],
    datasets: [
      {
        label: '作業件数',
        data: [
          workItems.filter(item => item.kitsusaScore >= 7).length,
          workItems.filter(item => item.kitsusaScore >= 4 && item.kitsusaScore < 7).length,
          workItems.filter(item => item.kitsusaScore >= 2 && item.kitsusaScore < 4).length,
          workItems.filter(item => item.kitsusaScore < 2).length,
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',   // 赤 (A)
          'rgba(245, 158, 11, 0.8)',  // オレンジ (B)
          'rgba(234, 179, 8, 0.8)',   // 黄 (C)
          'rgba(34, 197, 94, 0.8)',   // 緑 (D)
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(34, 197, 94, 1)',
        ],
        borderWidth: 2,
      },
    ],
  }

  // 因子別平均スコア
  const factorScoreData = {
    labels: ['肉体因', '精神因', '環境因', '危険因'],
    datasets: [
      {
        label: '平均スコア',
        data: [
          workItems.reduce((sum, item) => sum + item.physicalScore, 0) / workItems.length,
          workItems.reduce((sum, item) => sum + item.mentalScore, 0) / workItems.length,
          workItems.reduce((sum, item) => sum + item.environmentalScore, 0) / workItems.length,
          workItems.reduce((sum, item) => sum + item.hazardScore, 0) / workItems.length,
        ].map(score => Math.round(score * 10) / 10),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',   // 青
          'rgba(168, 85, 247, 0.8)',   // 紫
          'rgba(34, 197, 94, 0.8)',    // 緑
          'rgba(239, 68, 68, 0.8)',    // 赤
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  }

  // 工場別作業分布
  const factoryData = () => {
    const factories = [...new Set(workItems.map(item => item.factoryName))]
    const factoryStats = factories.map(factory => {
      const factoryItems = workItems.filter(item => item.factoryName === factory)
      return {
        factory,
        count: factoryItems.length,
        avgScore: factoryItems.reduce((sum, item) => sum + item.kitsusaScore, 0) / factoryItems.length
      }
    })

    return {
      labels: factoryStats.map(stat => stat.factory),
      datasets: [
        {
          label: '作業件数',
          data: factoryStats.map(stat => stat.count),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          yAxisID: 'y',
        },
        {
          label: '平均キツさスコア',
          data: factoryStats.map(stat => Math.round(stat.avgScore * 10) / 10),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 2,
          type: 'line' as const,
          yAxisID: 'y1',
        },
      ],
    }
  }

  // レーダーチャート用データ（各因子の最大値比較）
  const radarData = {
    labels: ['肉体因', '精神因', '環境因', '危険因'],
    datasets: [
      {
        label: '最高スコア',
        data: [
          Math.max(...workItems.map(item => item.physicalScore)),
          Math.max(...workItems.map(item => item.mentalScore)),
          Math.max(...workItems.map(item => item.environmentalScore)),
          Math.max(...workItems.map(item => item.hazardScore)),
        ],
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
      },
      {
        label: '平均スコア',
        data: [
          workItems.reduce((sum, item) => sum + item.physicalScore, 0) / workItems.length,
          workItems.reduce((sum, item) => sum + item.mentalScore, 0) / workItems.length,
          workItems.reduce((sum, item) => sum + item.environmentalScore, 0) / workItems.length,
          workItems.reduce((sum, item) => sum + item.hazardScore, 0) / workItems.length,
        ].map(score => Math.round(score * 10) / 10),
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12,
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  }

  const dualAxisOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        beginAtZero: true,
        title: {
          display: true,
          text: '作業件数',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        beginAtZero: true,
        title: {
          display: true,
          text: '平均スコア',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  }

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 2,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {/* 3K指数分布 */}
      <div className="bg-white rounded-lg p-6 border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">3K指数分布</h3>
        <div className="h-64">
          <Pie data={threekIndexData} options={{ 
            ...chartOptions, 
            plugins: { 
              ...chartOptions.plugins,
              legend: { 
                ...chartOptions.plugins.legend, 
                position: 'bottom' as const 
              } 
            } 
          }} />
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>改善要対象: <span className="font-semibold text-red-600">
            {workItems.filter(item => item.kitsusaScore >= 4).length}件
          </span> / 全{workItems.length}件</p>
        </div>
      </div>

      {/* 因子別平均スコア */}
      <div className="bg-white rounded-lg p-6 border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">因子別平均スコア</h3>
        <div className="h-64">
          <Bar data={factorScoreData} options={chartOptions} />
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>最高平均: <span className="font-semibold">
            {Math.max(...factorScoreData.datasets[0].data).toFixed(1)}点
          </span></p>
        </div>
      </div>

      {/* 工場別分析 */}
      <div className="bg-white rounded-lg p-6 border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">工場別作業分析</h3>
        <div className="h-64">
          <Bar data={factoryData() as any} options={dualAxisOptions} />
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>総工場数: <span className="font-semibold">
            {[...new Set(workItems.map(item => item.factoryName))].length}工場
          </span></p>
        </div>
      </div>

      {/* レーダーチャート */}
      <div className="bg-white rounded-lg p-6 border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">因子別リスク評価</h3>
        <div className="h-64">
          <Radar data={radarData} options={radarOptions} />
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>最高リスク因子: <span className="font-semibold text-red-600">
            {['肉体因', '精神因', '環境因', '危険因'][
              radarData.datasets[0].data.indexOf(Math.max(...radarData.datasets[0].data))
            ]}
          </span></p>
        </div>
      </div>
    </div>
  )
}