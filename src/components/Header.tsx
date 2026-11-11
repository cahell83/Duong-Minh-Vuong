import React, { useState } from 'react';
import {
  Trophy,
  Calendar,
  Users,
  Settings,
  Shield,
  Crown,
  UserCheck,
  ChevronDown,
  RotateCcw,
  Sparkles,
  UserPlus,
  Edit,
  Home,
  Smartphone,
} from 'lucide-react';
import { usePickleball } from '../context/PickleballContext';
import { UserRole } from '../types/pickleball';
import { UserAvatar } from './UserAvatar';
import { MemberProfileModal } from './MemberProfileModal';
import { PWAInstallModal } from './PWAInstallModal';

interface HeaderProps {
  activeTab: 'home' | 'schedule' | 'rankings' | 'honor' | 'registration' | 'settings';
  setActiveTab: (
    tab: 'home' | 'schedule' | 'rankings' | 'honor' | 'registration' | 'settings'
  ) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const {
    currentUser,
    setCurrentUserId,
    players,
    sessions,
    activeSessionId,
    setActiveSessionId,
    isAdminOrSubAdmin,
    resetAllData,
  } = usePickleball();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [profileModalMode, setProfileModalMode] = useState<'register' | 'edit_self' | 'login' | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Crown className="w-3.5 h-3.5 text-amber-400" /> Quản trị viên
          </span>
        );
      case 'sub_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
            <Shield className="w-3.5 h-3.5 text-sky-400" /> Phó quản trị
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Thành viên
          </span>
        );
    }
  };

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 shadow-xl">
      {/* Top Banner Notice for Role Permissions */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 px-4 py-1.5 text-xs border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-slate-300">
            Hệ thống giải đấu CLB Pickleball: <span className="text-lime-400 font-semibold">Quy tắc chuẩn 1 trận đánh - 1 trận nghỉ</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 hidden sm:inline text-[11px]">
            Đang đóng vai: <strong className="text-white">{currentUser.name}</strong> ({currentUser.gender === 'male' ? 'Nam' : 'Nữ'})
          </span>
          {!isAdminOrSubAdmin && (
            <span className="text-amber-400/90 text-[11px] font-medium hidden md:inline">
              (Chế độ thành viên: Chỉ xem trực tiếp & đăng ký lịch)
            </span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo & Name */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-lime-500 shadow-lg shadow-lime-500/20 text-slate-950 font-black group-hover:scale-105 transition">
              <span className="text-xl">🐶</span>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-[8px] text-white">
                🏓
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white group-hover:text-lime-300 transition">
                  PICKLEBALL <span className="text-lime-400">CÚN CƯNG</span>
                </span>
                <span className="text-[10px] font-bold tracking-widest px-1.5 py-0.5 rounded bg-lime-400/20 text-lime-300 border border-lime-400/30">
                  CLB 🐶
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Cân bằng DUPR • Đánh 1 trận, Nghỉ 1 trận • 4 Nam, 4 Nữ, Nam Nữ
              </p>
            </div>
          </div>

          {/* Center: Session quick switch */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60">
            <Calendar className="w-4 h-4 text-lime-400 ml-1.5" />
            <select
              value={activeSessionId}
              onChange={(e) => setActiveSessionId(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-200 outline-none cursor-pointer max-w-[240px] truncate pr-2"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                  {s.name} ({s.date})
                </option>
              ))}
            </select>
          </div>

          {/* Right: Role Switcher & User Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Quick Install Web App PWA Button */}
            <button
              onClick={() => setShowInstallModal(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700/90 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400 shadow-sm transition hover:scale-105 cursor-pointer"
              title="Cài đặt App Pickleball Cún Cưng lên màn hình chính điện thoại"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Cài Đặt App</span>
              <span className="sm:hidden">Cài App</span>
            </button>

            {/* Quick Register Member Button */}
            <button
              onClick={() => setProfileModalMode('register')}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-lime-400 to-emerald-500 text-slate-950 shadow-md shadow-lime-500/20 hover:scale-105 transition cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đăng Ký Thành Viên</span>
              <span className="sm:hidden">Đăng Ký</span>
            </button>

            {/* Quick Role Switcher & Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 transition shadow-sm text-left group cursor-pointer"
              >
                <UserAvatar player={currentUser} size="sm" />
                <div className="hidden sm:block text-xs">
                  <div className="font-semibold text-slate-200 group-hover:text-white flex items-center gap-1.5">
                    {currentUser.name}
                    {currentUser.gender === 'female' ? (
                      <span className="text-[10px] text-pink-400 font-bold">♀ Nữ</span>
                    ) : (
                      <span className="text-[10px] text-blue-400 font-bold">♂ Nam</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">{getRoleBadge(currentUser.role)}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {/* Dropdown Menu */}
              {showRoleDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowRoleDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    {/* Current User Quick Profile Card */}
                    <div className="p-3 bg-slate-800/90 rounded-xl mb-2 flex items-center justify-between border border-slate-700/60">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <UserAvatar player={currentUser} size="md" />
                        <div className="min-w-0">
                          <div className="text-xs font-black text-white truncate">
                            {currentUser.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {currentUser.age ? `Tuổi: ${currentUser.age} • ` : ''}DUPR: {currentUser.rating ? parseFloat(currentUser.rating).toFixed(3) : '3.500'}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setShowRoleDropdown(false);
                          setProfileModalMode('edit_self');
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-lime-500/20 text-lime-300 border border-lime-500/40 hover:bg-lime-500/30 flex items-center gap-1 transition shrink-0 cursor-pointer"
                        title="Tự sửa tên, tuổi, DUPR, ảnh đại diện"
                      >
                        <Edit className="w-3 h-3" /> Sửa Hồ Sơ
                      </button>
                    </div>

                    <div className="p-2 border-b border-slate-800">
                      <p className="text-xs font-semibold text-slate-300">
                        Chuyển đổi tài khoản trải nghiệm:
                      </p>
                    </div>

                    <div className="py-1 max-h-56 overflow-y-auto">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                        Quản trị & Ban Chủ Nhiệm
                      </div>
                      {players
                        .filter((p) => p.role === 'admin' || p.role === 'sub_admin')
                        .map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setCurrentUserId(p.id);
                              setShowRoleDropdown(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-left transition cursor-pointer ${
                              currentUser.id === p.id
                                ? 'bg-lime-500/20 text-lime-300 font-bold border border-lime-500/30'
                                : 'hover:bg-slate-800 text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm">
                                {p.role === 'admin' ? '👑' : '🛡️'}
                              </span>
                              <div>
                                <div className="font-medium text-white">{p.name}</div>
                                <div className="text-[10px] text-slate-400">
                                  {p.role === 'admin' ? 'Quản trị viên' : 'Phó quản trị'} • DUPR {p.rating ? parseFloat(p.rating).toFixed(3) : '3.500'}
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {p.gender === 'male' ? 'Nam' : 'Nữ'}
                            </span>
                          </button>
                        ))}

                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mt-2">
                        Thành Viên CLB
                      </div>
                      {players
                        .filter((p) => p.role === 'member')
                        .slice(0, 6)
                        .map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setCurrentUserId(p.id);
                              setShowRoleDropdown(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition cursor-pointer ${
                              currentUser.id === p.id
                                ? 'bg-lime-500/20 text-lime-300 font-bold border border-lime-500/30'
                                : 'hover:bg-slate-800 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <UserAvatar player={p} size="xs" />
                              <div>
                                <span className="font-medium">{p.name}</span>
                                <span className="text-[10px] text-slate-400 ml-1.5">
                                  ({p.gender === 'female' ? 'Nữ' : 'Nam'}
                                  {p.age ? ` • ${p.age}t` : ''})
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono font-bold">
                              DUPR {p.rating ? parseFloat(p.rating).toFixed(3) : '3.500'}
                            </span>
                          </button>
                        ))}
                    </div>

                    <div className="pt-2 border-t border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => {
                            setShowRoleDropdown(false);
                            setProfileModalMode('register');
                          }}
                          className="flex items-center gap-1 text-[11px] font-bold text-lime-400 hover:text-lime-300 p-1 cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" /> + Đăng ký
                        </button>

                        <button
                          onClick={() => {
                            setShowRoleDropdown(false);
                            setProfileModalMode('login');
                          }}
                          className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 p-1 cursor-pointer"
                        >
                          🔑 Đăng nhập
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setShowRoleDropdown(false);
                          setShowInstallModal(true);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition cursor-pointer"
                      >
                        <Smartphone className="w-3.5 h-3.5" /> Cài đặt Web App ra màn hình chính
                      </button>

                      <button
                        onClick={() => {
                          setShowResetConfirm(true);
                          setShowRoleDropdown(false);
                        }}
                        className="w-full flex items-center justify-end gap-1 text-[10px] text-slate-500 hover:text-rose-400 p-1 transition cursor-pointer"
                        title="Khôi phục dữ liệu mẫu ban đầu"
                      >
                        <RotateCcw className="w-3 h-3" /> Reset dữ liệu mẫu
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar: Desktop Only (Mobile uses bottom toolbar) */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 pt-1 border-t border-slate-800/60 no-scrollbar">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'home'
                ? 'bg-gradient-to-r from-lime-500 to-emerald-600 text-slate-950 shadow-md shadow-lime-500/20 font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Home className="w-4 h-4" />
            Trang Chủ
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'schedule'
                ? 'bg-gradient-to-r from-lime-500 to-emerald-600 text-slate-950 shadow-md shadow-lime-500/20 font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Lịch & Ghi Sổ Điểm
          </button>

          <button
            onClick={() => setActiveTab('rankings')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'rankings'
                ? 'bg-slate-800 text-lime-400 border border-lime-500/40 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Bảng Xếp Hạng
          </button>

          <button
            onClick={() => setActiveTab('honor')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'honor'
                ? 'bg-slate-800 text-amber-400 border border-amber-500/40 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Vinh Danh MVP
          </button>

          <button
            onClick={() => setActiveTab('registration')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'registration'
                ? 'bg-slate-800 text-lime-400 border border-lime-500/40 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Users className="w-4 h-4" />
            Đăng Ký Đánh
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ml-auto ${
              activeTab === 'settings'
                ? 'bg-slate-800 text-lime-400 border border-lime-500/40 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Settings className="w-4 h-4" />
            Cài Đặt CLB
            {!isAdminOrSubAdmin && (
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1 py-0.5 rounded border border-slate-700">
                Khóa
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">
              Khôi phục dữ liệu mẫu ban đầu?
            </h3>
            <p className="text-sm text-slate-300 mb-6">
              Hành động này sẽ thiết lập lại danh sách 18 VĐV, 2 sân thi đấu, lịch các trận đấu hôm nay và các buổi đấu quá khứ của tuần, tháng, năm 2026.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  resetAllData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30"
              >
                Đồng ý khôi phục
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Member Profile & Registration Modal */}
      {profileModalMode && (
        <MemberProfileModal
          mode={profileModalMode}
          onClose={() => setProfileModalMode(null)}
          onGoToRegistrationSchedule={() => {
            setProfileModalMode(null);
            setActiveTab('registration');
          }}
        />
      )}

      {/* PWA Web App Installation Guide Modal */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </header>
  );
};
