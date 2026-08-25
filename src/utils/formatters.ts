export type UserNameFields = {
  first_name?: string | null
  last_name?: string | null
}

export const getFullUserName = (user?: UserNameFields | null): string | undefined => {
  const firstName = user?.first_name
  const lastName = user?.last_name
  if (!firstName && !lastName) return undefined
  return `${firstName || ''} ${lastName || ''}`.trim()
}

export const getUserNameInitials = (user?: UserNameFields | null): string => {
  const firstNameInitial = user?.first_name?.[0] || ''
  const lastNameInitial = user?.last_name?.[0] || ''
  return (firstNameInitial + lastNameInitial).toUpperCase()
}

export function formatFileSize(bytes: number): string {
  if (!bytes) return ''
  const kb = bytes / 1024
  return kb < 1024 ? `${Math.round(kb)} KB` : `${(kb / 1024).toFixed(1)} MB`
}

export type FormatCurrencyOptions = {
  currency: string
  locale?: string
  maximumFractionDigits?: number
}

export function formatCurrency(value: number, options: FormatCurrencyOptions): string {
  const { currency, locale, maximumFractionDigits } = options
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits,
  }).format(value)
}
