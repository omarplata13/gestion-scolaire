import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { db, initSampleData } from './utils/database';
import { AuthManager } from './utils/auth';
import I18nManager from './utils/i18n';
import LoginForm from './components/Login/LoginForm';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import StudentTable from './components/Students/StudentTable';
import TeacherTable from './components/Teachers/TeacherTable';
import FinanceModule from './components/Finance/FinanceModule';
import AttendanceModule from './components/Attendance/AttendanceModule';
import ExpenseTable from './components/Expenses/ExpenseTable';
import ReportsModule from './components/Reports/ReportsModule';
import EmploiDuTemps from './components/EmploiDuTemps/EmploiDuTemps';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [, setCurrentLanguage] = useState<'ar' | 'fr'>('fr');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    let errorMsg = '';
    try {
      console.log('[DEBUG] Initializing database...');
      await db.init();
      console.log('[DEBUG] Database initialized. Adding sample data if needed...');
      await initSampleData();
      console.log('[DEBUG] Sample data initialization complete.');
      // Set language
      const savedLang = I18nManager.getCurrentLanguage();
      setCurrentLanguage(savedLang);
      I18nManager.setLanguage(savedLang);
      // Check authentication
      setIsAuthenticated(AuthManager.isAuthenticated());
    } catch (error: unknown) {
      console.error('[DEBUG] Error initializing app:', error);
      errorMsg = (error && typeof error === 'object' && 'message' in error)
        ? (error as { message: string }).message
        : String(error);
    } finally {
      setIsInitialized(true);
      if (errorMsg) {
        alert('Error initializing app: ' + errorMsg);
      }
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    AuthManager.logout();
    setIsAuthenticated(false);
  };

  const handleLanguageChange = (lang: 'ar' | 'fr') => {
    I18nManager.setLanguage(lang);
    setCurrentLanguage(lang);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }


  const isRTL = I18nManager.isRTL();

  return (
    <Router>
      <div className={`min-h-screen bg-gray-100 ${isRTL ? 'rtl' : 'ltr'}`}>
        <Sidebar onLogout={handleLogout} />
        <Header onLanguageChange={handleLanguageChange} />
        <main className={`${isRTL ? 'pr-64' : 'pl-64'} transition-all duration-300`}>
          <div className="pt-16 p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/students" element={<StudentTable />} />
              <Route path="/teachers" element={<TeacherTable />} />
              <Route path="/finance" element={<FinanceModule />} />
              <Route path="/attendance" element={<AttendanceModule />} />
              <Route path="/expenses" element={<ExpenseTable />} />
              <Route path="/reports" element={<ReportsModule />} />
              <Route path="/emploi" element={<EmploiDuTemps />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;

// In package.json, under "build" configuration, add or modify the "win" section as follows:
// "build": {
//   // ...existing config...
//   "win": {
//     "sign": false
//   }
// }