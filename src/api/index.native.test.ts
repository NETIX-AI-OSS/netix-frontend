import { describe, expect, it } from 'vitest'

import * as api from './index'
import * as native from './index.native'

describe('the react-native api entry', () => {
  it('is the web surface plus the dev-token manager', () => {
    // Nothing is dropped for react-native; only createDevTokenManager is added.
    for (const key of Object.keys(api)) expect(native).toHaveProperty(key)
    expect(typeof native.createDevTokenManager).toBe('function')
    expect('createDevTokenManager' in api).toBe(false)
  })
})
