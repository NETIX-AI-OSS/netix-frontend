import { describe, expect, it } from 'vitest'

import { applyUpdater } from './search-params'

describe('applyUpdater', () => {
  it('takes a plain value or derives one from the previous state', () => {
    expect(applyUpdater(2, 1)).toBe(2)
    expect(applyUpdater((previous: number) => previous + 1, 1)).toBe(2)
  })
})
