import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Languages } from 'lucide-react';

const SettingsToggle = () => {
  const { i18n, t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ja' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="flex items-center gap-4 p-2">
      {/* Language Switcher */}
      <button 
        onClick={toggleLanguage}
        className="flex items-center gap-1 px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-sm"
      >
        <Languages size={16} />
        {i18n.language === 'en' ? '日本語' : 'English'}
      </button>

      {/* Dark Mode Toggle */}
      <button 
        onClick={toggleTheme}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        {isDark ? <Sun className="text-yellow-400" /> : <Moon className="text-gray-600" />}
      </button>
    </div>
  );
};

export default SettingsToggle;