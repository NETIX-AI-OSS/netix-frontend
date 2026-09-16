import { describe, expect, it } from 'vitest'

import { FALLBACK_UPLOAD_FILENAME, toSafeUploadFilename } from './filename'

/** Mirrors OWASP CRS 4.x rule 920120, which scores a non-matching filename CRITICAL (5). */
const CRS_920120 =
  /^(?:&(?:(?:[acegilnorsuz]acut|[aeiou]grav|[aino]tild)e|[c-elnr-tz]caron|(?:[cgklnr-t]cedi|[aeiouy]um)l|[aceg-josuwy]circ|[au]ring|a(?:mp|pos)|nbsp|oslash);|[^"';=\\])*$/i

describe('toSafeUploadFilename', () => {
  it.each([
    ["Quotation for Children's City.pdf", 'Quotation for Children_s City.pdf'],
    ['IFM-Q-16270 Suppl;y and Installation.pdf', 'IFM-Q-16270 Suppl_y and Installation.pdf'],
    ['Report "final".pdf', 'Report _final_.pdf'],
    ['a=b.pdf', 'a_b.pdf'],
    ['back\\slash.pdf', 'back_slash.pdf'],
  ])('replaces the characters the WAF refuses in %j', (raw, expected) => {
    expect(toSafeUploadFilename(raw)).toBe(expected)
  })

  it('neutralises percent-escapes that CRS decodes back into those characters', () => {
    expect(toSafeUploadFilename('quote%27s.pdf')).toBe('quote_s.pdf')
    expect(toSafeUploadFilename('semi%3Bcolon.pdf')).toBe('semi_colon.pdf')
  })

  it.each([
    'TimePhoto_20260916_101700.jpg',
    'signature.png',
    'Muller-Ünal.pdf',
    '12th inspection - roof.pdf',
  ])('leaves an already-safe name untouched: %s', (raw) => {
    expect(toSafeUploadFilename(raw)).toBe(raw)
  })

  it.each([undefined, null, '', '   '])('falls back for %j', (raw) => {
    expect(toSafeUploadFilename(raw)).toBe(FALLBACK_UPLOAD_FILENAME)
  })

  it.each(["'", ';', '%27'])('keeps a usable name rather than falling back for %j', (raw) => {
    expect(toSafeUploadFilename(raw)).toBe('_')
  })

  it.each([
    "Quotation for Children's City.pdf",
    'Report "final"; v=2\\draft.pdf',
    'quote%27s.pdf',
    '',
  ])('produces a name CRS 920120 accepts for %j', (raw) => {
    expect(CRS_920120.test(toSafeUploadFilename(raw))).toBe(true)
  })
})
