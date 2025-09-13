import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Search, CheckCircle } from 'lucide-react';
import { db } from '../../utils/database';
import { AuthManager } from '../../utils/auth';
import I18nManager from '../../utils/i18n';
import type { Student, Payment } from '../../types';
import { generateId } from '../../utils/calculations';
import StudentForm from './StudentForm';

const StudentTable: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  const canWrite = AuthManager.canWrite();
  const isRTL = I18nManager.isRTL();

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm]);

  const loadStudents = async () => {
    try {
      const data = await db.getAll('students');
      setStudents(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading students:', error);
      setLoading(false);
    }
  };

  const filterStudents = () => {
    if (!searchTerm) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter(student =>
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setShowForm(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleDeleteStudent = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await db.delete('students', id);
        await loadStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const handleFormSubmit = async () => {
    setShowForm(false);
    setEditingStudent(null);
    await loadStudents();
    // Trigger dashboard update
    window.dispatchEvent(new CustomEvent('dataUpdated'));
  };

  const handleMarkAsPaid = async (student: Student) => {
    if (!canWrite) return;
    
    try {
      // Update student payment status
      const updatedStudent: Student = {
        ...student,
        paymentStatus: 'paid',
        lastPaymentDate: new Date().toISOString()
      };
      
      await db.update('students', updatedStudent);
      
      // Create a payment record
      const teacherShare = Math.round(student.amountPaid * 0.7 * 100) / 100;
      const schoolShare = Math.round(student.amountPaid * 0.3 * 100) / 100;
      const payment: Payment = {
        id: generateId(),
        studentId: student.id,
        amount: student.amountPaid,
        date: new Date().toISOString(),
        paymentType: student.paymentType,
        teacherShare,
        schoolShare,
        notes: 'Payment marked as paid'
      };
      await db.add('payments', payment);
      await loadStudents();
      
      // Trigger dashboard update
      window.dispatchEvent(new CustomEvent('dataUpdated'));
    } catch (error) {
      console.error('Error marking student as paid:', error);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">{I18nManager.t('students')}</h1>
        {canWrite && (
          <button
            onClick={handleAddStudent}
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
                  {I18nManager.t('fullName')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {I18nManager.t('class')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {I18nManager.t('paymentType')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {I18nManager.t('lastPaymentDate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {I18nManager.t('amountPaid')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {I18nManager.t('status')}
                </th>
                {canWrite && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {I18nManager.t('actions')}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className={`hover:bg-gray-50 ${
                    student.paymentStatus === 'unpaid' ? 'bg-red-50' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.class}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {I18nManager.t(student.paymentType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(student.lastPaymentDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {I18nManager.formatCurrency(student.amountPaid)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        student.paymentStatus === 'paid'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}></div>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          student.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {I18nManager.t(student.paymentStatus)}
                      </span>
                    </div>
                  </td>
                  {canWrite && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {student.paymentStatus === 'unpaid' && (
                        <button
                          onClick={() => handleMarkAsPaid(student)}
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                          title="Mark as Paid"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="text-orange-600 hover:text-orange-900 p-1 hover:bg-orange-50 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
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

        {filteredStudents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No students found
          </div>
        )}
      </div>

      {/* Student Form Modal */}
      {showForm && (
        <StudentForm
          student={editingStudent}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default StudentTable;