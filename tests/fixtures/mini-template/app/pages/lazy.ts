import { lazy } from 'react'

export const HomePage = lazy(() => import('@/pages/home'))
export const ProfilePage = lazy(() => import('@/pages/profile'))
export const PermissionsPage = lazy(() => import('@/pages/permissions'))
export const SecurityPage = lazy(() => import('@/pages/security'))
export const DesignSystemPage = lazy(() => import('@/pages/design-system'))
export const SettingsPage = lazy(() => import('@/pages/settings'))
export const SupportPage = lazy(() => import('@/pages/support'))
