interface TranslationKey {
  ar: string;
  fr: string;
}

interface Translations {
  [key: string]: TranslationKey;
}

export const translations: Translations = {
  emploiDuTemps: { ar: 'جدول الحصص', fr: 'Emploi du temps' },
  centerName: { ar: 'مركز التدريب والتأهيل', fr: 'Centre de formation et de coaching' },
  alerts: { ar: 'التنبيهات', fr: 'Alertes' },
  unpaidStudentsAlert: { ar: 'طالب/طلاب غير مدفوعين', fr: 'élève(s) non payé(s)' },
  unpaidStudentsDesc: { ar: 'هؤلاء الطلاب غير مدفوعين وقد يحتاجون للمتابعة', fr: 'Ces élèves sont marqués comme non payés et peuvent nécessiter un suivi' },
  negativeProfit: { ar: 'خسارة مالية', fr: 'Profit négatif' },
  negativeProfitDesc: { ar: 'المصروفات تتجاوز الإيرادات هذا الشهر', fr: 'Les dépenses dépassent les revenus ce mois-ci' },
  allGood: { ar: 'كل شيء جيد!', fr: 'Tout est bon !' },
  noCriticalIssues: { ar: 'لا توجد مشاكل حرجة حالياً', fr: 'Aucun problème critique pour le moment' },
  // Navigation
  dashboard: { ar: 'لوحة التحكم', fr: 'Tableau de bord' },
  students: { ar: 'الطلاب', fr: 'Étudiants' },
  teachers: { ar: 'المعلمون', fr: 'Enseignants' },
  finance: { ar: 'المالية', fr: 'Finance' },
  attendance: { ar: 'الحضور', fr: 'Présence' },
  expenses: { ar: 'المصروفات', fr: 'Dépenses' },
  reports: { ar: 'التقارير', fr: 'Rapports' },
  
  // Common
  add: { ar: 'إضافة', fr: 'Ajouter' },
  edit: { ar: 'تعديل', fr: 'Modifier' },
  delete: { ar: 'حذف', fr: 'Supprimer' },
  save: { ar: 'حفظ', fr: 'Enregistrer' },
  cancel: { ar: 'إلغاء', fr: 'Annuler' },
  search: { ar: 'بحث', fr: 'Rechercher' },
  total: { ar: 'المجموع', fr: 'Total' },
  status: { ar: 'الحالة', fr: 'Statut' },
  actions: { ar: 'الإجراءات', fr: 'Actions' },
  
  // Students
  fullName: { ar: 'الاسم الكامل', fr: 'Nom complet' },
  class: { ar: 'الفصل', fr: 'Classe' },
  registrationDate: { ar: 'تاريخ التسجيل', fr: 'Date d\'inscription' },
  paymentType: { ar: 'نوع الدفع', fr: 'Type de paiement' },
  monthly: { ar: 'شهري', fr: 'Mensuel' },
  daily: { ar: 'يومي', fr: 'Quotidien' },
  lastPaymentDate: { ar: 'تاريخ آخر دفعة', fr: 'Dernière date de paiement' },
  amountPaid: { ar: 'المبلغ المدفوع', fr: 'Montant payé' },
  paymentStatus: { ar: 'حالة الدفع', fr: 'Statut de paiement' },
  paid: { ar: 'مدفوع', fr: 'Payé' },
  unpaid: { ar: 'غير مدفوع', fr: 'Non payé' },
  updatePaymentStatus: { ar: 'تحديث حالة الدفع', fr: 'Mettre à jour le statut de paiement' },
  
  // Teachers
  subject: { ar: 'المادة', fr: 'Matière' },
  salaryType: { ar: 'نوع الراتب', fr: 'Type de salaire' },
  fixed: { ar: 'ثابت', fr: 'Fixe' },
  perStudent: { ar: 'لكل طالب', fr: 'Par étudiant' },
  salaryAmount: { ar: 'مقدار الراتب', fr: 'Montant du salaire' },
  assignedStudents: { ar: 'الطلاب المخصصين', fr: 'Étudiants assignés' },
  
  // Finance
  revenue: { ar: 'الإيرادات', fr: 'Revenus' },
  salaryExpenses: { ar: 'مصروفات الرواتب', fr: 'Dépenses salariales' },
  otherExpenses: { ar: 'مصروفات أخرى', fr: 'Autres dépenses' },
  profit: { ar: 'الربح', fr: 'Profit' },
  
  // Attendance
  present: { ar: 'حاضر', fr: 'Présent' },
  absent: { ar: 'غائب', fr: 'Absent' },
  
  // Dashboard
  totalStudents: { ar: 'إجمالي الطلاب', fr: 'Total des étudiants' },
  totalTeachers: { ar: 'إجمالي المعلمين', fr: 'Total des enseignants' },
  unpaidStudents: { ar: 'الطلاب غير المدفوعين', fr: 'Étudiants non payés' },
  
  // Login
  login: { ar: 'تسجيل الدخول', fr: 'Connexion' },
  username: { ar: 'اسم المستخدم', fr: 'Nom d\'utilisateur' },
  password: { ar: 'كلمة المرور', fr: 'Mot de passe' },
  logout: { ar: 'تسجيل الخروج', fr: 'Déconnexion' },
  
  // Validation
  required: { ar: 'هذا الحقل مطلوب', fr: 'Ce champ est requis' },
  invalidEmail: { ar: 'البريد الإلكتروني غير صحيح', fr: 'Email invalide' },
  invalidAmount: { ar: 'المبلغ غير صحيح', fr: 'Montant invalide' },
  
  // Currency
  currency: { ar: 'دج', fr: 'DA' }
};

class I18nManager {
  private static currentLang: 'ar' | 'fr' = 'fr';
  
  static setLanguage(lang: 'ar' | 'fr'): void {
    this.currentLang = lang;
    localStorage.setItem('tcc_language', lang);
    
    // Update document direction
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }
  
  static getCurrentLanguage(): 'ar' | 'fr' {
    const stored = localStorage.getItem('tcc_language') as 'ar' | 'fr';
    if (stored && ['ar', 'fr'].includes(stored)) {
      this.currentLang = stored;
    }
    return this.currentLang;
  }
  
  static t(key: string): string {
    if (translations[key]) {
      return translations[key][this.currentLang];
    }
    return key;
  }
  
  static isRTL(): boolean {
    return this.currentLang === 'ar';
  }
  
  static formatCurrency(amount: number | undefined | null): string {
    const currency = this.t('currency');
    let safeAmount = Number(amount);
    if (!isFinite(safeAmount) || isNaN(safeAmount)) safeAmount = 0;
    if (this.isRTL()) {
      return `${safeAmount.toLocaleString('ar-DZ')} ${currency}`;
    }
    return `${safeAmount.toLocaleString('fr-FR')} ${currency}`;
  }
}

export default I18nManager;