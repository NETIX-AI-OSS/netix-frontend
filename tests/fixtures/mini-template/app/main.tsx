import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from 'netix-frontend/theme'
import Layout from '@/components/application/layout'
import { LazyRoute } from '@/components/application/lazy-route'
import { queryClient } from '@/client/query-client'
import '@/assets/styles/globals.css'
import '@/lib/auth-init'
import '@/lib/i18n'
import { initializeOrganizationLocale } from '@/lib/organization-locale'
import { Toaster } from '@/components/ui/toaster'
// Namespaced so adding a page is one <Route> below and one line in pages/lazy.ts —
// there is no import list to keep in step.
import * as Pages from '@/pages/lazy'

void initializeOrganizationLocale()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route
                path="/"
                element={
                  <LazyRoute>
                    <Pages.HomePage />
                  </LazyRoute>
                }
              />
              <Route path="/workspace" element={<Navigate to="/workspace/access" replace />} />
              <Route
                path="/workspace/access"
                element={
                  <LazyRoute>
                    <Pages.AccessPage />
                  </LazyRoute>
                }
              />
              <Route
                path="/workspace/access/:group"
                element={
                  <LazyRoute>
                    <Pages.AccessGroupPage />
                  </LazyRoute>
                }
              />
              <Route
                path="/workspace/design-system"
                element={
                  <LazyRoute>
                    <Pages.DesignSystemPage />
                  </LazyRoute>
                }
              />
              <Route
                path="/workspace/demo"
                element={
                  <LazyRoute>
                    <Pages.DemoPage />
                  </LazyRoute>
                }
              />
              {/* netix-routes:insert */}
              <Route
                path="*"
                element={
                  <LazyRoute>
                    <Pages.NotFoundPage />
                  </LazyRoute>
                }
              />
            </Route>
          </Routes>
          <Toaster position="bottom-right" />
        </BrowserRouter>
      </ThemeProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </StrictMode>,
)
