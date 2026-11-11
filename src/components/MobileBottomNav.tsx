import React from 'react';
import {
  Home,
  Calendar,
  Trophy,
  Sparkles,
  Users,
  Settings,
} from 'lucide-react';
import { usePickleball } from '../context/PickleballContext';

export interface MobileBottomNavProps {
  activeTab: 'home' | 'schedule' | 'rankings' | 'honor' | 'registration' | 'settings';
  setActiveTab: (
    tab: 'home' | 'schedule' | 'rankings' | 'honor' | 'registration' | 'settings'
  ) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { sessions, currentUser, isAdminOrSubAdmin } = usePickleball();

  // Count unregistered upcoming sessions for badge
  const unregisteredCount = sessions.filter(
    (s) =>
      (s.status === 'open_registration' || s.status === 'in_progress') &&
      !s.registeredPlayerIds.includes(currentUser.id)
  ).length;

  const navItems = [
    {
      id: 'home' as const,
      label: 'Trang Chủ',
      icon: Home,
    },
    {
      id: 'schedule' as const,
      label: 'Lịch Đấu',
      icon: Calendar,
    },
    {
      id: 'rankings' as const,
      label: 'Bảng Điểm',
      icon: Trophy,
    },
    {
      id: 'honor' as const,
      label: 'Vinh Danh',
      icon: Sparkles,
    },
    {
      id: 'registration' as const,
      label: 'Đăng Ký',
      icon: Users,
      badge: unregisteredCount > 0 ? unregisteredCount : undefined,
    },
    {
      id: 'settings' as const,
      label: 'Cài Đặt',
      icon: Settings,
      locked: !isAdminOrSubAdmin,
    },
  ];

  return (
    <nav
      aria-label="Thanh công cụ điều hướng di động"
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 shadow-[0_-8px_25px_rgba(0,0,0,0.5)] md:hidden pb-safe"
    >
      <div className="grid grid-cols-6 h-16 max-w-lg mx-auto px-1 items-center">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center h-full py-1 rounded-xl transition duration-150 cursor-pointer ${
                isActive
                  ? 'text-lime-400 font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active top indicator bar */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-lime-400 to-emerald-400 rounded-full shadow-[0_0_8px_rgba(163,230,53,0.8)]" />
              )}

              <div className="relative mt-0.5">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 drop-shadow-[0_0_6px_rgba(163,230,53,0.5)]' : ''
                  }`}
                />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-slate-900">
                    {item.badge}
                  </span>
                )}
                {item.locked && (
                  <span className="absolute -top-1 -right-1 text-[8px]">🔒</span>
                )}
              </div>

              <span
                className={`text-[10px] mt-1 tracking-tight truncate max-w-full px-0.5 ${
                  isActive ? 'text-lime-400 font-black' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
