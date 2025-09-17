import React, { useState, useEffect } from 'react';
import { Calendar, Users, GraduationCap } from 'lucide-react';
import { AuthManager } from '../../utils/auth';
import I18nManager from '../../utils/i18n';
import type { Student, Teacher, AttendanceRecord } from '../../types';
import { generateId } from '../../utils/calculations';
import { db } from '../../utils/database';

// تعريف window.electronAPI موجود في vite-env.d.ts ولا داعي لتعريفه هنا

const AttendanceModule: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students');
  const [loading, setLoading] = useState(true);

  const canWrite = AuthManager.canWrite();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await db.init();
      const [studentsData, teachersData, attendanceData] = await Promise.all([
        db.getAll('students'),
        db.getAll('teachers'),
        db.getAll('attendance')
      ]);
      setStudents(studentsData);
      setTeachers(teachersData);
      setAttendance(attendanceData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading attendance data:', error);
      setLoading(false);
    }
  };

  const getAttendanceForDate = (personId: string, type: 'student' | 'teacher'): AttendanceRecord | null => {
    return attendance.find(record => 
      record.date === selectedDate && 
      ((type === 'student' && record.studentId === personId) ||
       (type === 'teacher' && record.teacherId === personId))
    ) || null;
  };

  const handleAttendanceChange = async (personId: string, status: 'present' | 'absent', type: 'student' | 'teacher') => {
    if (!canWrite) return;

    try {
      const existingRecord = getAttendanceForDate(personId, type);
      
      if (existingRecord) {
        const updatedRecord = { ...existingRecord, status };
        await db.update('attendance', updatedRecord);
      } else {
        const newRecord: AttendanceRecord = {
          id: generateId(),
          [type === 'student' ? 'studentId' : 'teacherId']: personId,
          date: selectedDate,
          status,
          type
        };
        await db.add('attendance', newRecord);
      }

      await loadData();
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const todayAttendance = attendance.filter(record => record.date === selectedDate);
  const presentStudents = todayAttendance.filter(record => record.type === 'student' && record.status === 'present').length;
  const presentTeachers = todayAttendance.filter(record => record.type === 'teacher' && record.status === 'present').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{I18nManager.t('attendance')}</h1>
        <div className="flex items-center space-x-4">
          <Calendar size={20} className="text-gray-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Students Present</p>
              <p className="text-2xl font-bold text-green-600">{presentStudents}/{students.length}</p>
            </div>
            <Users size={24} className="text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Teachers Present</p>
              <p className="text-2xl font-bold text-blue-600">{presentTeachers}/{teachers.length}</p>
            </div>
            <GraduationCap size={24} className="text-blue-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'students'
                  ? 'border-red-500 text-red-600 bg-red-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users size={16} />
                <span>{I18nManager.t('students')}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('teachers')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'teachers'
                  ? 'border-red-500 text-red-600 bg-red-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <GraduationCap size={16} />
                <span>{I18nManager.t('teachers')}</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'students' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => {
                const attendanceRecord = getAttendanceForDate(student.id, 'student');
                const status = attendanceRecord?.status;

                return (
                  <div key={student.id} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">{student.fullName}</h3>
                    <p className="text-sm text-gray-500 mb-3">{student.class}</p>
                    
                    {canWrite ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAttendanceChange(student.id, 'present', 'student')}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            status === 'present'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                          }`}
                        >
                          {I18nManager.t('present')}
                        </button>
                        <button
                          onClick={() => handleAttendanceChange(student.id, 'absent', 'student')}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            status === 'absent'
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-red-100'
                          }`}
                        >
                          {I18nManager.t('absent')}
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          status === 'present'
                            ? 'bg-green-100 text-green-800'
                            : status === 'absent'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {status ? I18nManager.t(status) : 'Not marked'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'teachers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teachers.map((teacher) => {
                const attendanceRecord = getAttendanceForDate(teacher.id, 'teacher');
                const status = attendanceRecord?.status;

                return (
                  <div key={teacher.id} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">{teacher.fullName}</h3>
                    <p className="text-sm text-gray-500 mb-3">{teacher.subject}</p>
                    
                    {canWrite ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAttendanceChange(teacher.id, 'present', 'teacher')}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            status === 'present'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                          }`}
                        >
                          {I18nManager.t('present')}
                        </button>
                        <button
                          onClick={() => handleAttendanceChange(teacher.id, 'absent', 'teacher')}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            status === 'absent'
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-red-100'
                          }`}
                        >
                          {I18nManager.t('absent')}
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          status === 'present'
                            ? 'bg-green-100 text-green-800'
                            : status === 'absent'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {status ? I18nManager.t(status) : 'Not marked'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceModule;