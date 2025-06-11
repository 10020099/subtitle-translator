'use client';

import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { getLanguageDisplayName, searchLanguages, getPopularLanguages } from '@/lib/utils/language-utils';
import { Language } from '@/types/llm';

interface LanguageSelectorProps {
  type: 'source' | 'target';
  label: string;
  value: string;
  onChange: (value: string) => void;
  showAutoDetect?: boolean;
}

export default function LanguageSelector({ 
  type, 
  label, 
  value, 
  onChange, 
  showAutoDetect = false 
}: LanguageSelectorProps) {
  const { state } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = useMemo(() => {
    if (!searchQuery) {
      return getPopularLanguages();
    }
    return searchLanguages(searchQuery);
  }, [searchQuery]);

  const selectedLanguage = useMemo(() => {
    if (value === 'auto') {
      return { code: 'auto', name: '自动检测', nativeName: '自动检测' };
    }
    return state.availableLanguages.find(lang => lang.code === value);
  }, [value, state.availableLanguages]);

  const handleLanguageSelect = (language: Language | { code: string; name: string; nativeName: string }) => {
    onChange(language.code);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div className="relative">
        <button
          type="button"
          className="relative w-full bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="block truncate">
            {selectedLanguage ? getLanguageDisplayName(selectedLanguage.code) : '选择语言'}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3z" clipRule="evenodd" />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {/* 搜索框 */}
            <div className="sticky top-0 bg-white px-3 py-2 border-b border-gray-200">
              <input
                type="text"
                className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="搜索语言..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* 自动检测选项 */}
            {showAutoDetect && type === 'source' && (
              <div
                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-primary-50 ${
                  value === 'auto' ? 'bg-primary-100 text-primary-900' : 'text-gray-900'
                }`}
                onClick={() => handleLanguageSelect({ code: 'auto', name: '自动检测', nativeName: '自动检测' })}
              >
                <span className="block truncate font-medium">
                  自动检测
                </span>
                {value === 'auto' && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary-600">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
            )}

            {/* 语言列表 */}
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((language) => (
                <div
                  key={language.code}
                  className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-primary-50 ${
                    value === language.code ? 'bg-primary-100 text-primary-900' : 'text-gray-900'
                  }`}
                  onClick={() => handleLanguageSelect(language)}
                >
                  <div className="flex flex-col">
                    <span className="block truncate font-medium">
                      {language.name}
                    </span>
                    <span className="block truncate text-sm text-gray-500">
                      {language.nativeName}
                    </span>
                  </div>
                  {value === language.code && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary-600">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="py-2 px-3 text-gray-500 text-sm">
                未找到匹配的语言
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
