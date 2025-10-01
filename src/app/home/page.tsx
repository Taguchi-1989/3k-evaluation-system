import React from 'react'
import { AppHome } from '@/components/evaluation'
import { AspectContainer } from '@/components/ui'

export default function HomePage(): React.JSX.Element {
  const handleNavigate = (destination: string) => {
    switch (destination) {
      case 'new-evaluation':
        window.location.href = '/evaluation/new'
        break
      case 'view-evaluations':
        window.location.href = '/evaluation/list'
        break
      case 'dashboard':
        window.location.href = '/dashboard'
        break
      default:
        // Unknown destination, no action needed
    }
  }

  return (
    <AspectContainer includeBackground={true}>
      <AppHome onNavigate={handleNavigate} />
    </AspectContainer>
  )
}