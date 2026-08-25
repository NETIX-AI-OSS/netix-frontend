import { describe, expect, it } from 'vitest'

import { formatFileSize, getFullUserName, getUserNameInitials } from './formatters'

describe('getFullUserName', () => {
  it('trims when only one name is present', () => {
    expect(getFullUserName({ first_name: 'Jane', last_name: 'Roe' })).toBe('Jane Roe')
    expect(getFullUserName({ first_name: 'Jane' })).toBe('Jane')
    expect(getFullUserName({ last_name: 'Roe' })).toBe('Roe')
  })

  it('is undefined without any name', () => {
    expect(getFullUserName()).toBeUndefined()
    expect(getFullUserName(null)).toBeUndefined()
    expect(getFullUserName({ first_name: null, last_name: '' })).toBeUndefined()
  })
})

describe('getUserNameInitials', () => {
  it('uppercases the two initials it can find', () => {
    expect(getUserNameInitials({ first_name: 'jane', last_name: 'roe' })).toBe('JR')
    expect(getUserNameInitials({ first_name: 'jane' })).toBe('J')
    expect(getUserNameInitials()).toBe('')
  })
})

describe('formatFileSize', () => {
  it('switches from KB to MB at a mebibyte', () => {
    expect(formatFileSize(0)).toBe('')
    expect(formatFileSize(2048)).toBe('2 KB')
    expect(formatFileSize(1024 * 1024 * 3.25)).toBe('3.3 MB')
  })
})
