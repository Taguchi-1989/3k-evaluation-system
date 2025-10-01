import React from 'react'

export default function TestLayout({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}