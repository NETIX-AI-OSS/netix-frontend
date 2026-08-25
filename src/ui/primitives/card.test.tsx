import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card'

describe('Card', () => {
  it('renders every slot with merged classes', () => {
    render(
      <Card className="root">
        <CardHeader className="header">
          <CardTitle className="title">Title</CardTitle>
          <CardDescription className="desc">Desc</CardDescription>
          <CardAction className="action">A</CardAction>
        </CardHeader>
        <CardContent className="content">Body</CardContent>
        <CardFooter className="footer">Foot</CardFooter>
      </Card>,
    )
    for (const [slot, cls] of [
      ['card', 'root'],
      ['card-header', 'header'],
      ['card-title', 'title'],
      ['card-description', 'desc'],
      ['card-action', 'action'],
      ['card-content', 'content'],
      ['card-footer', 'footer'],
    ] as const) {
      expect(document.querySelector(`[data-slot="${slot}"]`)).toHaveClass(cls)
    }
    expect(screen.getByText('Body')).toHaveClass('px-6')
  })
})
