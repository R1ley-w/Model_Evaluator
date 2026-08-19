import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScoreBadge } from './ScoreBadge'

describe('ScoreBadge', () => {
  it('renders a rounded score', () => {
    render(<ScoreBadge value={55.4} />)
    expect(screen.getByText('55')).toBeInTheDocument()
  })

  it('renders n/a for a null score', () => {
    render(<ScoreBadge value={null} />)
    expect(screen.getByText('n/a')).toBeInTheDocument()
  })
})
