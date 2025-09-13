import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import I18nManager from '../../utils/i18n';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'red' | 'orange' | 'green' | 'blue';
  isCurrency?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, isCurrency = false }) => {
  const colorClasses = {
    red: 'bg-red-50 text-red-600 border-red-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
  };

  const displayValue = isCurrency ? I18nManager.formatCurrency(Number(value)) : value;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{displayValue}</p>
        </div>
        <div className={`p-3 rounded-full border-2 ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;