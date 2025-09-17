import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Search, CheckCircle } from 'lucide-react';
// ...existing code...
import { AuthManager } from '../../utils/auth';
import { db } from '../../utils/database';
import I18nManager from '../../utils/i18n';
import type { Teacher, Student, Expense } from '../../types';
import { generateId } from '../../utils/calculations';
import TeacherForm from './TeacherForm';
// Add this import for db
// If your db utility is named differently or located elsewhere, update the path accordingly.
// Example: import db from '../../db'; or import db from '../../utils/database';

const TeacherTable: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  const canWrite = AuthManager.canWrite();
  const isRTL = I18nManager.isRTL();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredTeachers(teachers);
      return;
    }
    const filtered = teachers.filter(teacher =>
      teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTeachers(filtered);
  }, [teachers, searchTerm]);

  const loadData = async () => {
    try {
      await db.init();
      const [teachersData, studentsData] = await Promise.all([
        db.getAll('teachers'),
        db.getAll('students')
      ]);
      setTeachers(teachersData);
      setStudents(studentsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  // filterTeachers logic moved into useEffect above

  const getAssignedStudentsCount = (teacherId: string): number => {
    // For this demo, we'll randomly assign students to teachers
    // In a real app, you'd have a proper assignment system
    // Example: count students whose subjects include this teacher
    return students.filter(student =>
      student.subjects?.some(sub => sub.teacherIds.includes(teacherId))
    ).length;
  };

  const handleAddTeacher = () => {
    setEditingTeacher(null);
    setShowForm(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setShowForm(true);
  };

  const handleDeleteTeacher = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await db.delete('teachers', id);
        await loadData();
      } catch (error) {
        console.error('Error deleting teacher:', error);
      }
    }
  };

  const handleFormSubmit = async () => {
    setShowForm(false);
    setEditingTeacher(null);
    await loadData();
    // Trigger dashboard update
    window.dispatchEvent(new CustomEvent('dataUpdated'));
  };

  const handleMarkSalaryAsPaid = async (teacher: Teacher) => {
    if (!canWrite) return;
    
    try {
      // Update teacher salary status
      const updatedTeacher: Teacher = {
        ...teacher,
        salaryStatus: 'paid',
        lastSalaryDate: new Date().toISOString()
      };
      
      await db.update('teachers', updatedTeacher);
      
      // Create an expense record for the salary payment
      const salaryAmount = teacher.salaryType === 'fixed' 
        ? teacher.salaryAmount 
        : teacher.salaryAmount * teacher.assignedStudents;
        
      const expense: Expense = {
        id: generateId(),
        type: 'Salary',
        date: new Date().toISOString(),
        amount: salaryAmount,
        notes: `Salary payment for ${teacher.fullName}`
      };
      
      await db.add('expenses', expense);
      await loadData();
      
      // Trigger dashboard update
      window.dispatchEvent(new CustomEvent('dataUpdated'));
    } catch (error) {
      console.error('Error marking teacher salary as paid:', error);
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
        <h1 className="text-2xl font-bold text-gray-900">{I18nManager.t('teachers')}</h1>
        {canWrite && (
          <button
            onClick={handleAddTeacher}
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
                  {I18nManager.t('subject')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {I18nManager.t('phoneNumber')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {I18nManager.t('languages')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {I18nManager.t('email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {I18nManager.t('salaryType')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {I18nManager.t('salaryAmount')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {I18nManager.t('assignedStudents')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salary Status
                </th>
                {canWrite && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {I18nManager.t('actions')}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {teacher.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {teacher.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {teacher.phoneNumber || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {teacher.languages && teacher.languages.length > 0 ? teacher.languages.join(', ') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {teacher.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {I18nManager.t(teacher.salaryType === 'fixed' ? 'fixed' : 'perStudent')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {I18nManager.formatCurrency(teacher.salaryAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getAssignedStudentsCount(teacher.id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {teacher.assignedClass || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        teacher.salaryStatus === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {teacher.salaryStatus === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  {canWrite && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {teacher.salaryStatus === 'unpaid' && (
                        <button
                          onClick={() => handleMarkSalaryAsPaid(teacher)}
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                          title="Mark Salary as Paid"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleEditTeacher(teacher)}
                        className="text-orange-600 hover:text-orange-900 p-1 hover:bg-orange-50 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteTeacher(teacher.id)}
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

        {filteredTeachers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No teachers found
          </div>
        )}
      </div>

      {/* Teacher Form Modal */}
      {showForm && (
        <TeacherForm
          teacher={editingTeacher}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default TeacherTable;