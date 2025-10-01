import React from 'react'
import { EvaluationMain } from '@/components/evaluation'
import { AspectContainer } from '@/components/ui'

export default function NewEvaluationPage(): React.JSX.Element {
  return (
    <AspectContainer includeBackground={true}>
      <EvaluationMain />
    </AspectContainer>
  )
}