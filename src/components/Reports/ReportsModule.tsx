  // Backup/export all data as JSON
  const handleBackupData = async () => {
    const [studentsData, teachersData, paymentsData, expensesData] = await Promise.all([
      db.getAll('students'),
      db.getAll('teachers'),
      db.getAll('payments'),
      db.getAll('expenses')
    ]);
    const backup = {
      students: studentsData,
      teachers: teachersData,
      payments: paymentsData,
      expenses: expensesData
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `school-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


import React, { useState, useEffect } from 'react';
import { Download, FileText, DollarSign } from 'lucide-react';
import { db } from '../../utils/database';
import I18nManager from '../../utils/i18n';
import type { Student, Teacher, Payment, Expense } from '../../types';
import jsPDF from 'jspdf';

const ReportsModule: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
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
      console.error('Error loading report data:', error);
      setLoading(false);
    }
  };

  const generateStudentReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFontSize(20);
    doc.text('TCC - Student Report', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
    doc.text(`Total Students: ${students.length}`, pageWidth / 2, 40, { align: 'center' });
    
    // Table headers
    let yPosition = 60;
    doc.setFontSize(10);
    doc.text('Name', 20, yPosition);
    doc.text('Class', 80, yPosition);
    doc.text('Payment Type', 120, yPosition);
    doc.text('Status', 160, yPosition);
    
    // Draw line
    doc.line(20, yPosition + 2, pageWidth - 20, yPosition + 2);
    yPosition += 10;
    
    // Student data
    students.forEach((student) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(student.fullName.substring(0, 25), 20, yPosition);
      doc.text(student.class, 80, yPosition);
      doc.text(student.paymentType, 120, yPosition);
      doc.text(student.paymentStatus, 160, yPosition);
      yPosition += 8;
    });
    
    doc.save('students-report.pdf');
  };

  const generateTeacherReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFontSize(20);
    doc.text('TCC - Teacher Report', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
    doc.text(`Total Teachers: ${teachers.length}`, pageWidth / 2, 40, { align: 'center' });
    
    // Table headers
    let yPosition = 60;
    doc.setFontSize(10);
    doc.text('Name', 20, yPosition);
    doc.text('Subject', 80, yPosition);
    doc.text('Salary Type', 120, yPosition);
    doc.text('Amount (DA)', 160, yPosition);
    
    // Draw line
    doc.line(20, yPosition + 2, pageWidth - 20, yPosition + 2);
    yPosition += 10;
    
    // Teacher data
    teachers.forEach((teacher) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(teacher.fullName.substring(0, 25), 20, yPosition);
      doc.text(teacher.subject.substring(0, 20), 80, yPosition);
      doc.text(teacher.salaryType, 120, yPosition);
      doc.text(teacher.salaryAmount.toLocaleString(), 160, yPosition);
      yPosition += 8;
    });
    
    doc.save('teachers-report.pdf');
  };

  const generateFinanceReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const profit = totalRevenue - totalExpenses;
    
    // Header
    doc.setFontSize(20);
    doc.text('TCC - Financial Report', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
    
    // Summary
    let yPosition = 50;
    doc.setFontSize(14);
    doc.text('Financial Summary', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.text(`Total Revenue: ${totalRevenue.toLocaleString()} DA`, 20, yPosition);
    yPosition += 10;
    doc.text(`Total Expenses: ${totalExpenses.toLocaleString()} DA`, 20, yPosition);
    yPosition += 10;
    doc.text(`Net Profit: ${profit.toLocaleString()} DA`, 20, yPosition);
    yPosition += 20;
    
    // Payments section
    doc.setFontSize(14);
    doc.text('Recent Payments', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(10);
    doc.text('Date', 20, yPosition);
    doc.text('Amount (DA)', 80, yPosition);
    doc.text('Type', 140, yPosition);
    
    doc.line(20, yPosition + 2, pageWidth - 20, yPosition + 2);
    yPosition += 10;
    
    payments.slice(0, 10).forEach((payment) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(new Date(payment.date).toLocaleDateString(), 20, yPosition);
      doc.text(payment.amount.toLocaleString(), 80, yPosition);
      doc.text(payment.paymentType, 140, yPosition);
      yPosition += 8;
    });
    
    doc.save('finance-report.pdf');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  // Generate Students Per Teacher Report (fixed: show students by subject/teacher assignment)
  const generateStudentsPerTeacherReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    doc.setFontSize(18);
    doc.text('Students per Teacher Report', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });

    let yPosition = 45;
    teachers.forEach((teacher) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFontSize(14);
      doc.text(`Teacher: ${teacher.fullName} (${teacher.subject})`, 20, yPosition);
      yPosition += 7;
      doc.setFontSize(10);
      doc.text(`Languages: ${(teacher.languages || []).join(', ') || '-'}`, 25, yPosition);
      yPosition += 6;
      // Find students assigned to this teacher (by subject)
      const assignedStudents = students.filter(student =>
        (student.subjects || []).some(sub => sub.teacherIds.includes(teacher.id))
      );
      doc.text(`Number of Students: ${assignedStudents.length}`, 25, yPosition);
      yPosition += 6;
      if (assignedStudents.length > 0) {
        doc.text('Students:', 30, yPosition);
        yPosition += 6;
        assignedStudents.forEach((student) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          const subjects = (student.subjects || []).filter(sub => sub.teacherIds.includes(teacher.id)).map(sub => sub.subjectName).join(', ');
          doc.text(`- ${student.fullName} (${subjects})`, 35, yPosition);
          yPosition += 5;
        });
      }
      yPosition += 8;
    });
    doc.save('students-per-teacher-report.pdf');
  };

  // Export all students as PDF (moved inside component)
  const exportAllStudentsPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    doc.setFontSize(18);
    doc.text('All Students List', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
    let yPosition = 45;
    doc.setFontSize(10);
    doc.text('Name', 20, yPosition);
    doc.text('Class', 70, yPosition);
    doc.text('Payment Type', 110, yPosition);
    doc.text('Status', 150, yPosition);
    yPosition += 8;
    students.forEach((student: Student) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(student.fullName.substring(0, 30), 20, yPosition);
      doc.text(student.class, 70, yPosition);
      doc.text(student.paymentType, 110, yPosition);
      doc.text(student.paymentStatus, 150, yPosition);
      yPosition += 7;
    });
    doc.save('all-students-list.pdf');
  };

  // Export all teachers as PDF (moved inside component)
  const exportAllTeachersPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    doc.setFontSize(18);
    doc.text('All Teachers List', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
    let yPosition = 45;
    doc.setFontSize(10);
    doc.text('Name', 20, yPosition);
    doc.text('Subject', 70, yPosition);
    doc.text('Salary Type', 110, yPosition);
    doc.text('Email', 150, yPosition);
    yPosition += 8;
    teachers.forEach((teacher: Teacher) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(teacher.fullName.substring(0, 30), 20, yPosition);
      doc.text(teacher.subject, 70, yPosition);
      doc.text(teacher.salaryType, 110, yPosition);
      doc.text(teacher.email || '-', 150, yPosition);
      yPosition += 7;
    });
    doc.save('all-teachers-list.pdf');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{I18nManager.t('reports')}</h1>
        <button
          onClick={handleBackupData}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors ml-4"
        >
          Backup Data
        </button>
      </div>

  {/* Report Cards */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">All Students</h3>
              <p className="text-sm text-gray-600">Export a list of all students</p>
            </div>
            <FileText size={24} className="text-blue-500" />
          </div>
          <button
            onClick={exportAllStudentsPDF}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
          >
            <Download size={16} />
            <span>Download PDF</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">All Teachers</h3>
              <p className="text-sm text-gray-600">Export a list of all teachers</p>
            </div>
            <FileText size={24} className="text-green-500" />
          </div>
          <button
            onClick={exportAllTeachersPDF}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
          >
            <Download size={16} />
            <span>Download PDF</span>
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Students per Teacher</h3>
              <p className="text-sm text-gray-600">Detailed list of students for each teacher, with subjects and languages</p>
            </div>
            <FileText size={24} className="text-purple-500" />
          </div>
          <button
            onClick={generateStudentsPerTeacherReport}
            className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2"
          >
            <Download size={16} />
            <span>Download PDF</span>
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Student List</h3>
              <p className="text-sm text-gray-600">Complete list of all students</p>
            </div>
            <FileText size={24} className="text-blue-500" />
          </div>
          <button
            onClick={generateStudentReport}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
          >
            <Download size={16} />
            <span>Download PDF</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Teacher List</h3>
              <p className="text-sm text-gray-600">Complete list of all teachers</p>
            </div>
            <FileText size={24} className="text-green-500" />
          </div>
          <button
            onClick={generateTeacherReport}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
          >
            <Download size={16} />
            <span>Download PDF</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Financial Report</h3>
              <p className="text-sm text-gray-600">Revenue, expenses, and profit</p>
            </div>
            <DollarSign size={24} className="text-orange-500" />
          </div>
          <button
            onClick={generateFinanceReport}
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
          >
            <Download size={16} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{students.length}</p>
            <p className="text-sm text-gray-600">Total Students</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{teachers.length}</p>
            <p className="text-sm text-gray-600">Total Teachers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{payments.length}</p>
            <p className="text-sm text-gray-600">Total Payments</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{expenses.length}</p>
            <p className="text-sm text-gray-600">Total Expenses</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsModule;