import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import { SWRConfig } from 'swr'
import { ThemeProvider } from '@/components/theme-provider'
import Layout from '@/components/layout'
import { LazyRoute } from '@/components/lazy-route'
import { swrConfig } from '@/client/swr-config'
import '@/assets/styles/globals.css'
import '@/lib/i18n'
import { initializeOrganizationLocale } from '@/lib/organization-locale'
import { Toaster } from '@/components/ui/toaster'
import {
  DesignSystemPage,
  HomePage,
  PermissionsPage,
  ProfilePage,
  SecurityPage,
  SettingsPage,
  SupportPage,
} from '@/pages/lazy'

void initializeOrganizationLocale()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SWRConfig value={swrConfig}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route
                path="/"
                element={
                  <LazyRoute>
                    <HomePage />
                  </LazyRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <LazyRoute>
                    <ProfilePage />
                  </LazyRoute>
                }
              />
              <Route
                path="/permissions"
                element={
                  <LazyRoute>
                    <PermissionsPage />
                  </LazyRoute>
                }
              />
              <Route
                path="/security"
                element={
                  <LazyRoute>
                    <SecurityPage />
                  </LazyRoute>
                }
              />
              <Route
                path="/foundations/design-system"
                element={
                  <LazyRoute>
                    <DesignSystemPage />
                  </LazyRoute>
                }
              />
              <Route
                path="/support"
                element={
                  <LazyRoute>
                    <SupportPage />
                  </LazyRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <LazyRoute>
                    <SettingsPage />
                  </LazyRoute>
                }
              />
            </Route>
          </Routes>
          <Toaster position="bottom-right" />
        </BrowserRouter>
      </ThemeProvider>
    </SWRConfig>
  </StrictMode>,
)
