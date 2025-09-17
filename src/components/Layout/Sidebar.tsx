import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  DollarSign, 
  Calendar, 
  Receipt, 
  FileText,
  LogOut
} from 'lucide-react';
import { AuthManager } from '../../utils/auth';
import I18nManager from '../../utils/i18n';

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const location = useLocation();
  const currentUser = AuthManager.getCurrentUser();
  const isRTL = I18nManager.isRTL();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: I18nManager.t('dashboard') },
    { path: '/students', icon: Users, label: I18nManager.t('students') },
    { path: '/teachers', icon: GraduationCap, label: I18nManager.t('teachers') },
    { path: '/finance', icon: DollarSign, label: I18nManager.t('finance') },
    { path: '/attendance', icon: Calendar, label: I18nManager.t('attendance') },
    { path: '/emploi', icon: Calendar, label: 'Emploi du temps' },
    { path: '/expenses', icon: Receipt, label: I18nManager.t('expenses') },
    { path: '/reports', icon: FileText, label: I18nManager.t('reports') },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className={`h-screen w-64 bg-gray-900 text-white fixed ${isRTL ? 'right-0' : 'left-0'} top-0 z-50 flex flex-col`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-center text-red-500">TCC</h1>
        <p className="text-sm text-gray-400 text-center mt-2">
          Training Coaching Center
        </p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">{currentUser?.name.charAt(0)}</span>
          </div>
          <div>
            <p className="text-sm font-medium">{currentUser?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{currentUser?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                    active
                      ? 'bg-red-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  } ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onLogout}
          className={`flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200 ${
            isRTL ? 'flex-row-reverse space-x-reverse' : ''
          }`}
        >
          <LogOut size={20} />
          <span className="font-medium">{I18nManager.t('logout')}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;