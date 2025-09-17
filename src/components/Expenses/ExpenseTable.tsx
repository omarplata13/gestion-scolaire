import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import { AuthManager } from '../../utils/auth';
import I18nManager from '../../utils/i18n';
import type { Expense } from '../../types';
import { db } from '../../utils/database';
import ExpenseForm from './ExpenseForm';

const ExpenseTable: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);

  const canWrite = AuthManager.canWrite();
  const isRTL = I18nManager.isRTL();

  const filterExpenses = React.useCallback(() => {
    if (!searchTerm) {
      setFilteredExpenses(expenses);
      return;
    }

    const filtered = expenses.filter(expense =>
      expense.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.notes && expense.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredExpenses(filtered);
  }, [expenses, searchTerm]);

  useEffect(() => {
    loadExpenses();
  }, []);

  // Removed duplicate filterExpenses declaration

  useEffect(() => {
    filterExpenses();
  }, [filterExpenses]);

  const loadExpenses = async () => {
    try {
      await db.init();
      const data = await db.getAll('expenses');
      setExpenses(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading expenses:', error);
      setLoading(false);
    }
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    setShowForm(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await db.delete('expenses', id);
        await loadExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const handleFormSubmit = async () => {
    setShowForm(false);
    setEditingExpense(null);
    await loadExpenses();
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{I18nManager.t('expenses')}</h1>
          <p className="text-gray-600 mt-1">
            {I18nManager.t('total')}: {I18nManager.formatCurrency(totalExpenses)}
          </p>
        </div>
        {canWrite && (
          <button
            onClick={handleAddExpense}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>{I18nManager.t('add')}</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={20} className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} text-gray-400`} />
        <input
          type="text"
          placeholder={I18nManager.t('search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500`}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount ({I18nManager.t('currency')})
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                {canWrite && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {I18nManager.t('actions')}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {expense.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {I18nManager.formatCurrency(expense.amount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {expense.notes || '-'}
                  </td>
                  {canWrite && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditExpense(expense)}
                        className="text-orange-600 hover:text-orange-900 p-1 hover:bg-orange-50 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredExpenses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No expenses found
          </div>
        )}
      </div>

      {/* Expense Form Modal */}
      {showForm && (
        <ExpenseForm
          expense={editingExpense}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default ExpenseTable;