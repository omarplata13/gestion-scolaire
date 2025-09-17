import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
// ...existing code...
import I18nManager from '../../utils/i18n';
import StatsCard from '../Dashboard/StatsCard';
import type { Payment, Teacher, Expense } from '../../types';
import { db } from '../../utils/database';
import {
  calculateTotalRevenue,
  calculateSalaryExpenses,
  calculateOtherExpenses
} from '../../utils/calculations';

const FinanceModule: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFinanceData();
    
    // Listen for data updates from other components
    const handleDataUpdate = () => {
      loadFinanceData();
    };
    
    window.addEventListener('dataUpdated', handleDataUpdate);
    
    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdate);
    };
  }, []);

  const loadFinanceData = async () => {
    try {
      await db.init();
      const [paymentsData, teachersData, expensesData] = await Promise.all([
        db.getAll('payments'),
        db.getAll('teachers'),
        db.getAll('expenses')
      ]);
      setPayments(paymentsData);
      setTeachers(teachersData);
      setExpenses(expensesData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading finance data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const totalRevenue = calculateTotalRevenue(payments);
  const totalTeacherShare = payments.reduce((sum, p) => sum + (p.teacherShare || 0), 0);
  const totalSchoolShare = payments.reduce((sum, p) => sum + (p.schoolShare || 0), 0);
  const salaryExpenses = calculateSalaryExpenses(teachers);
  const otherExpenses = calculateOtherExpenses(expenses);
  const totalExpenses = salaryExpenses + otherExpenses;
  const profit = totalSchoolShare - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{I18nManager.t('finance')}</h1>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          title={I18nManager.t('revenue')}
          value={totalRevenue}
          icon={TrendingUp}
          color="green"
          isCurrency
        />
        <StatsCard
          title={"Teacher Share"}
          value={totalTeacherShare}
          icon={DollarSign}
          color="blue"
          isCurrency
        />
        <StatsCard
          title={"School Share"}
          value={totalSchoolShare}
          icon={DollarSign}
          color="blue"
          isCurrency
        />
        <StatsCard
          title={I18nManager.t('salaryExpenses')}
          value={salaryExpenses}
          icon={DollarSign}
          color="orange"
          isCurrency
        />
        <StatsCard
          title={I18nManager.t('profit')}
          value={profit}
          icon={TrendingUp}
          color={profit >= 0 ? 'green' : 'red'}
          isCurrency
        />
      </div>

      {/* Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center font-bold p-2 border-b">
              <span>Date</span>
              <span>Amount</span>
              <span>Teacher Share</span>
              <span>School Share</span>
            </div>
            {payments.slice(0, 5).map((payment) => (
              <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500 w-1/4">{new Date(payment.date).toLocaleDateString()}</span>
                <span className="text-sm font-semibold text-green-600 w-1/4">{I18nManager.formatCurrency(payment.amount)}</span>
                <span className="text-sm text-blue-600 w-1/4">{I18nManager.formatCurrency(payment.teacherShare || 0)}</span>
                <span className="text-sm text-purple-600 w-1/4">{I18nManager.formatCurrency(payment.schoolShare || 0)}</span>
              </div>
            ))}
            {payments.length === 0 && (
              <p className="text-gray-500 text-center py-4">No payments recorded</p>
            )}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Revenue:</span>
              <span className="font-semibold text-green-600">
                {I18nManager.formatCurrency(totalRevenue)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Teacher Share:</span>
              <span className="font-semibold text-blue-600">
                {I18nManager.formatCurrency(totalTeacherShare)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total School Share:</span>
              <span className="font-semibold text-purple-600">
                {I18nManager.formatCurrency(totalSchoolShare)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Expenses:</span>
              <span className="font-semibold text-red-600">
                {I18nManager.formatCurrency(totalExpenses)}
              </span>
            </div>
            <hr />
            <div className="flex justify-between items-center">
              <span className="text-gray-900 font-medium">Profit:</span>
              <span className={`font-bold text-lg ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {I18nManager.formatCurrency(profit)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceModule;