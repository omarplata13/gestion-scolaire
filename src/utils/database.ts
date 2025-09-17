import type { User, Student, Teacher, Payment, Expense, AttendanceRecord } from '../types';

// دالة لمسح قاعدة البيانات بالكامل
// تم تعطيل دالة إعادة تهيئة قاعدة البيانات لحماية بيانات المستخدم
export const resetDatabase = async (): Promise<void> => {
  throw new Error('تم تعطيل دالة إعادة تهيئة قاعدة البيانات لحماية بياناتك.');
};
interface DBSchema {
  users: User[];
  students: Student[];
  teachers: Teacher[];
  payments: Payment[];
  expenses: Expense[];
  attendance: AttendanceRecord[];
}

class IndexedDBManager {
  private dbName = 'tcc_school_db';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        const stores = ['users', 'students', 'teachers', 'payments', 'expenses', 'attendance'];
        
        stores.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id' });
            
            // Create indexes for common queries
            if (storeName === 'students') {
              store.createIndex('paymentStatus', 'paymentStatus', { unique: false });
              store.createIndex('class', 'class', { unique: false });
            }
            if (storeName === 'attendance') {
              store.createIndex('date', 'date', { unique: false });
              store.createIndex('studentId', 'studentId', { unique: false });
              store.createIndex('teacherId', 'teacherId', { unique: false });
            }
            if (storeName === 'payments') {
              store.createIndex('studentId', 'studentId', { unique: false });
              store.createIndex('date', 'date', { unique: false });
            }
          }
        });
      };
    });
  }

  async add<T extends keyof DBSchema>(storeName: T, data: DBSchema[T][0]): Promise<void> {
    return this.performTransaction(storeName, 'readwrite', (store) => {
      store.add(data);
    });
  }

  async update<T extends keyof DBSchema>(storeName: T, data: DBSchema[T][0]): Promise<void> {
    return this.performTransaction(storeName, 'readwrite', (store) => {
      store.put(data);
    });
  }

  async delete<T extends keyof DBSchema>(storeName: T, id: string): Promise<void> {
    return this.performTransaction(storeName, 'readwrite', (store) => {
      store.delete(id);
    });
  }

  async getAll<T extends keyof DBSchema>(storeName: T): Promise<DBSchema[T]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as DBSchema[T]);
      request.onerror = () => reject(request.error);
    });
  }

  async getById<T extends keyof DBSchema>(storeName: T, id: string): Promise<DBSchema[T][0] | undefined> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result as DBSchema[T][0] | undefined);
      request.onerror = () => reject(request.error);
    });
  }

  private async performTransaction<T extends keyof DBSchema>(
    storeName: T,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      
      operation(store);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

export const db = new IndexedDBManager();

// Initialize sample data
export const initSampleData = async (): Promise<void> => {
  const users = await db.getAll('users');
  if (users.length === 0) {
    // Add default users
    await db.add('users', {
      id: '1',
      username: 'secretary',
      role: 'secretary',
      name: 'Secretary User'
    });
    
    await db.add('users', {
      id: '2',
      username: 'director',
      role: 'director',
      name: 'Director User'
    });

    // Add sample students
    const sampleStudents = [
      {
        id: 'student1',
        fullName: 'Ahmed Benali',
        class: 'Terminal S',
        registrationDate: new Date('2024-09-01').toISOString(),
        paymentType: 'monthly' as const,
        lastPaymentDate: new Date('2024-12-01').toISOString(),
        amountPaid: 5000,
        paymentStatus: 'paid' as const,
        balance: 0,
        phoneNumber: '0555123456',
        subjects: [
          { subjectName: 'Mathematics', teacherIds: ['teacher1'] },
          { subjectName: 'Physics', teacherIds: ['teacher2'] }
        ]
      },
      {
        id: 'student2',
        fullName: 'Fatima Khelifi',
        class: '1ère AS',
        registrationDate: new Date('2024-09-01').toISOString(),
        paymentType: 'monthly' as const,
        lastPaymentDate: new Date('2024-11-01').toISOString(),
        amountPaid: 4500,
        paymentStatus: 'unpaid' as const,
        balance: 4500,
        phoneNumber: '0666789012',
        subjects: [
          { subjectName: 'French', teacherIds: ['teacher1'] }
        ]
      },
      {
        id: 'student3',
        fullName: 'Mohamed Saidi',
        class: '2ème AS',
        registrationDate: new Date('2024-09-15').toISOString(),
        paymentType: 'daily' as const,
        lastPaymentDate: new Date('2024-12-01').toISOString(),
        amountPaid: 200,
        paymentStatus: 'paid' as const,
        balance: 0,
        phoneNumber: '0777345678',
        subjects: [
          { subjectName: 'Mathematics', teacherIds: ['teacher1'] },
          { subjectName: 'Physics', teacherIds: ['teacher2'] }
        ]
      }
    ];

    for (const student of sampleStudents) {
      await db.add('students', student);
    }

    // Add sample teachers
    const sampleTeachers = [
      {
        id: 'teacher1',
        fullName: 'Dr. Amina Boudjema',
        subject: 'Mathematics',
        salaryType: 'fixed' as const,
        salaryAmount: 45000,
        assignedStudents: 25,
        lastSalaryDate: new Date('2024-12-01').toISOString(),
        assignedClass: 'Terminal S',
        salaryStatus: 'paid' as const
      },
      {
        id: 'teacher2',
        fullName: 'Prof. Karim Meziane',
        subject: 'Physics',
        salaryType: 'per_student' as const,
        salaryAmount: 1500,
        assignedStudents: 20,
        lastSalaryDate: new Date('2024-12-01').toISOString(),
        assignedClass: '1ère AS',
        salaryStatus: 'unpaid' as const
      }
    ];

    for (const teacher of sampleTeachers) {
      await db.add('teachers', teacher);
    }

    // Add sample payments
    const samplePayments = [
      {
        id: 'payment1',
        studentId: 'student1',
        amount: 5000,
        date: new Date('2024-12-01').toISOString(),
        paymentType: 'monthly' as const,
        notes: 'December payment',
        teacherShare: 0,
        schoolShare: 0
      },
      {
        id: 'payment2',
        studentId: 'student2',
        amount: 4500,
        date: new Date('2024-11-01').toISOString(),
        paymentType: 'monthly' as const,
        notes: 'November payment',
        teacherShare: 0,
        schoolShare: 0
      },
      {
        id: 'payment3',
        studentId: 'student3',
        amount: 6000,
        date: new Date('2024-12-01').toISOString(),
        paymentType: 'daily' as const,
        notes: 'Daily payments for December',
        teacherShare: 0,
        schoolShare: 0
      },
      {
        id: 'payment4',
        studentId: 'student2',
        amount: 4500,
        date: new Date('2024-11-01').toISOString(),
        paymentType: 'monthly' as const,
        notes: 'November payment',
        teacherShare: 0,
        schoolShare: 0
      }
    ];

    for (const payment of samplePayments) {
      await db.add('payments', payment);
    }

    // Add sample expenses
    const sampleExpenses = [
      {
        id: 'expense1',
        type: 'Rent',
        date: new Date('2024-12-01').toISOString(),
        amount: 15000,
        notes: 'Monthly rent for December'
      },
      {
        id: 'expense2',
        type: 'Electricity',
        date: new Date('2024-12-01').toISOString(),
        amount: 3500,
        notes: 'Electricity bill'
      },
      {
        id: 'expense3',
        type: 'Office Supplies',
        date: new Date('2024-11-15').toISOString(),
        amount: 2000,
        notes: 'Books and stationery'
      },
      {
        id: 'expense4',
        type: 'Internet',
        date: new Date('2024-12-01').toISOString(),
        amount: 1500,
        notes: 'Monthly internet subscription'
      }
    ];

    for (const expense of sampleExpenses) {
      await db.add('expenses', expense);
    }
  }
};