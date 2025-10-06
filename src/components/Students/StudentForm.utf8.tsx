﻿import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { db } from '../../utils/database';
import { generateId } from '../../utils/calculations';
import I18nManager from '../../utils/i18n';
import type { Student, Teacher, StudentSubject } from '../../types';

interface StudentFormProps {
  student?: Student | null;
  onSubmit: () => void;
  onCancel: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ student, onSubmit, onCancel }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [formData, setFormData] = useState({
    fullName: student?.fullName || '',
    birthDate: student?.birthDate || '',
    class: student?.class || '',
    paymentType: student?.paymentType || 'monthly' as const,
    paymentStatus: student?.paymentStatus || 'unpaid' as const,
    amountPaid: student?.amountPaid !== undefined ? student.amountPaid : '',
    phoneNumber: student?.phoneNumber || '',
    parentPhone: student?.parentPhone || '',
  });
  const [subjects, setSubjects] = useState<StudentSubject[]>(student?.subjects || []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const isRTL = I18nManager.isRTL();

  const availableSubjects = [
    'Islamic Education (ØªØ±Ø¨ÙŠØ© Ø¥Ø³Ù„Ø§Ù…ÙŠØ©)',
    'Civic Education (ØªØ±Ø¨ÙŠØ© Ù…Ø¯Ù†ÙŠØ©)',
    'Natural Sciences (Ø¹Ù„ÙˆÙ… Ø§Ù„Ø·Ø¨ÙŠØ¹Ø© ÙˆØ§Ù„Ø­ÙŠØ§Ø©)',
    'Mathematics (Ø±ÙŠØ§Ø¶ÙŠØ§Øª)',
    'Physics (ÙÙŠØ²ÙŠØ§Ø¡)',
    'French (ÙØ±Ù†Ø³ÙŠØ©)',
    'English (Ø§Ù†Ø¬Ù„ÙŠØ²ÙŠØ©)',
    'Arabic (Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©)',
    'History & Geography (ØªØ§Ø±ÙŠØ® Ùˆ Ø§Ù„Ø¬ØºØ±Ø§ÙÙŠØ§)',
    'Philosophy (ÙÙ„Ø³ÙØ©)'
  ];

  React.useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
  const teachersData = await db.getAllTeachers();
      setTeachers(teachersData);
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  };

  const addSubject = () => {
    setSubjects([...subjects, { subjectName: '', teacherIds: [] }]);
  };

  const removeSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const updateSubject = (
    index: number,
    field: keyof StudentSubject,
    value: string | string[]
  ) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
    setSubjects(updatedSubjects);
  };

  const toggleTeacher = (subjectIndex: number, teacherId: string) => {
    const updatedSubjects = [...subjects];
    const subject = updatedSubjects[subjectIndex];
    
    if (subject.teacherIds.includes(teacherId)) {
      subject.teacherIds = subject.teacherIds.filter(id => id !== teacherId);
    } else {
      subject.teacherIds = [...subject.teacherIds, teacherId];
    }
    
    setSubjects(updatedSubjects);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = I18nManager.t('required');
    }
    // ÇáÞÓã ÇÎÊíÇÑí¡ áÇ ÊÍÞÞ ãäå
    if (formData.amountPaid === '' || Number(formData.amountPaid) <= 0) {
      newErrors.amountPaid = I18nManager.t('invalidAmount');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const studentData: Student = {
        id: student?.id || generateId(),
        fullName: formData.fullName.trim(),
        class: formData.class.trim(),
        registrationDate: student?.registrationDate || new Date().toISOString(),
        paymentType: formData.paymentType,
        paymentStatus: formData.paymentStatus,
        lastPaymentDate: student?.lastPaymentDate || new Date().toISOString(),
        amountPaid: Number(formData.amountPaid),
        balance: student?.balance || 0,
        phoneNumber: formData.phoneNumber.trim(),
        parentPhone: formData.parentPhone.trim(),
        subjects: subjects.filter(s => s.subjectName && s.teacherIds.length > 0),
      };
      if (student) {
  await db.updateStudent(studentData);
      } else {
  await db.addStudent(studentData);
      }
      onSubmit();
    } catch (error) {
      setSaveError('Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø­ÙØ¸ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù„Ø§Ø­Ù‚Ù‹Ø§.');
      console.error('Error saving student:', error);
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
            {student ? I18nManager.t('edit') : I18nManager.t('add')} {I18nManager.t('students')}
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
          {/* ...Ø¬Ù…ÙŠØ¹ Ø­Ù‚ÙˆÙ„ Ø§Ù„Ù†ÙˆØ°Ø¬ ÙƒÙ…Ø§ Ù‡ÙŠ... */}
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
          {/* ÎÇäÉ ÊÇÑíÎ ÇáãíáÇÏ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de naissance
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 border-gray-300"
            />
          </div>
          {/* ...Ø¨Ø§Ù‚ÙŠ Ø§Ù„Ø­Ù‚ÙˆÙ„ ÙƒÙ…Ø§ Ù‡ÙŠ... */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Classe
            </label>
            <input
              type="text"
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 border-gray-300"
            />
          </div>
          {/* ...Ø¨Ø§Ù‚ÙŠ Ø§Ù„Ø­Ù‚ÙˆÙ„ ÙƒÙ…Ø§ Ù‡ÙŠ... */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {I18nManager.t('paymentType')}
            </label>
            <select
              value={formData.paymentType}
              onChange={(e) => setFormData({ ...formData, paymentType: e.target.value as 'monthly' | 'daily' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="monthly">{I18nManager.t('monthly')}</option>
              <option value="daily">{I18nManager.t('daily')}</option>
            </select>
          </div>
          {/* ...Ø¨Ø§Ù‚ÙŠ Ø§Ù„Ø­Ù‚ÙˆÙ„ ÙƒÙ…Ø§ Ù‡ÙŠ... */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {I18nManager.t('paymentStatus')}
            </label>
            <select
              value={formData.paymentStatus}
              onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as 'paid' | 'unpaid' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="paid">{I18nManager.t('paid')}</option>
              <option value="unpaid">{I18nManager.t('unpaid')}</option>
            </select>
          </div>
          {/* ...Ø¨Ø§Ù‚ÙŠ Ø§Ù„Ø­Ù‚ÙˆÙ„ ÙƒÙ…Ø§ Ù‡ÙŠ... */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant payé (DA)
            </label>
            <input
              type="number"
              min="0"
              value={formData.amountPaid}
              onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.amountPaid ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.amountPaid && <p className="text-red-500 text-xs mt-1">{errors.amountPaid}</p>}
          </div>
          {/* ...Ø¨Ø§Ù‚ÙŠ Ø§Ù„Ø­Ù‚ÙˆÙ„ ÙƒÙ…Ø§ Ù‡ÙŠ... */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {'Numéro de téléphone'}
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone du parent
            </label>
            <input
              type="tel"
              value={formData.parentPhone}
              onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          {/* ...Ø¨Ø§Ù‚ÙŠ Ø§Ù„Ø­Ù‚ÙˆÙ„ ÙƒÙ…Ø§ Ù‡ÙŠ... */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Section étudiante</h3>
              <button
                type="button"
                onClick={addSubject}
                className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1 text-sm"
              >
                <Plus size={16} />
                <span>Add Subject</span>
              </button>
            </div>

            {subjects.map((subject, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-gray-700">Subject {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeSubject(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ø§Ø³Ù… Ø§Ù„Ù…Ø§Ø¯Ø©
                    </label>
                    <select
                      value={subject.subjectName}
                      onChange={(e) => updateSubject(index, 'subjectName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Ø§Ø®ØªØ± Ø§Ù„Ù…Ø§Ø¯Ø©</option>
                      {availableSubjects.map(subjectName => (
                        <option key={subjectName} value={subjectName}>{subjectName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enseignants assignés
                    </label>
                    <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                      {teachers.map(teacher => (
                        <label key={teacher.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={subject.teacherIds.includes(teacher.id)}
                            onChange={() => toggleTeacher(index, teacher.id)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">
                            {teacher.fullName} ({teacher.subject})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {saveError && (
  <div className="text-red-600 text-sm mb-2 text-center font-bold">{saveError}</div>
)}
          {/* Ø£Ø²Ø±Ø§Ø± Ø§Ù„Ø­ÙØ¸ ÙˆØ§Ù„Ø¥Ù„ØºØ§Ø¡ Ø¯Ø§Ø®Ù„ Ø§Ù„Ù†Ù…ÙˆØ°Ø¬ */}
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

export default StudentForm;

