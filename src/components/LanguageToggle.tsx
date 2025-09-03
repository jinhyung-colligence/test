'use client'

import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'

export default function LanguageToggle() {
  const [isOpen, setIsOpen] = useState(false)
  const { language, toggleLanguage } = useLanguage()

  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷', short: 'KO' },
    { code: 'en', name: 'English', flag: '🇺🇸', short: 'EN' }
  ]

  const currentLanguage = languages.find(lang => lang.code === language)

  const handleLanguageSelect = (langCode: 'ko' | 'en') => {
    if (language !== langCode) {
      toggleLanguage()
    }
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-all duration-200 border border-gray-200 hover:border-gray-300"
      >
        <span className="text-sm font-semibold mr-1">{currentLanguage?.short}</span>
        <span className="text-xs mr-1.5">{currentLanguage?.flag}</span>
        <ChevronDownIcon className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code as 'ko' | 'en')}
                className={`w-full flex items-center px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  language === lang.code ? 'text-primary-600 bg-primary-50' : 'text-gray-700'
                }`}
              >
                <span className="mr-2">{lang.flag}</span>
                <span className="font-medium">{lang.short}</span>
                {language === lang.code && (
                  <span className="ml-auto text-primary-600 text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}