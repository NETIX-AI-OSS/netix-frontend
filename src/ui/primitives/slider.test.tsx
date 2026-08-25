import { render } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vitest'

import { Slider } from './slider'

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

const thumbs = () => document.querySelectorAll('[data-slot="slider-thumb"]').length

describe('Slider', () => {
  it('renders one thumb per controlled value', () => {
    render(<Slider value={[20]} className="extra" />)
    expect(thumbs()).toBe(1)
    expect(document.querySelector('[data-slot="slider"]')).toHaveClass('extra')
  })

  it('renders one thumb per default value', () => {
    render(<Slider defaultValue={[10, 60]} />)
    expect(thumbs()).toBe(2)
  })

  it('falls back to min and max when neither is given', () => {
    render(<Slider />)
    expect(thumbs()).toBe(2)
    expect(document.querySelector('[data-slot="slider-track"]')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="slider-range"]')).toBeInTheDocument()
  })
})
