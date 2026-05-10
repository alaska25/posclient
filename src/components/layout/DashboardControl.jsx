import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Globe } from 'lucide-react';

export default function DashboardControls() {
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme } = useTheme();

  const toggleLang = () => {
    const nextLang = i18n.language === 'en' ? 'ja' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <div className="flex items-center gap-3">
      {/* 🎌 Language Toggle */}
      <button onClick={toggleLang} className="btn btn-secondary btn-sm">
        <Globe size={16} className="text-accent" />
        <span>{i18n.language === 'en' ? '日本語' : 'English'}</span>
      </button>

      {/* 🌙 Theme Toggle */}
      <button onClick={toggleTheme} className="btn btn-secondary btn-sm">
        {isDark ? (
          <>
            <Sun size={16} className="text-yellow" />
            <span>{t('light_mode', 'Light')}</span>
          </>
        ) : (
          <>
            <Moon size={16} className="text-blue" />
            <span>{t('dark_mode', 'Dark')}</span>
          </>
        )}
      </button>
    </div>
  );
}