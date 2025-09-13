import type { Student, Teacher, Payment, Expense } from '../types';

export const calculateStudentBalance = (student: Student, payments: Payment[]): number => {
  const studentPayments = payments.filter(p => p.studentId === student.id);
  const totalPaid = studentPayments.reduce((sum, payment) => sum + payment.amount, 0);
  
  // Calculate expected amount based on payment type and registration date
  const registrationDate = new Date(student.registrationDate);
  const now = new Date();
  const monthsDiff = (now.getFullYear() - registrationDate.getFullYear()) * 12 + 
                    (now.getMonth() - registrationDate.getMonth());
  
  let expectedAmount = 0;
  if (student.paymentType === 'monthly') {
    expectedAmount = monthsDiff * student.amountPaid; // amountPaid represents monthly fee
  } else {
    // For daily payments, calculate based on days since registration
    const daysDiff = Math.floor((now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24));
    expectedAmount = daysDiff * student.amountPaid; // amountPaid represents daily fee
  }
  
  return Math.max(0, expectedAmount - totalPaid);
};

export const calculateTotalRevenue = (payments: Payment[]): number => {
  return payments.reduce((sum, payment) => sum + payment.amount, 0);
};

export const calculateSalaryExpenses = (teachers: Teacher[]): number => {
  return teachers.reduce((sum, teacher) => {
    if (teacher.salaryType === 'fixed') {
      return sum + teacher.salaryAmount;
    } else {
      // For per_student salary type, multiply by assigned students
      return sum + (teacher.salaryAmount * teacher.assignedStudents);
    }
  }, 0);
};

export const calculateOtherExpenses = (expenses: Expense[]): number => {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
};

export const calculateProfit = (revenue: number, salaryExpenses: number, otherExpenses: number): number => {
  return revenue - salaryExpenses - otherExpenses;
};

export const getUnpaidStudents = (students: Student[]): Student[] => {
  return students.filter(student => student.paymentStatus === 'unpaid');
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};