// SQLite database setup for Electron main process
import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

// تحديد مسار قاعدة البيانات في مجلد المستخدم
const dbPath = path.join(app.getPath('userData'), 'database.sqlite');
const db = new Database(dbPath);

// إنشاء جداول أساسية إذا لم تكن موجودة
function initTables() {
  db.prepare(`CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    fullName TEXT,
    class TEXT,
    registrationDate TEXT,
    paymentType TEXT,
    lastPaymentDate TEXT,
    amountPaid INTEGER,
    paymentStatus TEXT,
    balance INTEGER,
    phoneNumber TEXT
  )`).run();

  db.prepare(`CREATE TABLE IF NOT EXISTS teachers (
    id TEXT PRIMARY KEY,
    fullName TEXT,
    subject TEXT,
    salaryType TEXT,
    salaryAmount INTEGER,
    assignedStudents INTEGER,
    lastSalaryDate TEXT,
    assignedClass TEXT,
    salaryStatus TEXT,
    phoneNumber TEXT,
    languages TEXT,
    email TEXT
  )`).run();

  db.prepare(`CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    studentId TEXT,
    amount INTEGER,
    date TEXT,
    paymentType TEXT,
    notes TEXT,
    teacherShare INTEGER,
    schoolShare INTEGER
  )`).run();

  db.prepare(`CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    type TEXT,
    date TEXT,
    amount INTEGER,
    notes TEXT
  )`).run();
}

initTables();

export default db;
