import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getUserNameInitials = (user: { first_name: string; last_name: string }) =>
  `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase()

export const getFullUserName = (user: { first_name: string; last_name: string }) =>
  `${user.first_name} ${user.last_name}`.trim()
