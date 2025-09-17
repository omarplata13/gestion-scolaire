// دوال الإضافة والتحديث والحذف لكل جدول
ipcMain.handle('add-student', (event, student) => {
    db.prepare('INSERT INTO students (id, fullName, class, registrationDate, paymentType, lastPaymentDate, amountPaid, paymentStatus, balance, phoneNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(student.id, student.fullName, student.class, student.registrationDate, student.paymentType, student.lastPaymentDate, student.amountPaid, student.paymentStatus, student.balance, student.phoneNumber);
});
ipcMain.handle('update-student', (event, student) => {
    db.prepare('UPDATE students SET fullName=?, class=?, registrationDate=?, paymentType=?, lastPaymentDate=?, amountPaid=?, paymentStatus=?, balance=?, phoneNumber=? WHERE id=?')
        .run(student.fullName, student.class, student.registrationDate, student.paymentType, student.lastPaymentDate, student.amountPaid, student.paymentStatus, student.balance, student.phoneNumber, student.id);
});
ipcMain.handle('delete-student', (event, id) => {
    db.prepare('DELETE FROM students WHERE id=?').run(id);
});

ipcMain.handle('add-teacher', (event, teacher) => {
    db.prepare('INSERT INTO teachers (id, fullName, subject, salaryType, salaryAmount, assignedStudents, lastSalaryDate, assignedClass, salaryStatus, phoneNumber, languages, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(teacher.id, teacher.fullName, teacher.subject, teacher.salaryType, teacher.salaryAmount, teacher.assignedStudents, teacher.lastSalaryDate, teacher.assignedClass, teacher.salaryStatus, teacher.phoneNumber, JSON.stringify(teacher.languages), teacher.email);
});
ipcMain.handle('update-teacher', (event, teacher) => {
    db.prepare('UPDATE teachers SET fullName=?, subject=?, salaryType=?, salaryAmount=?, assignedStudents=?, lastSalaryDate=?, assignedClass=?, salaryStatus=?, phoneNumber=?, languages=?, email=? WHERE id=?')
        .run(teacher.fullName, teacher.subject, teacher.salaryType, teacher.salaryAmount, teacher.assignedStudents, teacher.lastSalaryDate, teacher.assignedClass, teacher.salaryStatus, teacher.phoneNumber, JSON.stringify(teacher.languages), teacher.email, teacher.id);
});
ipcMain.handle('delete-teacher', (event, id) => {
    db.prepare('DELETE FROM teachers WHERE id=?').run(id);
});

ipcMain.handle('add-payment', (event, payment) => {
    db.prepare('INSERT INTO payments (id, studentId, amount, date, paymentType, notes, teacherShare, schoolShare) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(payment.id, payment.studentId, payment.amount, payment.date, payment.paymentType, payment.notes, payment.teacherShare, payment.schoolShare);
});
ipcMain.handle('update-payment', (event, payment) => {
    db.prepare('UPDATE payments SET studentId=?, amount=?, date=?, paymentType=?, notes=?, teacherShare=?, schoolShare=? WHERE id=?')
        .run(payment.studentId, payment.amount, payment.date, payment.paymentType, payment.notes, payment.teacherShare, payment.schoolShare, payment.id);
});
ipcMain.handle('delete-payment', (event, id) => {
    db.prepare('DELETE FROM payments WHERE id=?').run(id);
});

ipcMain.handle('add-expense', (event, expense) => {
    db.prepare('INSERT INTO expenses (id, type, date, amount, notes) VALUES (?, ?, ?, ?, ?)')
        .run(expense.id, expense.type, expense.date, expense.amount, expense.notes);
});
ipcMain.handle('update-expense', (event, expense) => {
    db.prepare('UPDATE expenses SET type=?, date=?, amount=?, notes=? WHERE id=?')
        .run(expense.type, expense.date, expense.amount, expense.notes, expense.id);
});
ipcMain.handle('delete-expense', (event, id) => {
    db.prepare('DELETE FROM expenses WHERE id=?').run(id);
});

ipcMain.handle('add-attendance', (event, attendance) => {
    db.prepare('INSERT INTO attendance (id, studentId, teacherId, date, status, type) VALUES (?, ?, ?, ?, ?, ?)')
        .run(attendance.id, attendance.studentId, attendance.teacherId, attendance.date, attendance.status, attendance.type);
});
ipcMain.handle('update-attendance', (event, attendance) => {
    db.prepare('UPDATE attendance SET studentId=?, teacherId=?, date=?, status=?, type=? WHERE id=?')
        .run(attendance.studentId, attendance.teacherId, attendance.date, attendance.status, attendance.type, attendance.id);
});
ipcMain.handle('delete-attendance', (event, id) => {
    db.prepare('DELETE FROM attendance WHERE id=?').run(id);
});

ipcMain.handle('add-user', (event, user) => {
    db.prepare('INSERT INTO users (id, username, role, name) VALUES (?, ?, ?, ?)')
        .run(user.id, user.username, user.role, user.name);
});
ipcMain.handle('update-user', (event, user) => {
    db.prepare('UPDATE users SET username=?, role=?, name=? WHERE id=?')
        .run(user.username, user.role, user.name, user.id);
});
ipcMain.handle('delete-user', (event, id) => {
    db.prepare('DELETE FROM users WHERE id=?').run(id);
});
// Electron main process (ESM syntax)
import { app, BrowserWindow, ipcMain } from 'electron';
import db from './db.js';
// مثال: دالة لجلب جميع الطلاب من SQLite عبر IPC
ipcMain.handle('get-students', () => {
    return db.prepare('SELECT * FROM students').all();
});
ipcMain.handle('get-teachers', () => {
    return db.prepare('SELECT * FROM teachers').all();
});
ipcMain.handle('get-payments', () => {
    return db.prepare('SELECT * FROM payments').all();
});
ipcMain.handle('get-expenses', () => {
    return db.prepare('SELECT * FROM expenses').all();
});
ipcMain.handle('get-attendance', () => {
    return db.prepare('SELECT * FROM attendance').all();
});
ipcMain.handle('get-users', () => {
    return db.prepare('SELECT * FROM users').all();
});
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL;

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    if (isDev) {
        // Dev: load Vite dev server
        const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
        console.log('Loading from Vite dev server:', devUrl);
        win.loadURL(devUrl).catch((err) => {
            console.error('Failed to load Vite dev server:', err);
        });
    } else {
        // Prod: load built index.html (use pathToFileURL for Windows compatibility)
        const indexPath = path.join(__dirname, 'dist', 'index.html');
        const indexUrl = pathToFileURL(indexPath).toString();
        console.log('Loading index.html from:', indexUrl);
        win.loadURL(indexUrl).catch((err) => {
            console.error('Failed to load index.html:', err);
        });
    }

    // Open DevTools (optional)
    win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Re-create a window in the app when the dock icon is clicked (macOS)
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});