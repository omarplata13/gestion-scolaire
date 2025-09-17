import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, AlertTriangle, TrendingUp } from 'lucide-react';
// ...existing code...
import I18nManager from '../../utils/i18n';
import StatsCard from './StatsCard';
import PaymentChart from './PaymentChart';
import type { Student, Teacher, Payment, Expense } from '../../types';
import { db } from '../../utils/database';
import {
  calculateTotalRevenue,
  calculateSalaryExpenses,
  calculateOtherExpenses,
  calculateProfit,
  getUnpaidStudents
} from '../../utils/calculations';

const Dashboard: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Listen for data updates from other components
    const handleDataUpdate = () => {
      loadDashboardData();
    };
    
    window.addEventListener('dataUpdated', handleDataUpdate);
    
    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdate);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      await db.init();
      const [studentsData, teachersData, paymentsData, expensesData] = await Promise.all([
        db.getAll('students'),
        db.getAll('teachers'),
        db.getAll('payments'),
        db.getAll('expenses')
      ]);
      setStudents(studentsData);
      setTeachers(teachersData);
      setPayments(paymentsData);
      setExpenses(expensesData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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

  const unpaidStudents = getUnpaidStudents(students);
  const totalRevenue = calculateTotalRevenue(payments);
  const salaryExpenses = calculateSalaryExpenses(teachers);
  const otherExpenses = calculateOtherExpenses(expenses);
  const profit = calculateProfit(totalRevenue, salaryExpenses, otherExpenses);

  const paidStudents = students.length - unpaidStudents.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{I18nManager.t('dashboard')}</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={I18nManager.t('totalStudents')}
          value={students.length}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title={I18nManager.t('totalTeachers')}
          value={teachers.length}
          icon={GraduationCap}
          color="green"
        />
        <StatsCard
          title={I18nManager.t('unpaidStudents')}
          value={unpaidStudents.length}
          icon={AlertTriangle}
          color="red"
        />
        <StatsCard
          title={I18nManager.t('profit')}
          value={profit}
          icon={TrendingUp}
          color="orange"
          isCurrency
        />
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatsCard
          title={I18nManager.t('revenue')}
          value={totalRevenue}
          icon={TrendingUp}
          color="green"
          isCurrency
        />
        <StatsCard
          title={I18nManager.t('salaryExpenses')}
          value={salaryExpenses}
          icon={Users}
          color="orange"
          isCurrency
        />
        <StatsCard
          title={I18nManager.t('otherExpenses')}
          value={otherExpenses}
          icon={AlertTriangle}
          color="red"
          isCurrency
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentChart paidStudents={paidStudents} unpaidStudents={unpaidStudents.length} />
        
        {/* Alerts */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alerts</h3>
          <div className="space-y-3">
            {unpaidStudents.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle size={20} className="text-red-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      {unpaidStudents.length} student(s) with unpaid status
                    </p>
                    <p className="text-xs text-red-600">
                      These students are marked as unpaid and may need follow-up
                    </p>
                  </div>
                </div>
              </div>
            )}

            {profit < 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle size={20} className="text-orange-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">
                      Negative Profit
                    </p>
                    <p className="text-xs text-orange-600">
                      Expenses exceed revenue this month
                    </p>
                  </div>
                </div>
              </div>
            )}

            {unpaidStudents.length === 0 && profit >= 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <TrendingUp size={20} className="text-green-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      All Good!
                    </p>
                    <p className="text-xs text-green-600">
                      No critical issues at the moment
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;