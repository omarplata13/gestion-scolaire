import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import I18nManager from '../../utils/i18n';

interface PaymentChartProps {
  paidStudents: number;
  unpaidStudents: number;
}

const PaymentChart: React.FC<PaymentChartProps> = ({ paidStudents, unpaidStudents }) => {
  const data = [
    { name: I18nManager.t('paid'), value: paidStudents, color: '#22C55E' },
    { name: I18nManager.t('unpaid'), value: unpaidStudents, color: '#DC2626' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {I18nManager.t('paymentStatus')}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PaymentChart;