import React, { useState } from 'react';
import { X } from 'lucide-react';
import { db } from '../../utils/database';
import { generateId } from '../../utils/calculations';
import I18nManager from '../../utils/i18n';
import type { Expense } from '../../types';

interface ExpenseFormProps {
  expense?: Expense | null;
  onSubmit: () => void;
  onCancel: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ expense, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    type: expense?.type || '',
    date: expense?.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0],
    amount: expense?.amount || 0,
    notes: expense?.notes || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const isRTL = I18nManager.isRTL();

  const expenseTypes = [
    'Rent',
    'Electricity',
    'Water',
    'Internet',
    'Office Supplies',
    'Maintenance',
    'Marketing',
    'Insurance',
    'Other'
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.type.trim()) {
      newErrors.type = I18nManager.t('required');
    }
    if (!formData.date) {
      newErrors.date = I18nManager.t('required');
    }
    if (formData.amount <= 0) {
      newErrors.amount = I18nManager.t('invalidAmount');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    try {
      const expenseData: Expense = {
        id: expense?.id || generateId(),
        type: formData.type.trim(),
        date: new Date(formData.date).toISOString(),
        amount: formData.amount,
        notes: formData.notes.trim(),
      };

      if (expense) {
  // إذا أردت دعم التعديل أضف دالة db.updateExpense
      } else {
  await db.addExpense(expenseData);
      }

      onSubmit();
    } catch (error) {
      console.error('Error saving expense:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {expense ? I18nManager.t('edit') : I18nManager.t('add')} Expense
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expense Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.type ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select expense type</option>
              {expenseTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.date ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount ({I18nManager.t('currency')})
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.amount ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Optional notes about this expense..."
            />
          </div>

          {/* Actions */}
          <div className={`flex space-x-3 pt-4 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : I18nManager.t('save')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
            >
              {I18nManager.t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;