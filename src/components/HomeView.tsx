import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  Award,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Flame,
  UserCheck,
  PlusCircle,
  ArrowRight,
  Shield,
  Zap,
  X,
  Eye,
  Crown,
  Medal,
  Check,
  AlertCircle,
  Smartphone,
} from 'lucide-react';
import { usePickleball } from '../context/PickleballContext';
import { ClubSession, Match, MatchType } from '../types/pickleball';
import { UserAvatar } from './UserAvatar';
import { PWAInstallModal } from './PWAInstallModal';

export const HomeView: React.FC<{
  onNavigateTab: (tab: 'schedule' | 'rankings' | 'honor' | 'registration' | 'settings') => void;
}> = ({ onNavigateTab }) => {
  const {
    sessions,
    players,
    currentUser,
    isAdminOrSubAdmin,
    toggleAttendance,
    setActiveSessionId,
    getStatsForSession,
    createSession,
  } = usePickleball();

  // Filter tabs for upcoming sessions: default to unregistered if user has any
  const upcomingAll = sessions.filter((s) => s.status !== 'completed');
  const unregisteredUpcoming = upcomingAll.filter(
    (s) => !s.registeredPlayerIds.includes(currentUser.id)
  );
  const registeredUpcoming = upcomingAll.filter((s) =>
    s.registeredPlayerIds.includes(currentUser.id)
  );

  const [upcomingTab, setUpcomingTab] = useState<'unregistered' | 'registered' | 'all'>(
    unregisteredUpcoming.length > 0 ? 'unregistered' : 'all'
  );

  // State for upcoming session detail modal
  const [selectedUpcomingSession, setSelectedUpcomingSession] = useState<ClubSession | null>(null);

  // State for completed session detail modal
  const [selectedCompletedSession, setSelectedCompletedSession] = useState<ClubSession | null>(null);

  // PWA Install Modal state
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Admin Create Session Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSName, setNewSName] = useState('Buổi Giao Lưu CLB Cún Cưng Mới');
  const [newSDate, setNewSDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [newSTime, setNewSTime] = useState('18:00 - 21:00');
  const [newSLocation, setNewSLocation] = useState('Sân D-Pickleball Center, TP. Thủ Đức');
  const [newSCourts, setNewSCourts] = useState(2);
  const [newSTarget, setNewSTarget] = useState(7);
  const [newSRequiredCount, setNewSRequiredCount] = useState(16);
  const [newSAutoSchedule, setNewSAutoSchedule] = useState(true);

  // Match Types Allowed
  const [allowMen, setAllowMen] = useState(true);
  const [allowWomen, setAllowWomen] = useState(true);
  const [allowMixed, setAllowMixed] = useState(true);

  // Completed sessions
  const completedSessions = sessions.filter(
    (s) => s.status === 'completed' || (s.matches && s.matches.some((m) => m.status === 'completed'))
  );

  const displayedUpcomingSessions =
    upcomingTab === 'unregistered'
      ? unregisteredUpcoming
      : upcomingTab === 'registered'
      ? registeredUpcoming
      : upcomingAll;

  const handleCreateEmptySession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminOrSubAdmin) return;

    const allowedTypes: MatchType[] = [];
    if (allowMen) allowedTypes.push('men_doubles');
    if (allowWomen) allowedTypes.push('women_doubles');
    if (allowMixed) allowedTypes.push('mixed_doubles');

    if (allowedTypes.length === 0) {
      alert('Vui lòng chọn ít nhất 1 thể loại trận đấu (Nam Nam, Nữ Nữ hoặc Nam Nữ)!');
      return;
    }

    createSession({
      name: newSName,
      date: newSDate,
      time: newSTime,
      location: newSLocation,
      courtCount: Number(newSCourts),
      targetMatchesPerPlayer: Number(newSTarget),
      strictAlternatingRest: true,
      registeredPlayerIds: [], // Buổi trống không có thành viên ban đầu
      autoScheduleWhenFull: newSAutoSchedule,
      requiredPlayerCount: Number(newSRequiredCount),
      allowedTypes,
    });

    setShowCreateModal(false);
    alert(
      `✓ Đã tạo thành công buổi trống "${newSName}" (${newSDate})!\n\nThuật toán cam kết:\n• Mỗi VĐV đánh đúng ${newSTarget} trận bằng nhau\n• Nghỉ 1 trận xen kẽ\n• Cân bằng trình độ DUPR\n• Hạn chế gặp lại bạn cặp & đối thủ.`
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* HERO SECTION: PICKLEBALL CÚN CƯNG */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/80 border border-slate-800 shadow-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            {/* Cute Puppy Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-black mb-3">
              <span>🐶</span>
              <span>CLB PICKLEBALL CÚN CƯNG</span>
              <span className="text-slate-400">•</span>
              <span className="text-lime-300">Cân Bằng DUPR & Nghỉ Xen Kẽ 1 Trận</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-snug mb-3">
              Chào mừng bạn đến với{' '}
              <span className="bg-gradient-to-r from-lime-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
                Pickleball Cún Cưng
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
              Hệ thống tự động phân cặp chuẩn <strong>Nam Nam, Nữ Nữ, Nam Nữ</strong>. Đảm bảo:{' '}
              <strong className="text-lime-400">mỗi người đánh số trận bằng nhau</strong>,{' '}
              <strong className="text-amber-300">không đánh 2 trận liên tục</strong>,{' '}
              <strong className="text-cyan-300">cân bằng DUPR giữa 2 đội</strong> và{' '}
              <strong>hạn chế trùng đối thủ</strong>.
            </p>

            {/* User Fast Registration Alert */}
            {unregisteredUpcoming.length > 0 ? (
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Bạn có <strong className="text-amber-400 font-bold">{unregisteredUpcoming.length} buổi đánh sắp tới</strong> chưa đăng ký tham gia. Hãy bấm nút <strong className="text-lime-400">"Đăng Ký Đánh Ngay"</strong> bên dưới!
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Bạn đã đăng ký đầy đủ tất cả các buổi đánh sắp tới của CLB. Chúc bạn thi đấu thăng hoa!
                </span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => onNavigateTab('schedule')}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-lime-400 to-emerald-500 text-slate-950 shadow-lg shadow-lime-500/20 hover:scale-105 transition cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              Xem Lịch Đấu & Ghi Sổ Điểm
            </button>

            {isAdminOrSubAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-amber-400" />
                + Tạo Buổi Đánh Mới (Admin)
              </button>
            )}

            <button
              onClick={() => setShowInstallModal(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-slate-900/90 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 transition hover:scale-105 cursor-pointer shadow-sm"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              Cài Đặt App Web (PWA)
            </button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Thành viên CLB</span>
            <strong className="text-lg text-white font-black">{players.length} VĐV</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Lịch sắp tới</span>
            <strong className="text-lg text-lime-400 font-black">{upcomingAll.length} Buổi</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Buổi đã xong</span>
            <strong className="text-lg text-cyan-400 font-black">{completedSessions.length} Buổi</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Cân bằng DUPR</span>
            <strong className="text-lg text-amber-300 font-black">Thuật toán AI 🤖</strong>
          </div>
        </div>
      </div>

      {/* SECTION 1: LỊCH SẮP ĐÁNH & ĐĂNG KÝ (THỂ HIỆN RÕ LỊCH CHƯA ĐĂNG KÝ) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-lime-400" />
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Lịch Thi Đấu Sắp Tới & Đăng Ký Đánh
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Bấm <strong className="text-lime-400">"Đăng Ký Đánh Ngay"</strong> để giữ chỗ. Nhấp vào thẻ để xem danh sách thành viên và bảng trận.
            </p>
          </div>

          {/* Filter Tabs: Unregistered vs Registered */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setUpcomingTab('unregistered')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black transition cursor-pointer ${
                upcomingTab === 'unregistered'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>🔥 Chưa đăng ký</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950/20">
                {unregisteredUpcoming.length}
              </span>
            </button>

            <button
              onClick={() => setUpcomingTab('registered')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                upcomingTab === 'registered'
                  ? 'bg-lime-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>✅ Tôi đã đăng ký</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950/20">
                {registeredUpcoming.length}
              </span>
            </button>

            <button
              onClick={() => setUpcomingTab('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                upcomingTab === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tất cả ({upcomingAll.length})
            </button>
          </div>
        </div>

        {/* Sessions List */}
        {displayedUpcomingSessions.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-base font-bold text-white mb-1">
              {upcomingTab === 'unregistered'
                ? 'Tuyệt vời! Bạn đã đăng ký tham gia tất cả các buổi sắp tới.'
                : 'Không có buổi đánh nào trong mục này.'}
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              {upcomingTab === 'unregistered'
                ? 'Hãy xem tab "Tôi đã đăng ký" để xem lại các buổi bạn đã ghi danh.'
                : 'Hãy kiểm tra lại danh sách hoặc nhờ Ban Quản Trị tạo buổi đánh mới.'}
            </p>
            <button
              onClick={() => setUpcomingTab('all')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
            >
              Xem tất cả các buổi
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedUpcomingSessions.map((session) => {
              const isRegistered = session.registeredPlayerIds.includes(currentUser.id);
              const targetCount = session.requiredPlayerCount || session.courtCount * 8;
              const currentCount = session.registeredPlayerIds.length;
              const openSlots = Math.max(0, targetCount - currentCount);
              const hasMatches = session.matches && session.matches.length > 0;

              return (
                <div
                  key={session.id}
                  className={`bg-slate-900/95 rounded-3xl p-5 border flex flex-col justify-between transition shadow-xl relative overflow-hidden ${
                    !isRegistered
                      ? 'border-amber-500/50 hover:border-amber-400 shadow-amber-500/5'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Status Badge Strip */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-3 py-1 rounded-xl text-xs font-black bg-slate-800 text-white flex items-center gap-1.5 border border-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-lime-400" />
                        {session.date}
                      </span>

                      {!isRegistered ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-400 text-slate-950 animate-pulse shadow-sm">
                          🔥 Chưa đăng ký (Còn {openSlots} chỗ)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Đã đăng ký
                        </span>
                      )}
                    </div>

                    <h3
                      onClick={() => setSelectedUpcomingSession(session)}
                      className="text-base sm:text-lg font-black text-white hover:text-lime-300 cursor-pointer transition mb-2"
                    >
                      {session.name}
                    </h3>

                    {/* Time, Location, Court */}
                    <div className="space-y-1.5 text-xs text-slate-300 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{session.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{session.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>
                          {session.courtCount} Sân • Mục tiêu: <strong>{session.targetMatchesPerPlayer} trận/người</strong>
                        </span>
                      </div>
                    </div>

                    {/* Headcount pill */}
                    <div
                      onClick={() => setSelectedUpcomingSession(session)}
                      className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer transition mb-4"
                    >
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="text-slate-300">Quân số đăng ký:</span>
                        <span className={openSlots === 0 ? 'text-emerald-400' : 'text-amber-400'}>
                          {currentCount} / {targetCount} VĐV
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-lime-500 to-emerald-400 rounded-full"
                          style={{
                            width: `${Math.min(100, Math.round((currentCount / targetCount) * 100))}%`,
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5 flex items-center justify-between">
                        <span>
                          {hasMatches
                            ? '⚡ Đã xếp lịch thi đấu'
                            : openSlots === 0
                            ? '✓ Đã đủ người để bắt đầu'
                            : `Còn thiếu ${openSlots} VĐV để tự động chia lịch`}
                        </span>
                        <span className="text-lime-400 underline font-semibold">Xem chi tiết</span>
                      </p>
                    </div>
                  </div>

                  {/* PROMINENT ACTION BUTTON */}
                  <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => toggleAttendance(session.id, currentUser.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition cursor-pointer ${
                        !isRegistered
                          ? 'bg-gradient-to-r from-lime-400 to-emerald-500 text-slate-950 shadow-md shadow-lime-500/25 hover:from-lime-300 hover:to-emerald-400 hover:scale-[1.02]'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                      }`}
                    >
                      {!isRegistered ? (
                        <>
                          <span>🏸 Đăng Ký Đánh Ngay</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          <span>Hủy Đăng Ký</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setSelectedUpcomingSession(session)}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                      title="Xem danh sách người và trận đánh"
                    >
                      <Eye className="w-4 h-4 text-lime-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 2: CÁC BUỔI ĐÃ THI ĐẤU (TỔNG SỐ TRẬN THẮNG/THUA, TỔNG ĐIỂM, MVP HUY HIỆU TO ĐẸP) */}
      <section className="space-y-4 pt-4 border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Các Buổi Đã Thi Đấu & Vinh Danh MVP
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Thống kê tổng số trận, tổng điểm ghi được và tôn vinh gương mặt MVP xuất sắc nhất của từng buổi.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('honor')}
            className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition"
          >
            <span>Xem Bảng vàng MVP Tuần/Tháng</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {completedSessions.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
            Chưa có buổi thi đấu nào được hoàn thành.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {completedSessions.map((session) => {
              const stats = getStatsForSession(session.id);
              const mvp = stats[0];

              const completedMatches = (session.matches || []).filter(
                (m) => m.status === 'completed'
              );
              const totalMatchesCount = completedMatches.length;

              const totalPointsToday = completedMatches.reduce((acc, m) => {
                return acc + (m.teamA.score || 0) + (m.teamB.score || 0);
              }, 0);

              const menDoublesCount = completedMatches.filter((m) => m.type === 'men_doubles').length;
              const womenDoublesCount = completedMatches.filter(
                (m) => m.type === 'women_doubles'
              ).length;
              const mixedDoublesCount = completedMatches.filter(
                (m) => m.type === 'mixed_doubles'
              ).length;

              return (
                <div
                  key={session.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            ✓ Đã Kết Thúc
                          </span>
                          <span className="text-xs text-slate-400">{session.date}</span>
                        </div>
                        <h3 className="text-lg font-black text-white">{session.name}</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          <span>{session.location}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedCompletedSession(session)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
                      >
                        Bảng Điểm
                      </button>
                    </div>

                    {/* Stats Strip: Tổng Trận & Tổng Điểm */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 mb-4 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Tổng Số Trận
                        </span>
                        <strong className="text-base text-white font-black block">
                          {totalMatchesCount} Trận
                        </strong>
                        <span className="text-[10px] text-slate-500">
                          {menDoublesCount}N • {womenDoublesCount}F • {mixedDoublesCount}Mix
                        </span>
                      </div>

                      <div className="border-x border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Tổng Điểm Hôm Đấy
                        </span>
                        <strong className="text-base text-lime-400 font-black block">
                          {totalPointsToday} Điểm
                        </strong>
                        <span className="text-[10px] text-slate-500">Toàn bộ các ván</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Quy Mô Sân
                        </span>
                        <strong className="text-base text-cyan-400 font-black block">
                          {session.courtCount} Sân
                        </strong>
                        <span className="text-[10px] text-slate-500">
                          {session.registeredPlayerIds.length} VĐV
                        </span>
                      </div>
                    </div>

                    {/* GRAND MVP BADGE (HUY HIỆU TO ĐẸP) */}
                    {mvp && (
                      <div className="relative rounded-2xl p-4 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-900/30 border-2 border-amber-500/60 shadow-xl shadow-amber-500/10 overflow-hidden">
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[10px] font-black uppercase shadow-sm">
                            <Crown className="w-3.5 h-3.5" />
                            <span>HUY HIỆU MVP XUẤT SẮC NHẤT BUỔI</span>
                          </div>
                          <span className="text-xs text-amber-300 font-black">
                            #{mvp.wins} Trận Thắng
                          </span>
                        </div>

                        <div className="flex items-center gap-3.5">
                          <div className="relative shrink-0">
                            <div className="rounded-full ring-4 ring-amber-400 shadow-xl shadow-amber-500/40 p-0.5 bg-gradient-to-tr from-amber-400 to-yellow-200">
                              <UserAvatar player={mvp} size="xl" />
                            </div>
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl animate-bounce">
                              👑
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-black text-white truncate">
                                {mvp.name}
                              </h4>
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                DUPR {mvp.rating ? parseFloat(mvp.rating).toFixed(3) : '3.500'}
                              </span>
                            </div>
                            <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-2">
                              <span className="text-lime-400 font-black flex items-center gap-1">
                                <Trophy className="w-3.5 h-3.5" />
                                {mvp.wins} Thắng / {mvp.matchesPlayed} Trận
                              </span>
                              <span>•</span>
                              <span>Hiệu số: +{mvp.pointDiff}</span>
                              <span>•</span>
                              <span className="text-orange-400 font-bold flex items-center gap-0.5">
                                <Flame className="w-3 h-3" />
                                Chuỗi {mvp.streak}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Hoàn thành {completedMatches.length} trận đấu
                    </span>
                    <button
                      onClick={() => {
                        setActiveSessionId(session.id);
                        onNavigateTab('schedule');
                      }}
                      className="font-bold text-lime-400 hover:text-lime-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Xem sổ điểm</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* MODAL 1: CHI TIẾT BUỔI SẮP ĐÁNH (CLICK VÀO RA CHI TIẾT SỐ NGƯỜI, THÀNH VIÊN VÀ TRẬN ĐÁNH) */}
      {selectedUpcomingSession && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-lime-400/20 text-lime-300 border border-lime-400/30">
                    Chi Tiết Buổi Sắp Đánh
                  </span>
                  <span className="text-xs text-slate-400">{selectedUpcomingSession.date}</span>
                </div>
                <h3 className="text-xl font-black text-white">{selectedUpcomingSession.name}</h3>
              </div>
              <button
                onClick={() => setSelectedUpcomingSession(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 my-4 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Khung giờ:</span>
                <strong className="text-white">{selectedUpcomingSession.time}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Địa điểm:</span>
                <strong className="text-white truncate block">{selectedUpcomingSession.location}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Quy mô giải:</span>
                <strong className="text-lime-400">
                  {selectedUpcomingSession.courtCount} Sân • {selectedUpcomingSession.targetMatchesPerPlayer} trận/người
                </strong>
              </div>
            </div>

            {/* Member list and headcount breakdown */}
            <div className="my-5">
              {(() => {
                const regMembers = players.filter((p) =>
                  selectedUpcomingSession.registeredPlayerIds.includes(p.id)
                );
                const maleCount = regMembers.filter((p) => p.gender === 'male').length;
                const femaleCount = regMembers.filter((p) => p.gender === 'female').length;
                const targetCount =
                  selectedUpcomingSession.requiredPlayerCount ||
                  selectedUpcomingSession.courtCount * 8;

                return (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-emerald-400" />
                          Thành Viên Đã Đăng Ký ({regMembers.length}/{targetCount} VĐV)
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Tỷ lệ: <strong className="text-blue-400">{maleCount} Nam</strong> •{' '}
                          <strong className="text-pink-400">{femaleCount} Nữ</strong>
                        </p>
                      </div>

                      {regMembers.length >= targetCount ? (
                        <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đủ quân số
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Còn thiếu {targetCount - regMembers.length} VĐV
                        </span>
                      )}
                    </div>

                    {regMembers.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center text-xs text-slate-400">
                        Chưa có thành viên nào đăng ký. Hãy bấm "Đăng Ký Tham Gia" bên dưới để là người đầu tiên!
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                        {regMembers.map((m) => {
                          const isMe = m.id === currentUser.id;
                          return (
                            <div
                              key={m.id}
                              className={`flex items-center justify-between p-2 rounded-xl border text-xs ${
                                isMe
                                  ? 'bg-lime-500/10 border-lime-500/40 font-bold'
                                  : 'bg-slate-800/80 border-slate-700/70'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <UserAvatar player={m} size="xs" />
                                <div>
                                  <div className="text-white flex items-center gap-1">
                                    <span>{m.name}</span>
                                    {isMe && (
                                      <span className="text-[9px] px-1 py-0.2 rounded bg-lime-400 text-slate-950 font-black">
                                        BẠN
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    DUPR {m.rating ? parseFloat(m.rating).toFixed(3) : '3.500'}
                                    {m.age ? ` • ${m.age}t` : ''}
                                  </div>
                                </div>
                              </div>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                  m.gender === 'female'
                                    ? 'bg-pink-500/20 text-pink-300'
                                    : 'bg-blue-500/20 text-blue-300'
                                }`}
                              >
                                {m.gender === 'female' ? 'Nữ' : 'Nam'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Matches preview */}
            <div className="my-5 pt-4 border-t border-slate-800">
              <h4 className="text-sm font-black text-white flex items-center gap-1.5 mb-3">
                <Trophy className="w-4 h-4 text-amber-400" />
                Lịch Các Trận Đấu
              </h4>

              {selectedUpcomingSession.matches && selectedUpcomingSession.matches.length > 0 ? (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1 text-xs">
                  {selectedUpcomingSession.matches.slice(0, 8).map((match) => {
                    const pA1 = players.find((p) => p.id === match.teamA.player1Id);
                    const pA2 = players.find((p) => p.id === match.teamA.player2Id);
                    const pB1 = players.find((p) => p.id === match.teamB.player1Id);
                    const pB2 = players.find((p) => p.id === match.teamB.player2Id);

                    return (
                      <div
                        key={match.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-slate-800 text-slate-300">
                            Vòng {match.roundIndex} • Sân {match.courtNumber}
                          </span>
                          <span className="text-[10px] text-lime-400 font-bold">
                            {match.type === 'men_doubles'
                              ? 'Nam Nam'
                              : match.type === 'women_doubles'
                              ? 'Nữ Nữ'
                              : 'Nam Nữ'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-200">
                          <span>{pA1?.name} & {pA2?.name}</span>
                          <span className="text-slate-500 font-bold">vs</span>
                          <span>{pB1?.name} & {pB2?.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center text-xs">
                  <Zap className="w-6 h-6 text-amber-400 mx-auto mb-1.5" />
                  <p className="font-bold text-white mb-0.5">Lịch thi đấu sẽ tự động xếp</p>
                  <p className="text-[11px] text-slate-400">
                    Khi đủ quân số đăng ký, hệ thống sẽ tự động ghép cặp cân bằng DUPR và chia đều số trận!
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  toggleAttendance(selectedUpcomingSession.id, currentUser.id);
                  const updated = sessions.find((s) => s.id === selectedUpcomingSession.id);
                  if (updated) setSelectedUpcomingSession(updated);
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  selectedUpcomingSession.registeredPlayerIds.includes(currentUser.id)
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-gradient-to-r from-lime-400 to-emerald-500 text-slate-950 shadow-md shadow-lime-500/20'
                }`}
              >
                {selectedUpcomingSession.registeredPlayerIds.includes(currentUser.id) ? (
                  <>
                    <UserCheck className="w-4 h-4" />
                    Đã Đăng Ký (Bấm để Hủy)
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    Đăng Ký Tham Gia Buổi Này
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveSessionId(selectedUpcomingSession.id);
                  setSelectedUpcomingSession(null);
                  onNavigateTab('schedule');
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 cursor-pointer"
              >
                Đến Sân & Ghi Điểm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CHI TIẾT BUỔI ĐÃ ĐÁNH & BẢNG ĐIỂM */}
      {selectedCompletedSession && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Tổng Kết Buổi Đấu
                </span>
                <h3 className="text-xl font-black text-white mt-1">{selectedCompletedSession.name}</h3>
                <p className="text-xs text-slate-400">
                  Ngày thi đấu: {selectedCompletedSession.date} • {selectedCompletedSession.location}
                </p>
              </div>
              <button
                onClick={() => setSelectedCompletedSession(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-5">
              <h4 className="text-sm font-black text-white flex items-center gap-1.5 mb-3">
                <Trophy className="w-4 h-4 text-amber-400" />
                Bảng Điểm Xếp Hạng VĐV Buổi Hôm Đó
              </h4>

              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {getStatsForSession(selectedCompletedSession.id).map((stat, idx) => (
                  <div
                    key={stat.playerId}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs ${
                      idx === 0
                        ? 'bg-amber-500/10 border-amber-500/40 font-bold'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                          idx === 0
                            ? 'bg-amber-400 text-slate-950'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-950'
                            : idx === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <UserAvatar player={stat} size="xs" />
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1">
                          <span>{stat.name}</span>
                          {idx === 0 && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {stat.gender === 'female' ? 'Nữ' : 'Nam'} • DUPR {stat.rating ? parseFloat(stat.rating).toFixed(3) : '3.500'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-lime-400 block">
                        {stat.points} Điểm
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {stat.wins} Thắng - {stat.losses} Thua (Hiệu số: +{stat.pointDiff})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  setActiveSessionId(selectedCompletedSession.id);
                  setSelectedCompletedSession(null);
                  onNavigateTab('schedule');
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-lime-400 hover:bg-lime-300 text-slate-950 transition cursor-pointer"
              >
                Xem Sổ Điểm Tất Cả Các Ván Đấu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADMIN TẠO BUỔI ĐÁNH MỚI VỚI CÁC TÙY CHỌN TIÊU CHUẨN */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">🐶</span>
                <h3 className="text-lg font-black text-white">
                  Tạo Buổi Đánh Mới (CLB Cún Cưng)
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEmptySession} className="space-y-4 my-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Tên Buổi Đánh:
                </label>
                <input
                  type="text"
                  required
                  value={newSName}
                  onChange={(e) => setNewSName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-lime-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Ngày Thi Đấu:
                  </label>
                  <input
                    type="date"
                    required
                    value={newSDate}
                    onChange={(e) => setNewSDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none focus:border-lime-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Khung Giờ:
                  </label>
                  <input
                    type="text"
                    required
                    value={newSTime}
                    onChange={(e) => setNewSTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-lime-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Địa Điểm Sân Đấu:
                </label>
                <input
                  type="text"
                  required
                  value={newSLocation}
                  onChange={(e) => setNewSLocation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-lime-500"
                />
              </div>

              {/* Court count, Target matches & Headcount */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Số Sân:
                  </label>
                  <select
                    value={newSCourts}
                    onChange={(e) => {
                      const courts = Number(e.target.value);
                      setNewSCourts(courts);
                      setNewSRequiredCount(courts * 8);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-lime-500 cursor-pointer font-bold"
                  >
                    <option value={1}>1 Sân</option>
                    <option value={2}>2 Sân</option>
                    <option value={3}>3 Sân</option>
                    <option value={4}>4 Sân</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Số Trận/Người:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={newSTarget}
                    onChange={(e) => setNewSTarget(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white font-bold outline-none focus:border-lime-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Số Người Cần:
                  </label>
                  <select
                    value={newSRequiredCount}
                    onChange={(e) => setNewSRequiredCount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white font-bold outline-none focus:border-lime-500 cursor-pointer"
                  >
                    <option value={8}>8 Người (1 sân)</option>
                    <option value={12}>12 Người</option>
                    <option value={16}>16 Người (2 sân)</option>
                    <option value={20}>20 Người</option>
                    <option value={24}>24 Người (3 sân)</option>
                  </select>
                </div>
              </div>

              {/* CHỌN THỂ LOẠI TRẬN ĐẤU */}
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                <span className="text-xs font-bold text-white block">
                  Chọn Thể Loại Trận Đấu Được Phép:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={allowMen}
                      onChange={(e) => setAllowMen(e.target.checked)}
                      className="w-4 h-4 rounded text-lime-500 bg-slate-800"
                    />
                    <span className="font-bold text-blue-300">Nam Nam</span>
                  </label>

                  <label className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={allowWomen}
                      onChange={(e) => setAllowWomen(e.target.checked)}
                      className="w-4 h-4 rounded text-lime-500 bg-slate-800"
                    />
                    <span className="font-bold text-pink-300">Nữ Nữ</span>
                  </label>

                  <label className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={allowMixed}
                      onChange={(e) => setAllowMixed(e.target.checked)}
                      className="w-4 h-4 rounded text-lime-500 bg-slate-800"
                    />
                    <span className="font-bold text-lime-300">Nam Nữ</span>
                  </label>
                </div>
              </div>

              {/* THUẬT TOÁN CAM KẾT & TỰ ĐỘNG CHIA LỊCH */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-lime-500/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-lime-400" />
                    Tự động chia lịch khi đủ {newSRequiredCount} người
                  </span>
                  <input
                    type="checkbox"
                    checked={newSAutoSchedule}
                    onChange={(e) => setNewSAutoSchedule(e.target.checked)}
                    className="w-4 h-4 rounded text-lime-500 bg-slate-800"
                  />
                </div>

                <div className="text-[11px] text-slate-300 space-y-1 pt-1 border-t border-slate-800">
                  <div className="flex items-center gap-1.5 text-lime-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>Mỗi thành viên đánh số trận bằng nhau (đúng {newSTarget} trận)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <Check className="w-3.5 h-3.5" />
                    <span>Hạn chế đánh 2 trận liên tục (1 trận đánh, 1 trận nghỉ)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-cyan-300">
                    <Check className="w-3.5 h-3.5" />
                    <span>Cân bằng trình độ DUPR giữa 2 đội (hạn chế chênh lệch điểm)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Check className="w-3.5 h-3.5" />
                    <span>Hạn chế trùng bạn cặp và đối thủ đã thi đấu</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-lime-400 to-emerald-500 text-slate-950 shadow-lg shadow-lime-500/20 hover:scale-105 transition cursor-pointer"
                >
                  Tạo Buổi Đánh Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PWA Install Modal */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </div>
  );
};
