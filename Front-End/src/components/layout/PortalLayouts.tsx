import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Award,
  BarChart3,
  Bell,
  Calendar,
  CalendarDays,
  CalendarPlus,
  Clock,
  Globe,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  Moon,
  Settings,
  Stethoscope,
  Sun,
  User as UserIcon,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Avatar } from '../ui/Avatar';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

function PortalShell({
  title,
  subtitle,
  navItems,
  mobileBottomItems,
  homeLink,
  children,
}: {
  title: string;
  subtitle: string;
  navItems: NavItem[];
  mobileBottomItems: NavItem[];
  homeLink: string;
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(user?.role === 'Admin' ? '/doctor-admin/login' : '/');
  };

  return (
    <div className="min-h-screen bg-transparent text-[#0F1419] dark:text-[#F5F7FA] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-e border-black/8 dark:border-white/8 bg-white dark:bg-[#10141A] sticky top-0 h-screen">
        <div className="p-5 border-b border-black/8 dark:border-white/8">
          <Link to={homeLink} className="block">
            <p className="text-base font-extrabold tracking-tight text-[#0F1419] dark:text-[#F5F7FA]">
              {title}
            </p>
            <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0] mt-0.5">{subtitle}</p>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#148F77]/12 dark:bg-[#27C2A4]/15 text-[#0F766E] dark:text-[#27C2A4] font-semibold'
                    : 'text-[#5B6470] dark:text-[#9DA5B0] hover:text-[#0F1419] dark:hover:text-[#F5F7FA] hover:bg-black/4 dark:hover:bg-white/4'
                }`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-black/8 dark:border-white/8 space-y-3">
          {user && (
            <div className="flex items-center gap-2.5">
              <Avatar src={user.avatarUrl} name={user.fullName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate">{user.fullName}</p>
                <p className="text-[11px] text-[#5B6470] dark:text-[#9DA5B0] truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full h-9 px-3 rounded-xl border border-black/10 dark:border-white/10 text-xs font-semibold text-[#5B6470] dark:text-[#9DA5B0] hover:text-red-500 hover:border-red-500/30 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{user?.role === 'Admin' ? t.adminNav.logout : t.patientNav.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 min-w-0 flex flex-col pb-20 lg:pb-0">
        {/* Top Utility Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-black/8 dark:border-white/8 bg-[#F6F7F5]/90 dark:bg-[#080A0D]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <span className="lg:hidden font-extrabold text-sm tracking-tight">{title}</span>
          </div>

          <div className="flex items-center gap-2">
            {user?.role === 'Patient' && (
              <Link
                to="/"
                className="hidden sm:inline-flex h-9 px-3 rounded-xl border border-black/10 dark:border-white/10 items-center text-xs font-semibold text-[#5B6470] dark:text-[#9DA5B0] hover:text-[#0F1419] dark:hover:text-[#F5F7FA]"
              >
                {t.nav.home}
              </Link>
            )}
            <button
              type="button"
              onClick={toggleLanguage}
              className="h-9 px-2.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-semibold text-[#5B6470] dark:text-[#9DA5B0] flex items-center gap-1.5 cursor-pointer"
              aria-label="Toggle language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'AR' : 'EN'}</span>
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl border border-black/10 dark:border-white/10 text-[#5B6470] dark:text-[#9DA5B0] flex items-center justify-center cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/65 lg:hidden flex"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="w-72 h-full bg-white dark:bg-[#10141A] p-4 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 mb-3 border-b border-black/8 dark:border-white/8">
                <div>
                  <p className="text-sm font-extrabold">{title}</p>
                  <p className="text-xs text-[#5B6470] dark:text-[#9DA5B0]">{subtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg"
                  aria-label="Close navigation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                        isActive
                          ? 'bg-[#148F77]/12 dark:bg-[#27C2A4]/15 text-[#0F766E] dark:text-[#27C2A4] font-semibold'
                          : 'text-[#5B6470] dark:text-[#9DA5B0]'
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full h-10 rounded-xl border border-black/10 dark:border-white/10 text-xs font-semibold text-red-500 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>{user?.role === 'Admin' ? t.adminNav.logout : t.patientNav.logout}</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-16 border-t border-black/10 dark:border-white/10 bg-white/95 dark:bg-[#10141A]/95 backdrop-blur-md grid grid-cols-5 px-1">
        {mobileBottomItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 text-[10px] font-semibold ${
                isActive
                  ? 'text-[#148F77] dark:text-[#27C2A4]'
                  : 'text-[#5B6470] dark:text-[#9DA5B0]'
              }`
            }
          >
            {item.icon}
            <span className="truncate max-w-[64px]">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function PatientLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const navItems: NavItem[] = [
    { to: '/patient/home', label: t.patientNav.home, icon: <Home className="w-4 h-4" /> },
    { to: '/patient/appointments', label: t.patientNav.appointments, icon: <Calendar className="w-4 h-4" /> },
    { to: '/patient/book', label: t.patientNav.book, icon: <CalendarPlus className="w-4 h-4" /> },
    { to: '/patient/doctor', label: t.patientNav.doctor, icon: <Stethoscope className="w-4 h-4" /> },
    { to: '/patient/notifications', label: t.patientNav.notifications, icon: <Bell className="w-4 h-4" /> },
    { to: '/patient/profile', label: t.patientNav.profile, icon: <UserIcon className="w-4 h-4" /> },
    { to: '/patient/settings', label: t.patientNav.settings, icon: <Settings className="w-4 h-4" /> },
  ];

  const mobileBottomItems: NavItem[] = [
    navItems[0],
    navItems[1],
    navItems[2],
    navItems[4],
    navItems[5],
  ];

  return (
    <PortalShell
      title={t.brandName}
      subtitle={t.nav.portal}
      navItems={navItems}
      mobileBottomItems={mobileBottomItems}
      homeLink="/patient/home"
    >
      {children}
    </PortalShell>
  );
}

export function DoctorAdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const navItems: NavItem[] = [
    { to: '/doctor-admin/dashboard', label: t.adminNav.dashboard, icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/doctor-admin/appointments', label: t.adminNav.appointments, icon: <Calendar className="w-4 h-4" /> },
    { to: '/doctor-admin/calendar', label: t.adminNav.calendar, icon: <CalendarDays className="w-4 h-4" /> },
    { to: '/doctor-admin/patients', label: t.adminNav.patients, icon: <Users className="w-4 h-4" /> },
    { to: '/doctor-admin/availability', label: t.adminNav.availability, icon: <Clock className="w-4 h-4" /> },
    { to: '/doctor-admin/reviews', label: t.adminNav.reviews, icon: <MessageSquareQuote className="w-4 h-4" /> },
    { to: '/doctor-admin/certificates', label: t.adminNav.certificates, icon: <Award className="w-4 h-4" /> },
    { to: '/doctor-admin/analytics', label: t.adminNav.analytics, icon: <BarChart3 className="w-4 h-4" /> },
    { to: '/doctor-admin/profile', label: t.adminNav.profile, icon: <Stethoscope className="w-4 h-4" /> },
    { to: '/doctor-admin/settings', label: t.adminNav.settings, icon: <Settings className="w-4 h-4" /> },
  ];

  const mobileBottomItems: NavItem[] = [
    navItems[0],
    navItems[2],
    navItems[1],
    navItems[3],
    navItems[8],
  ];

  return (
    <PortalShell
      title={t.brandName}
      subtitle={t.auth.adminLoginTitle}
      navItems={navItems}
      mobileBottomItems={mobileBottomItems}
      homeLink="/doctor-admin/dashboard"
    >
      {children}
    </PortalShell>
  );
}
