import React from 'react';
import { Globe } from 'lucide-react';
import I18nManager from '../../utils/i18n';

interface HeaderProps {
  onLanguageChange: (lang: 'ar' | 'fr') => void;
}

const Header: React.FC<HeaderProps> = ({ onLanguageChange }) => {
  const currentLang = I18nManager.getCurrentLanguage();
  const isRTL = I18nManager.isRTL();

  return (
    <header className={`bg-white shadow-sm border-b border-gray-200 ${isRTL ? 'pr-64' : 'pl-64'} transition-all duration-300`}>
      <div className="px-6 py-4 flex justify-between items-center">
        <div className="flex-1"></div>
        
        {/* Language Switcher */}
        <div className="flex items-center space-x-4">
          <Globe size={20} className="text-gray-500" />
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onLanguageChange('fr')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                currentLang === 'fr'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => onLanguageChange('ar')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                currentLang === 'ar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              AR
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;