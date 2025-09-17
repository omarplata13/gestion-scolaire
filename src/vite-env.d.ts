/// <reference types="vite/client" />


import type { User, Student, Teacher, Payment, Expense, AttendanceRecord } from './types';

declare global {
	interface ElectronAPI {
		getAppVersion: () => Promise<string>;
		getStudents: () => Promise<Student[]>;
		getTeachers: () => Promise<Teacher[]>;
		getPayments: () => Promise<Payment[]>;
		getExpenses: () => Promise<Expense[]>;
		getAttendance: () => Promise<AttendanceRecord[]>;
		getUsers: () => Promise<User[]>;
	
	
		// Students CRUD
		addStudent: (student: Student) => Promise<void>;
		updateStudent: (student: Student) => Promise<void>;
		deleteStudent: (id: string) => Promise<void>;

		// Teachers CRUD
		addTeacher: (teacher: Teacher) => Promise<void>;
		updateTeacher: (teacher: Teacher) => Promise<void>;
		deleteTeacher: (id: string) => Promise<void>;

		// Payments CRUD
		addPayment: (payment: Payment) => Promise<void>;
		updatePayment: (payment: Payment) => Promise<void>;
		deletePayment: (id: string) => Promise<void>;

		// Expenses CRUD
		addExpense: (expense: Expense) => Promise<void>;
		updateExpense: (expense: Expense) => Promise<void>;
		deleteExpense: (id: string) => Promise<void>;

		// Attendance CRUD
		addAttendance: (attendance: AttendanceRecord) => Promise<void>;
		updateAttendance: (attendance: AttendanceRecord) => Promise<void>;
		deleteAttendance: (id: string) => Promise<void>;

		// Users CRUD
		addUser: (user: User) => Promise<void>;
		updateUser: (user: User) => Promise<void>;
		deleteUser: (id: string) => Promise<void>;
	}
	interface Window {
		electronAPI: ElectronAPI;
	}
}
