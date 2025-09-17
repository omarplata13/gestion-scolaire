import React, { useState } from 'react';
import { X } from 'lucide-react';
import { db } from '../../utils/database';
import { generateId } from '../../utils/calculations';
import I18nManager from '../../utils/i18n';
import type { Teacher } from '../../types';

interface TeacherFormProps {
  teacher?: Teacher | null;
  onSubmit: () => void;
  onCancel: () => void;
}

const TeacherForm: React.FC<TeacherFormProps> = ({ teacher, onSubmit, onCancel }) => {
  // Removed unused students state
  const [formData, setFormData] = useState({
    fullName: teacher?.fullName || '',
    subject: teacher?.subject || '',
    salaryType: teacher?.salaryType || 'fixed' as const,
    salaryAmount: teacher?.salaryAmount || 0,
    assignedStudents: teacher?.assignedStudents || 0,
    assignedClass: teacher?.assignedClass || '',
    phoneNumber: teacher?.phoneNumber || '',
    languages: teacher?.languages || [],
    email: teacher?.email || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const isRTL = I18nManager.isRTL();

  const availableClasses = [
    'Terminal S', 'Terminal L', 'Terminal ES',
    '1ère AS', '2ème AS', '3ème AS',
    '1ère AM', '2ème AM', '3ème AM', '4ème AM',
    '1ère AP', '2ème AP', '3ème AP', '4ème AP', '5ème AP'
  ];

  // Removed unused students loading logic

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = I18nManager.t('required');
    }
    if (!formData.subject.trim()) {
      newErrors.subject = I18nManager.t('required');
    }
    if (formData.salaryAmount <= 0) {
      newErrors.salaryAmount = I18nManager.t('invalidAmount');
    }
    if (formData.salaryType === 'per_student' && (!formData.assignedStudents || formData.assignedStudents <= 0)) {
      newErrors.assignedStudents = I18nManager.t('required');
    }
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = I18nManager.t('invalidEmail');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    try {
      const teacherData: Teacher = {
        id: teacher?.id || generateId(),
        fullName: formData.fullName.trim(),
        subject: formData.subject.trim(),
        salaryType: formData.salaryType,
        salaryAmount: formData.salaryAmount,
        assignedStudents: formData.salaryType === 'per_student' ? formData.assignedStudents : 0,
        lastSalaryDate: teacher?.lastSalaryDate,
        assignedClass: formData.assignedClass,
        salaryStatus: teacher?.salaryStatus || 'unpaid',
        phoneNumber: formData.phoneNumber,
        languages: formData.languages,
        email: formData.email,
      };

      if (teacher) {
        await db.update('teachers', teacherData);
      } else {
        await db.add('teachers', teacherData);
      }

      onSubmit();
    } catch (error) {
      console.error('Error saving teacher:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {teacher ? I18nManager.t('edit') : I18nManager.t('add')} {I18nManager.t('teachers')}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* ...جميع حقول النموذج كما هي... */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {I18nManager.t('fullName')}
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.fullName ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>
          {/* ...باقي الحقول كما هي... */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {I18nManager.t('subject')}
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.subject ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
          </div>
          {/* ...باقي الحقول كما هي... */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {I18nManager.t('phoneNumber')}
            </label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 border-gray-300"
            />
          </div>
          {/* ...باقي الحقول كما هي... */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {I18nManager.t('languages')}
            </label>
            <select
              multiple
              value={formData.languages}
              onChange={(e) => {
                const options = Array.from(e.target.selectedOptions, option => option.value);
                setFormData({ ...formData, languages: options });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="Arabic">Arabic</option>
              <option value="French">French</option>
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
            </select>
          </div>
          {/* ...باقي الحقول كما هي... */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {I18nManager.t('email')} ({I18nManager.t('optional')})
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          {/* ...باقي الحقول كما هي... */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {I18nManager.t('salaryType')}
            </label>
            <select
              value={formData.salaryType}
              onChange={e => setFormData({ ...formData, salaryType: e.target.value as 'fixed' | 'per_student' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="fixed">{I18nManager.t('fixed')}</option>
              <option value="per_student">{I18nManager.t('perStudent')}</option>
            </select>
          </div>
          {/* ...باقي الحقول كما هي... */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {I18nManager.t('salaryAmount')}
            </label>
            <input
              type="number"
              value={formData.salaryAmount}
              onChange={e => setFormData({ ...formData, salaryAmount: Number(e.target.value) })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${errors.salaryAmount ? 'border-red-300' : 'border-gray-300'}`}
            />
            {errors.salaryAmount && <p className="text-red-500 text-xs mt-1">{errors.salaryAmount}</p>}
          </div>
          {/* ...باقي الحقول كما هي... */}
          {formData.salaryType === 'per_student' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {I18nManager.t('assignedStudents')}
              </label>
              <input
                type="number"
                value={formData.assignedStudents}
                onChange={e => setFormData({ ...formData, assignedStudents: Number(e.target.value) })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${errors.assignedStudents ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.assignedStudents && <p className="text-red-500 text-xs mt-1">{errors.assignedStudents}</p>}
            </div>
          )}
          {/* ...باقي الحقول كما هي... */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned Class
            </label>
            <select
              value={formData.assignedClass}
              onChange={(e) => setFormData({ ...formData, assignedClass: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Select a class</option>
              {availableClasses.map(className => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>
          </div>
          {/* أزرار الحفظ والإلغاء داخل النموذج */}
          <div className={`flex space-x-3 pt-6 border-t border-gray-200 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}
            style={{ position: 'sticky', bottom: 0, background: 'white', zIndex: 10 }}>
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

export default TeacherForm;