export interface User {
  id: string;
  username: string;
  role: 'secretary' | 'director';
  name: string;
}

export interface Student {
  id: string;
  fullName: string;
  birthDate?: string;
  class: string;
  registrationDate: string;
  paymentType: 'monthly' | 'daily';
  lastPaymentDate: string;
  amountPaid: number;
  paymentStatus: 'paid' | 'unpaid';
  balance: number;
  phoneNumber?: string;
  parentPhone?: string;
  subjects?: StudentSubject[];
}

export interface StudentSubject {
  subjectName: string;
  teacherIds: string[];
}

export interface Teacher {
  id: string;
  fullName: string;
  subject: string;
  salaryType: 'fixed' | 'per_student';
  salaryAmount: number;
  lastSalaryDate?: string;
  assignedStudents: number;
  assignedClass?: string;
  salaryStatus: 'paid' | 'unpaid';
  phoneNumber?: string;
  languages?: string[];
  email?: string;
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  paymentType: 'monthly' | 'daily';
  teacherShare: number;
  schoolShare: number;
  notes?: string;
}

export interface Expense {
  id: string;
  type: string;
  date: string;
  amount: number;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId?: string;
  teacherId?: string;
  date: string;
  status: 'present' | 'absent';
  type: 'student' | 'teacher';
}

export interface Language {
  code: 'ar' | 'fr';
  name: string;
  direction: 'rtl' | 'ltr';
}