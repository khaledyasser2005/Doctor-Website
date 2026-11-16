import { Language } from '../types';

export interface Translations {
  brandName: string;
  brandSubtitle: string;
  nav: {
    home: string;
    about: string;
    specialization: string;
    certificates: string;
    reviews: string;
    clinic: string;
    contact: string;
    bookAppointment: string;
    login: string;
    createAccount: string;
    portal: string;
    admin: string;
  };
  hero: {
    availableBadge: string;
    trustedBadge: string;
    primaryCta: string;
    secondaryCta: string;
    experienceLabel: string;
    clinicLocationLabel: string;
    consultationModesLabel: string;
  };
  sections: {
    aboutKicker: string;
    aboutTitle: string;
    philosophyTitle: string;
    specializationKicker: string;
    specializationTitle: string;
    conditionsTitle: string;
    timelineKicker: string;
    timelineTitle: string;
    certificatesKicker: string;
    certificatesTitle: string;
    reviewsKicker: string;
    reviewsTitle: string;
    writeReview: string;
    verifiedPatient: string;
    clinicKicker: string;
    clinicTitle: string;
    getDirections: string;
    ctaTitle: string;
    ctaDesc: string;
    contactKicker: string;
    contactTitle: string;
  };
  whatsapp: {
    chatCta: string;
    sendBookingCta: string;
  };
  booking: {
    title: string;
    subtitle: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    step5: string;
    clinicVisit: string;
    clinicVisitDesc: string;
    onlineConsult: string;
    onlineConsultDesc: string;
    selectDateLabel: string;
    selectTimeLabel: string;
    noSlotsDay: string;
    patientInfoTitle: string;
    fullName: string;
    email: string;
    phone: string;
    notes: string;
    notesPlaceholder: string;
    submitRequest: string;
    summaryTitle: string;
    feeLabel: string;
    sentTitle: string;
    sentMessage: string;
    viewMyAppointments: string;
    addToCalendar: string;
    bookingIdLabel: string;
  };
  status: {
    Pending: string;
    Accepted: string;
    Rejected: string;
    Cancelled: string;
    Completed: string;
  };
  patientNav: {
    home: string;
    appointments: string;
    book: string;
    doctor: string;
    notifications: string;
    profile: string;
    settings: string;
    logout: string;
  };
  adminNav: {
    dashboard: string;
    appointments: string;
    calendar: string;
    patients: string;
    availability: string;
    reviews: string;
    certificates: string;
    analytics: string;
    profile: string;
    settings: string;
    logout: string;
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    registerTitle: string;
    registerSubtitle: string;
    continueWithGoogle: string;
    orEmail: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    phone: string;
    forgotPassword: string;
    signIn: string;
    createAccount: string;
    noAccount: string;
    haveAccount: string;
    adminLoginTitle: string;
    adminLoginSubtitle: string;
    changePasswordTitle: string;
    changePasswordDesc: string;
  };
  common: {
    save: string;
    cancel: string;
    edit: string;
    delete: string;
    add: string;
    back: string;
    next: string;
    search: string;
    loading: string;
    retry: string;
    close: string;
    download: string;
    date: string;
    time: string;
    type: string;
    status: string;
    actions: string;
    all: string;
    viewDetails: string;
  };
  footer: {
    rights: string;
    privacyNote: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    brandName: 'AL-SHIFA CLINIC',
    brandSubtitle: 'Medical Clinic · Banha',
    nav: {
      home: 'Home',
      about: 'About',
      specialization: 'Specialization',
      certificates: 'Certificates',
      reviews: 'Reviews',
      clinic: 'Clinic',
      contact: 'Contact',
      bookAppointment: 'Book Appointment',
      login: 'Login',
      createAccount: 'Create Account',
      portal: 'Patient Portal',
      admin: 'Doctor Admin',
    },
    hero: {
      availableBadge: 'Available for appointments',
      trustedBadge: 'Trusted by patients',
      primaryCta: 'Book an Appointment',
      secondaryCta: 'Explore My Profile',
      experienceLabel: 'Clinical Experience',
      clinicLocationLabel: 'Clinic Location',
      consultationModesLabel: 'Consultation Formats',
    },
    sections: {
      aboutKicker: 'About the Physician',
      aboutTitle: 'Dedicated clinical precision with calm, patient-centered care.',
      philosophyTitle: 'Medical Philosophy & Approach',
      specializationKicker: 'Clinical Focus',
      specializationTitle: 'Specialization & Core Services',
      conditionsTitle: 'Conditions & Consultations',
      timelineKicker: 'Academic & Clinical Path',
      timelineTitle: 'Experience & Qualifications',
      certificatesKicker: 'Verified Credentials',
      certificatesTitle: 'Certificates & Accreditations',
      reviewsKicker: 'Patient Feedback',
      reviewsTitle: 'Patient Reviews',
      writeReview: 'Share Your Review',
      verifiedPatient: 'Verified Booking',
      clinicKicker: 'Private Practice',
      clinicTitle: 'Clinic Information & Directions',
      getDirections: 'Get Directions',
      ctaTitle: 'Ready to book your consultation?',
      ctaDesc: 'Choose your preferred consultation type, date, and available time at Al-Shifa Medical Clinic in Banha.',
      contactKicker: 'Direct Communication',
      contactTitle: 'Reach the Clinic Directly',
    },
    whatsapp: {
      chatCta: 'Chat with Clinic',
      sendBookingCta: 'Send Booking Details via WhatsApp',
    },
    booking: {
      title: 'Book an Appointment',
      subtitle: 'Select your consultation type, preferred date, and an open time slot.',
      step1: 'Appointment Type',
      step2: 'Select Date',
      step3: 'Select Time',
      step4: 'Patient Info',
      step5: 'Confirmation',
      clinicVisit: 'Clinic Visit',
      clinicVisitDesc: 'In-person clinical evaluation at Al-Shifa Medical Clinic, Banha.',
      onlineConsult: 'Online Consultation',
      onlineConsultDesc: 'Direct remote medical consultation from the comfort of home.',
      selectDateLabel: 'Choose Consultation Date',
      selectTimeLabel: 'Available Time Slots',
      noSlotsDay: 'No available slots on this date. Please choose another day.',
      patientInfoTitle: 'Patient Information',
      fullName: 'Full Name',
      email: 'Email Address',
      phone: 'Phone / WhatsApp Number',
      notes: 'Reason for Visit / Clinical Notes (Optional)',
      notesPlaceholder: 'Briefly describe your symptoms, questions, or follow-up details...',
      submitRequest: 'Submit Appointment Request',
      summaryTitle: 'Appointment Summary',
      feeLabel: 'Consultation Fee',
      sentTitle: 'Appointment Request Sent',
      sentMessage:
        "Your appointment request has been sent to Al-Shifa Medical Clinic. You'll see the updated status in My Appointments once it has been reviewed.",
      viewMyAppointments: 'View My Appointments',
      addToCalendar: 'Add to Calendar',
      bookingIdLabel: 'Booking ID',
    },
    status: {
      Pending: 'Pending',
      Accepted: 'Accepted',
      Rejected: 'Rejected',
      Cancelled: 'Cancelled',
      Completed: 'Completed',
    },
    patientNav: {
      home: 'Home',
      appointments: 'My Appointments',
      book: 'Book Appointment',
      doctor: 'Doctor',
      notifications: 'Notifications',
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Sign Out',
    },
    adminNav: {
      dashboard: 'Dashboard',
      appointments: 'Appointments',
      calendar: 'Calendar',
      patients: 'Patients',
      availability: 'Availability',
      reviews: 'Reviews',
      certificates: 'Certificates',
      analytics: 'Website Analytics',
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Logout',
    },
    auth: {
      loginTitle: 'Patient Sign In',
      loginSubtitle: 'Access your appointments, status updates, and direct doctor details.',
      registerTitle: 'Create Patient Account',
      registerSubtitle: 'Register to book appointments and track confirmations in real time.',
      continueWithGoogle: 'Continue with Google',
      orEmail: 'or continue with email',
      email: 'Email Address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      fullName: 'Full Name',
      phone: 'Phone Number',
      forgotPassword: 'Forgot password?',
      signIn: 'Sign In',
      createAccount: 'Create Account',
      noAccount: 'New patient?',
      haveAccount: 'Already registered?',
      adminLoginTitle: 'Doctor Administration',
      adminLoginSubtitle: 'Private clinical practice management portal.',
      changePasswordTitle: 'Update Initial Password',
      changePasswordDesc:
        'For practice security, please set a personal administrator password before accessing the dashboard.',
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      add: 'Add',
      back: 'Back',
      next: 'Continue',
      search: 'Search',
      loading: 'Loading',
      retry: 'Retry',
      close: 'Close',
      download: 'Download',
      date: 'Date',
      time: 'Time',
      type: 'Type',
      status: 'Status',
      actions: 'Actions',
      all: 'All',
      viewDetails: 'View Details',
    },
    footer: {
      rights: 'Al-Shifa Medical Clinic — Banha. All rights reserved.',
      privacyNote: 'Confidential patient scheduling and private clinical care in Banha.',
    },
  },
  ar: {
    brandName: 'عيادة الشفاء الطبية',
    brandSubtitle: 'عيادة متخصصة · بنها',
    nav: {
      home: 'الرئيسية',
      about: 'عن الطبيب',
      specialization: 'التخصص',
      certificates: 'الشهادات',
      reviews: 'التقييمات',
      clinic: 'العيادة',
      contact: 'تواصل',
      bookAppointment: 'احجز موعداً',
      login: 'تسجيل الدخول',
      createAccount: 'إنشاء حساب',
      portal: 'بوابة المريض',
      admin: 'إدارة الطبيب',
    },
    hero: {
      availableBadge: 'متاح لاستقبال المواعيد',
      trustedBadge: 'موثوق من قِبل المرضى',
      primaryCta: 'احجز موعداً الآن',
      secondaryCta: 'استعراض الملف الشخصي',
      experienceLabel: 'الخبرة السريرية',
      clinicLocationLabel: 'موقع العيادة',
      consultationModesLabel: 'طرق الاستشارة',
    },
    sections: {
      aboutKicker: 'نبذة عن الطبيب',
      aboutTitle: 'رعاية طبية دقيقة ترتكز على ثقة المريض وراحته.',
      philosophyTitle: 'الفلسفة الطبية ومنهجية الرعاية',
      specializationKicker: 'المجال التخصصي',
      specializationTitle: 'التخصص والخدمات الطبية',
      conditionsTitle: 'الحالات والاستشارات المشمولة',
      timelineKicker: 'المسيرة الأكاديمية والمهنية',
      timelineTitle: 'الخبرات والمؤهلات العلمية',
      certificatesKicker: 'الاعتمادات الموثقة',
      certificatesTitle: 'الشهادات والزمالات المهنية',
      reviewsKicker: 'آراء المراجعين',
      reviewsTitle: 'تقييمات المرضى',
      writeReview: 'أضف تقييمك',
      verifiedPatient: 'حجز موثق',
      clinicKicker: 'العيادة الخاصة',
      clinicTitle: 'معلومات العيادة والموقع',
      getDirections: 'الحصول على الاتجاهات',
      ctaTitle: 'هل أنت جاهز لحجز استشارتك؟',
      ctaDesc: 'اختر نوع الاستشارة والتاريخ والوقت المتاح مباشرة في عيادة الشفاء الطبية ببنها.',
      contactKicker: 'تواصل مباشر',
      contactTitle: 'تواصل مع العيادة مباشرة',
    },
    whatsapp: {
      chatCta: 'تواصل مع العيادة',
      sendBookingCta: 'إرسال تفاصيل الحجز عبر واتساب',
    },
    booking: {
      title: 'حجز موعد طبي',
      subtitle: 'اختر نوع الاستشارة والتاريخ المناسب والوقت المتاح.',
      step1: 'نوع الموعد',
      step2: 'اختيار التاريخ',
      step3: 'اختيار الوقت',
      step4: 'بيانات المريض',
      step5: 'تأكيد الطلب',
      clinicVisit: 'زيارة العيادة',
      clinicVisitDesc: 'كشف سريري مباشر في عيادة الشفاء الطبية ببنها.',
      onlineConsult: 'استشارة عبر الإنترنت',
      onlineConsultDesc: 'استشارة طبية عن بُعد بكل خصوصية وراحة من منزلك.',
      selectDateLabel: 'اختر تاريخ الاستشارة',
      selectTimeLabel: 'المواعيد المتاحة',
      noSlotsDay: 'لا توجد مواعيد متاحة في هذا اليوم. يرجى اختيار تاريخ آخر.',
      patientInfoTitle: 'بيانات المريض',
      fullName: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف / واتساب',
      notes: 'سبب الزيارة / ملاحظات طبية (اختياري)',
      notesPlaceholder: 'اكتب باختصار الأعراض أو الاستفسارات الطبية...',
      submitRequest: 'إرسال طلب الحجز',
      summaryTitle: 'ملخص الموعد',
      feeLabel: 'رسوم الاستشارة',
      sentTitle: 'تم إرسال طلب الموعد بنجاح',
      sentMessage:
        'تم إرسال طلب موعدك إلى عيادة الشفاء الطبية. ستظهر الحالة المحدثة في صفحة مواعيدي فور مراجعة الطلب.',
      viewMyAppointments: 'عرض مواعيدي',
      addToCalendar: 'إضافة إلى التقويم',
      bookingIdLabel: 'رقم الحجز',
    },
    status: {
      Pending: 'قيد المراجعة',
      Accepted: 'مقبول',
      Rejected: 'مرفوض',
      Cancelled: 'ملغي',
      Completed: 'مكتمل',
    },
    patientNav: {
      home: 'الرئيسية',
      appointments: 'مواعيدي',
      book: 'حجز موعد',
      doctor: 'الطبيب',
      notifications: 'الإشعارات',
      profile: 'الملف الشخصي',
      settings: 'الإعدادات',
      logout: 'تسجيل الخروج',
    },
    adminNav: {
      dashboard: 'لوحة التحكم',
      appointments: 'المواعيد',
      calendar: 'التقويم',
      patients: 'المرضى',
      availability: 'ساعات العمل',
      reviews: 'التقييمات',
      certificates: 'الشهادات',
      analytics: 'تحليلات الموقع',
      profile: 'ملف الطبيب',
      settings: 'الإعدادات',
      logout: 'خروج',
    },
    auth: {
      loginTitle: 'تسجيل دخول المريض',
      loginSubtitle: 'تابع مواعيدك وحالة الحجز وتواصل مباشرة مع العيادة.',
      registerTitle: 'إنشاء حساب مريض جديد',
      registerSubtitle: 'سجّل لحجز المواعيد ومتابعة الموافقات الفورية.',
      continueWithGoogle: 'المتابعة باستخدام Google',
      orEmail: 'أو المتابعة بالبريد الإلكتروني',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      fullName: 'الاسم الكامل',
      phone: 'رقم الهاتف',
      forgotPassword: 'نسيت كلمة المرور؟',
      signIn: 'تسجيل الدخول',
      createAccount: 'إنشاء الحساب',
      noAccount: 'مريض جديد؟',
      haveAccount: 'لديك حساب بالفعل؟',
      adminLoginTitle: 'إدارة العيادة',
      adminLoginSubtitle: 'بوابة الإدارة الخاصة بالطبيب.',
      changePasswordTitle: 'تحديث كلمة المرور الأولية',
      changePasswordDesc:
        'لأمان العيادة، يرجى تعيين كلمة مرور خاصة قبل الدخول إلى لوحة التحكم.',
    },
    common: {
      save: 'حفظ',
      cancel: 'إلغاء',
      edit: 'تعديل',
      delete: 'حذف',
      add: 'إضافة',
      back: 'رجوع',
      next: 'متابعة',
      search: 'بحث',
      loading: 'جاري التحميل',
      retry: 'إعادة المحاولة',
      close: 'إغلاق',
      download: 'تنزيل',
      date: 'التاريخ',
      time: 'الوقت',
      type: 'النوع',
      status: 'الحالة',
      actions: 'إجراءات',
      all: 'الكل',
      viewDetails: 'التفاصيل',
    },
    footer: {
      rights: 'عيادة الشفاء الطبية — بنها. جميع الحقوق محفوظة.',
      privacyNote: 'جدولة طبية سرية ورعاية صحية خاصة في بنها.',
    },
  },
};
