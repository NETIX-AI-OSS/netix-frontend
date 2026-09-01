'use client'

import { Check, Languages } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import i18n from '@/lib/i18n'
import { selectOrganizationLanguage } from '@/lib/organization-locale'

export interface Language {
  name: string
  value: string
}

const languages: Language[] = [
  { name: 'English', value: 'en' },
  { name: 'العربية', value: 'ar' },
  { name: 'Español', value: 'es' },
  { name: 'Русский', value: 'ru' },
]

export function LanguageSwitcher() {
  const [selectedLanguageCode, setSelectedLanguageCode] = useState(
    () => i18n.resolvedLanguage || 'en',
  )
  const selectedLanguage = useMemo(
    () => languages.find((l) => l.value === selectedLanguageCode),
    [selectedLanguageCode],
  )

  useEffect(() => {
    const syncSelectedLanguage = (language: string) => setSelectedLanguageCode(language)
    i18n.on('languageChanged', syncSelectedLanguage)
    return () => i18n.off('languageChanged', syncSelectedLanguage)
  }, [])

  const handleLanguageChange = (value: string) => {
    setSelectedLanguageCode(value)
    void selectOrganizationLanguage(value)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="bg-card hover:bg-muted"
            aria-label={`Change language from ${selectedLanguage?.name ?? 'English'}`}
          />
        }
      >
        <Languages className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.name}
            onSelect={() => {
              handleLanguageChange(language.value)
            }}
          >
            {language.name}
            {language.value === selectedLanguage?.value && <Check className="ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
