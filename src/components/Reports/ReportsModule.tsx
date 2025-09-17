  // Backup/export all data as JSON
  const handleBackupData = async () => {
    await db.init();
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
// ...existing code...
import I18nManager from '../../utils/i18n';
import type { Student, Teacher, Payment, Expense } from '../../types';
import { db } from '../../utils/database';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ReportsModule: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  // Note state
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
      console.error('Error loading report data:', error);
      setLoading(false);
    }
  };

  const generateStudentReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    doc.setFontSize(20);
    doc.text('TCC - Student Report', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
    doc.text(`Total Students: ${students.length}`, pageWidth / 2, 40, { align: 'center' });

    autoTable(doc, {
      startY: 50,
      head: [['Name', 'Class', 'Payment Type', 'Status']],
      body: students.map(student => [
        student.fullName,
        student.class,
        student.paymentType,
        student.paymentStatus
      ]),
      styles: { fillColor: [230, 240, 255], textColor: 20 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [255, 255, 255] },
      margin: { left: 20, right: 20 },
      theme: 'grid',
    });
    doc.save('students-report.pdf');
  };

  const generateTeacherReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    doc.setFontSize(20);
    doc.text('TCC - Teacher Report', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
    doc.text(`Total Teachers: ${teachers.length}`, pageWidth / 2, 40, { align: 'center' });

    autoTable(doc, {
      startY: 50,
      head: [['Name', 'Subject', 'Salary Type', 'Amount (DA)']],
      body: teachers.map(teacher => [
        teacher.fullName,
        teacher.subject,
        teacher.salaryType,
        teacher.salaryAmount.toLocaleString()
      ]),
      styles: { fillColor: [240, 255, 230], textColor: 20 },
      headStyles: { fillColor: [39, 174, 96], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [255, 255, 255] },
      margin: { left: 20, right: 20 },
      theme: 'grid',
    });
    doc.save('teachers-report.pdf');
  };

  const generateFinanceReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const profit = totalRevenue - totalExpenses;
    doc.setFontSize(20);
    doc.text('TCC - Financial Report', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });

    autoTable(doc, {
      startY: 40,
      head: [['Summary', 'Amount (DA)']],
      body: [
        ['Total Revenue', totalRevenue.toLocaleString()],
        ['Total Expenses', totalExpenses.toLocaleString()],
        ['Net Profit', profit.toLocaleString()]
      ],
      styles: { fillColor: [255, 245, 230], textColor: 20 },
      headStyles: { fillColor: [243, 156, 18], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [255, 255, 255] },
      margin: { left: 20, right: 20 },
      theme: 'grid',
    });
  // @ts-expect-error jsPDF-autotable adds lastAutoTable dynamically
  const nextY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 60;
    autoTable(doc, {
      startY: nextY,
      head: [['Date', 'Amount (DA)', 'Type']],
      body: payments.slice(0, 10).map(payment => [
        new Date(payment.date).toLocaleDateString(),
        payment.amount.toLocaleString(),
        payment.paymentType
      ]),
      styles: { fillColor: [230, 255, 245], textColor: 20 },
      headStyles: { fillColor: [39, 174, 96], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [255, 255, 255] },
      margin: { left: 20, right: 20 },
      theme: 'grid',
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

    let nextY = 40;
    teachers.forEach((teacher) => {
      const assignedStudents = students.filter(student =>
        (student.subjects || []).some(sub => sub.teacherIds.includes(teacher.id))
      );
      autoTable(doc, {
        startY: nextY,
        head: [[`Teacher: ${teacher.fullName} (${teacher.subject})`, 'Languages', 'Number of Students']],
        body: [[
          '',
          (teacher.languages || []).join(', ') || '-',
          assignedStudents.length
        ]],
        headStyles: { fillColor: [155, 89, 182], textColor: 255, fontStyle: 'bold' },
        styles: { fillColor: [245, 230, 255], textColor: 20 },
        margin: { left: 20, right: 20 },
        theme: 'grid',
      });
  // @ts-expect-error jsPDF-autotable adds lastAutoTable dynamically
  nextY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : nextY + 30;
      if (assignedStudents.length > 0) {
        autoTable(doc, {
          startY: nextY,
          head: [['Student Name', 'Subjects']],
          body: assignedStudents.map(student => [
            student.fullName,
            (student.subjects || []).filter(sub => sub.teacherIds.includes(teacher.id)).map(sub => sub.subjectName).join(', ')
          ]),
          headStyles: { fillColor: [52, 152, 219], textColor: 255, fontStyle: 'bold' },
          styles: { fillColor: [230, 240, 255], textColor: 20 },
          alternateRowStyles: { fillColor: [255, 255, 255] },
          margin: { left: 20, right: 20 },
          theme: 'grid',
        });
  // @ts-expect-error jsPDF-autotable adds lastAutoTable dynamically
  nextY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : nextY + 30;
      }
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
    autoTable(doc, {
      startY: 40,
      head: [['Name', 'Class', 'Payment Type', 'Status']],
      body: students.map(student => [
        student.fullName,
        student.class,
        student.paymentType,
        student.paymentStatus
      ]),
      styles: { fillColor: [230, 240, 255], textColor: 20 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [255, 255, 255] },
      margin: { left: 20, right: 20 },
      theme: 'grid',
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
    autoTable(doc, {
      startY: 40,
      head: [['Name', 'Subject', 'Salary Type', 'Email']],
      body: teachers.map(teacher => [
        teacher.fullName,
        teacher.subject,
        teacher.salaryType,
        teacher.email || '-'
      ]),
      styles: { fillColor: [240, 255, 230], textColor: 20 },
      headStyles: { fillColor: [39, 174, 96], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [255, 255, 255] },
      margin: { left: 20, right: 20 },
      theme: 'grid',
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
        {/* جميع البطاقات السابقة */}
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

        {/* خانة الملاحظة الجديدة */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Note | ملاحظة</h3>
              <p className="text-sm text-gray-600">اكتب ملاحظتك واحفظها ثم حملها PDF</p>
            </div>
            <FileText size={24} className="text-yellow-500" />
          </div>
          {!showNoteInput && !noteSaved && (
            <button
              onClick={() => setShowNoteInput(true)}
              className="w-full bg-yellow-400 text-white py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center space-x-2"
            >
              <span>كتابة ملاحظة</span>
            </button>
          )}
          {showNoteInput && !noteSaved && (
            <div className="space-y-2">
              <textarea
                className="w-full border rounded-lg p-2 min-h-[80px]"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="اكتب ملاحظتك هنا..."
              />
              <button
                onClick={() => { setNoteSaved(true); setShowNoteInput(false); }}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
              >
                حفظ الملاحظة
              </button>
            </div>
          )}
          {noteSaved && (
            <div className="space-y-2">
              <div className="bg-gray-50 border rounded-lg p-2 text-gray-800 whitespace-pre-wrap min-h-[80px]">{note}</div>
              <button
                onClick={() => {
                  const doc = new jsPDF();
                  doc.setFontSize(18);
                  doc.text('Note | Remarque', 20, 20);
                  doc.setFontSize(12);
                  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
                  doc.setFontSize(14);
                  // Remove Arabic characters from note
                  const filteredNote = note.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/g, '');
                  doc.text(filteredNote || 'No content (empty or unsupported language)', 20, 50, { maxWidth: 170 });
                  doc.save('note.pdf');
                }}
                className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Download size={16} />
                <span>Download PDF</span>
              </button>
              <button
                onClick={() => { setNote(''); setNoteSaved(false); }}
                className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                كتابة ملاحظة جديدة
              </button>
            </div>
          )}
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