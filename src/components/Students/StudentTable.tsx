import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Search, CheckCircle } from 'lucide-react';
import { AuthManager } from '../../utils/auth';
import I18nManager from '../../utils/i18n';
import type { Student, Payment } from '../../types';
import { generateId } from '../../utils/calculations';
import StudentForm from './StudentForm';
import { db } from '../../utils/database';




const StudentTable: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  // حالة عرض معلومات الطالب
  const [showInfo, setShowInfo] = useState(false);
  const [infoStudent, setInfoStudent] = useState<Student | null>(null);

  const canWrite = AuthManager.canWrite();
  const isRTL = I18nManager.isRTL();

  const filterStudents = React.useCallback(() => {
    let filtered = students;
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.class.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedClass) {
      filtered = filtered.filter(student => student.class === selectedClass);
    }
    if (selectedBranch) {
      filtered = filtered.filter(student => student.class === selectedBranch);
    }
    if (selectedTeacher) {
      filtered = filtered.filter(student =>
        student.subjects?.some(sub => sub.teacherIds.includes(selectedTeacher))
      );
    }
    if (selectedPaymentStatus) {
      filtered = filtered.filter(student => student.paymentStatus === selectedPaymentStatus);
    }
    setFilteredStudents(filtered);
  }, [students, searchTerm, selectedClass, selectedBranch, selectedTeacher, selectedPaymentStatus]);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, filterStudents]);

  const loadStudents = async () => {
    try {
      await db.init();
      const data = await db.getAll('students');
      setStudents(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading students:', error);
      setLoading(false);
    }
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

  const handleFormSubmit = async (student?: Student) => {
    setShowForm(false);
    setEditingStudent(null);
    if (student) {
      if (student.id) {
        await db.update('students', student);
      } else {
        await db.add('students', student);
      }
    }
    await loadStudents();
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

  // نافذة عرض معلومات الطالب
  // نافذة عرض معلومات الطالب بالفرنسية
  const StudentInfoModal = ({ student, onClose }: { student: Student, onClose: () => void }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] max-w-[90vw]">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Informations de l'élève</h2>
        <div className="space-y-2 text-gray-700">
          <div><span className="font-semibold">Nom complet :</span> {student.fullName}</div>
          <div><span className="font-semibold">Classe :</span> {student.class}</div>
          <div><span className="font-semibold">Type de paiement :</span> {student.paymentType}</div>
          <div><span className="font-semibold">Dernier paiement :</span> {student.lastPaymentDate ? new Date(student.lastPaymentDate).toLocaleDateString() : '-'}</div>
          <div><span className="font-semibold">Montant payé :</span> {student.amountPaid}</div>
          <div><span className="font-semibold">Statut :</span> {student.paymentStatus === 'paid' ? 'Payé' : 'Non payé'}</div>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  );

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

      {/* Search & Filter Button */}
      <div className="flex items-center gap-2">
        <div className="relative w-full">
          <Search size={20} className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} text-gray-400`} />
          <input
            type="text"
            placeholder={I18nManager.t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500`}
          />
        </div>
        <button
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-1 transition-colors"
          onClick={() => setShowFilters((prev) => !prev)}
        >
          <span>فلترة</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-5.414 5.414A1 1 0 0015 13.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 019 16.118V13.414a1 1 0 00-.293-.707L3.293 6.707A1 1 0 013 6V4z" /></svg>
        </button>
      </div>

      {/* Filters Pop-up */}
      {showFilters && (
        <div className="absolute z-10 mt-2 p-4 bg-white rounded-lg shadow-lg border flex flex-col gap-3" style={{ minWidth: 250 }}>
          <select
            className="w-full py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
          >
            <option value="">{I18nManager.t('filterByClass') || 'كل المستويات'}</option>
            {[...new Set(students.map(s => s.class))].map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
          <select
            className="w-full py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={selectedBranch}
            onChange={e => setSelectedBranch(e.target.value)}
          >
            <option value="">{I18nManager.t('filterByBranch') || 'كل الشعب'}</option>
            {(() => {
              const branches = [...new Set(students.map(s => s.class).filter(Boolean))];
              if (branches.length === 0) {
                return <option disabled>لا توجد شعب</option>;
              }
              return branches.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ));
            })()}
          </select>
          <select
            className="w-full py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={selectedTeacher}
            onChange={e => setSelectedTeacher(e.target.value)}
          >
            <option value="">{I18nManager.t('filterByTeacher') || 'كل الأساتذة'}</option>
            {(() => {
              const teacherIds = new Set<string>();
              students.forEach(s => {
                s.subjects?.forEach(sub => {
                  sub.teacherIds.forEach(id => teacherIds.add(id));
                });
              });
              if (teacherIds.size === 0) {
                return <option disabled>لا يوجد أساتذة</option>;
              }
              return Array.from(teacherIds).map(teacher => (
                <option key={teacher} value={teacher}>{teacher}</option>
              ));
            })()}
          </select>
          <select
            className="w-full py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={selectedPaymentStatus}
            onChange={e => setSelectedPaymentStatus(e.target.value)}
          >
            <option value="">{I18nManager.t('filterByPaymentStatus') || 'كل الحالات'}</option>
            <option value="paid">{I18nManager.t('paid') || 'مدفوع'}</option>
            <option value="unpaid">{I18nManager.t('unpaid') || 'غير مدفوع'}</option>
          </select>
        </div>
      )}

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
                      {/* زر عرض المعلومات */}
                      <button
                        onClick={() => { setInfoStudent(student); setShowInfo(true); }}
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                        title="Show Info"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="8"></line></svg>
                      </button>
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

      {/* Student Info Modal */}
      {showInfo && infoStudent && (
        <StudentInfoModal student={infoStudent} onClose={() => { setShowInfo(false); setInfoStudent(null); }} />
      )}

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