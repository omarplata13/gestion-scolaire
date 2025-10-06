import { openDB, IDBPDatabase } from 'idb';
import type { Student, Teacher, Payment, Expense, User, AttendanceRecord } from '../types';

let dbPromise: Promise<IDBPDatabase<unknown>> | null = null;

function getDB() {
	if (!dbPromise) {
		dbPromise = openDB('tcc-db', 2, {
			upgrade(db) {
				if (!db.objectStoreNames.contains('students')) db.createObjectStore('students', { keyPath: 'id' });
				if (!db.objectStoreNames.contains('teachers')) db.createObjectStore('teachers', { keyPath: 'id' });
				if (!db.objectStoreNames.contains('payments')) db.createObjectStore('payments', { keyPath: 'id' });
				if (!db.objectStoreNames.contains('expenses')) db.createObjectStore('expenses', { keyPath: 'id' });
				if (!db.objectStoreNames.contains('users')) db.createObjectStore('users', { keyPath: 'id' });
				if (!db.objectStoreNames.contains('attendance')) db.createObjectStore('attendance', { keyPath: 'id' });
			}
		});
	}
	return dbPromise;
}

export async function updateStudentPaymentStatus(): Promise<void> {
	const dbInstance = await getDB();
	const students = await dbInstance.getAll('students');
	const today = new Date();
	for (const student of students) {
		let shouldUpdate = false;
		if (student.paymentType === 'daily') {
			const lastDate = new Date(student.lastPaymentDate);
			if (
				lastDate.getFullYear() !== today.getFullYear() ||
				lastDate.getMonth() !== today.getMonth() ||
				lastDate.getDate() !== today.getDate()
			) {
				student.paymentStatus = 'unpaid';
				shouldUpdate = true;
			}
		} else if (student.paymentType === 'monthly') {
			const lastDate = new Date(student.lastPaymentDate);
			const diffMonths = (today.getFullYear() - lastDate.getFullYear()) * 12 + (today.getMonth() - lastDate.getMonth());
			if (diffMonths >= 1) {
				student.paymentStatus = 'unpaid';
				shouldUpdate = true;
			}
		}
		if (shouldUpdate) {
			await dbInstance.put('students', student);
		}
	}
}

export const db = {
	// Attendance
	async getAllAttendance(): Promise<AttendanceRecord[]> {
		const dbInstance = await getDB();
		return await dbInstance.getAll('attendance');
	},
	async addAttendance(record: AttendanceRecord): Promise<void> {
		const dbInstance = await getDB();
		await dbInstance.put('attendance', record);
	},
	async updateAttendance(record: AttendanceRecord): Promise<void> {
		const dbInstance = await getDB();
		await dbInstance.put('attendance', record);
	},
	async deleteAttendance(id: string): Promise<void> {
		const dbInstance = await getDB();
		await dbInstance.delete('attendance', id);
	},
	// Students
	async getAllStudents(): Promise<Student[]> {
		const dbInstance = await getDB();
		return await dbInstance.getAll('students');
	},
	async addStudent(student: Student): Promise<void> {
		const dbInstance = await getDB();
		await dbInstance.put('students', student);
	},
	async updateStudent(student: Student): Promise<void> {
		const dbInstance = await getDB();
		await dbInstance.put('students', student);
	},
	async deleteStudent(id: string): Promise<void> {
		const dbInstance = await getDB();
		await dbInstance.delete('students', id);
	},
	// Teachers
	async getAllTeachers(): Promise<Teacher[]> {
		const dbInstance = await getDB();
		return await dbInstance.getAll('teachers');
	},
	async addTeacher(teacher: Teacher): Promise<void> {
		const dbInstance = await getDB();
		await dbInstance.put('teachers', teacher);
	},
	async updateTeacher(teacher: Teacher): Promise<void> {
		const dbInstance = await getDB();
		await dbInstance.put('teachers', teacher);
	},
	async deleteTeacher(id: string): Promise<void> {
		const dbInstance = await getDB();
		await dbInstance.delete('teachers', id);
	},
	// Payments
	async getAllPayments(): Promise<Payment[]> {
		const dbInstance = await getDB();
		return await dbInstance.getAll('payments');
	},
	async addPayment(payment: Payment): Promise<void> {
		const dbInstance = await getDB();
		await dbInstance.put('payments', payment);
	},
	async updatePayment(payment: Payment): Promise<void> {
		const dbInstance = await getDB();
		await dbInstance.put('payments', payment);
	},
	async deletePayment(id: string): Promise<void> {
		const dbInstance = await getDB();
		await dbInstance.delete('payments', id);
	},
	// Expenses
	async getAllExpenses(): Promise<Expense[]> {
		const dbInstance = await getDB();
		return await dbInstance.getAll('expenses');
	},
	async addExpense(expense: Expense): Promise<void> {
		const dbInstance = await getDB();
		await dbInstance.put('expenses', expense);
	},
	async deleteExpense(id: string): Promise<void> {
		const dbInstance = await getDB();
		await dbInstance.delete('expenses', id);
	},
	// Users
	async getAllUsers(): Promise<User[]> {
		const dbInstance = await getDB();
		return await dbInstance.getAll('users');
	},
	async addUser(user: User): Promise<void> {
		const dbInstance = await getDB();
		await dbInstance.put('users', user);
	},
	async updateUser(user: User): Promise<void> {
		const dbInstance = await getDB();
		await dbInstance.put('users', user);
	},
	async deleteUser(id: string): Promise<void> {
		const dbInstance = await getDB();
		await dbInstance.delete('users', id);
	}
};

export async function initSampleData(): Promise<void> {
	const dbInstance = await getDB();
	const attendance = await dbInstance.getAll('attendance');
	const students = await dbInstance.getAll('students');
	const teachers = await dbInstance.getAll('teachers');
	const users = await dbInstance.getAll('users');

	if (attendance.length === 0) {
		await dbInstance.put('attendance', {
			id: 'att1',
			studentId: 'stu1',
			date: '2025-09-22',
			status: 'present'
		});
	}
	if (students.length === 0) {
		await dbInstance.put('students', {
			id: 'stu1',
			fullName: 'طالب تجريبي',
			class: 'A',
			registrationDate: '2025-09-01',
			paymentType: 'daily',
			lastPaymentDate: '2025-09-25',
			amountPaid: 0,
			paymentStatus: 'unpaid',
			balance: 0
		});
	}
	if (teachers.length === 0) {
		await dbInstance.put('teachers', {
			id: 'teach1',
			fullName: 'أستاذ تجريبي',
			subject: 'رياضيات',
			salaryType: 'fixed',
			salaryAmount: 0,
			assignedStudents: 0,
			salaryStatus: 'unpaid'
		});
	}
	const demoUsers = [
		{
			id: 'secretary',
			username: 'secretary',
			password: 'secretary123',
			role: 'secretary',
			name: 'Secretary User'
		},
		{
			id: 'director',
			username: 'director',
			password: 'director123',
			role: 'director',
			name: 'Director User'
		}
	];
	for (const demoUser of demoUsers) {
		const exists = users.some((u: User) => u.username === demoUser.username);
		if (!exists) {
			await dbInstance.put('users', demoUser);
		}
	}
}
