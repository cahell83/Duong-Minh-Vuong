import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  PlusCircle,
  Play,
  Trash2,
  UserCheck,
  Edit,
  X,
  Save,
  UserPlus,
  Filter,
  Check,
  Zap,
} from 'lucide-react';
import { usePickleball } from '../context/PickleballContext';
import { ClubSession, MatchType } from '../types/pickleball';
import { UserAvatar } from './UserAvatar';
import { MemberProfileModal } from './MemberProfileModal';

export const SessionRegistration: React.FC<{
  onGoToLive: () => void;
}> = ({ onGoToLive }) => {
  const {
    sessions,
    players,
    currentUser,
    isAdminOrSubAdmin,
    toggleAttendance,
    createSession,
    updateSession,
    deleteSession,
    setActiveSessionId,
    activeSessionId,
    generateScheduleForSession,
  } = usePickleball();

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSessionName, setNewSessionName] = useState('Buổi Giao Lưu Cuối Tuần');
  const [newSessionDate, setNewSessionDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [newSessionTime, setNewSessionTime] = useState('18:00 - 21:00');
  const [newSessionLocation, setNewSessionLocation] = useState('Sân D-Pickleball Center, TP. Thủ Đức');
  const [newCourtCount, setNewCourtCount] = useState(2);
  const [newTargetMatches, setNewTargetMatches] = useState(7);
  const [newStrictRest, setNewStrictRest] = useState(true);
  const [newHeadcountPreset, setNewHeadcountPreset] = useState<'16' | '12' | '20' | '0'>('0');
  const [newAutoSchedule, setNewAutoSchedule] = useState(true);
  const [newRequiredCount, setNewRequiredCount] = useState(16);
  const [newAllowMen, setNewAllowMen] = useState(true);
  const [newAllowWomen, setNewAllowWomen] = useState(true);
  const [newAllowMixed, setNewAllowMixed] = useState(true);

  // Edit Modal State
  const [editingSession, setEditingSession] = useState<ClubSession | null>(null);
  const [editSName, setEditSName] = useState('');
  const [editSDate, setEditSDate] = useState('');
  const [editSTime, setEditSTime] = useState('');
  const [editSLocation, setEditSLocation] = useState('');
  const [editSCourts, setEditSCourts] = useState(2);
  const [editSTarget, setEditSTarget] = useState(7);
  const [editSStrictRest, setEditSStrictRest] = useState(true);
  const [editSStatus, setEditSStatus] = useState<'open_registration' | 'in_progress' | 'completed'>('open_registration');

  // Profile modal state
  const [profileModalMode, setProfileModalMode] = useState<'register' | 'edit_self' | 'login' | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'upcoming' | 'registered'>('all');

  const handleOpenEditSession = (s: ClubSession) => {
    setEditingSession(s);
    setEditSName(s.name);
    setEditSDate(s.date);
    setEditSTime(s.time);
    setEditSLocation(s.location);
    setEditSCourts(s.courtCount);
    setEditSTarget(s.targetMatchesPerPlayer);
    setEditSStrictRest(s.strictAlternatingRest);
    setEditSStatus(s.status);
  };

  const handleSaveEditSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;

    updateSession({
      ...editingSession,
      name: editSName,
      date: editSDate,
      time: editSTime,
      location: editSLocation,
      courtCount: Number(editSCourts),
      targetMatchesPerPlayer: Number(editSTarget),
      strictAlternatingRest: editSStrictRest,
      status: editSStatus,
    });
    setEditingSession(null);
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminOrSubAdmin) return;

    let initialMemberIds: string[] = [];
    if (newHeadcountPreset === '16') {
      const males = players.filter((p) => p.gender === 'male').slice(0, 8).map((p) => p.id);
      const females = players.filter((p) => p.gender === 'female').slice(0, 8).map((p) => p.id);
      initialMemberIds = [...males, ...females];
    } else if (newHeadcountPreset === '12') {
      const males = players.filter((p) => p.gender === 'male').slice(0, 6).map((p) => p.id);
      const females = players.filter((p) => p.gender === 'female').slice(0, 6).map((p) => p.id);
      initialMemberIds = [...males, ...females];
    } else if (newHeadcountPreset === '20') {
      const males = players.filter((p) => p.gender === 'male').slice(0, 10).map((p) => p.id);
      const females = players.filter((p) => p.gender === 'female').slice(0, 10).map((p) => p.id);
      initialMemberIds = [...males, ...females];
    }

    const allowedTypes: MatchType[] = [];
    if (newAllowMen) allowedTypes.push('men_doubles');
    if (newAllowWomen) allowedTypes.push('women_doubles');
    if (newAllowMixed) allowedTypes.push('mixed_doubles');

    createSession({
      name: newSessionName,
      date: newSessionDate,
      time: newSessionTime,
      location: newSessionLocation,
      courtCount: Number(newCourtCount),
      targetMatchesPerPlayer: Number(newTargetMatches),
      strictAlternatingRest: newStrictRest,
      registeredPlayerIds: initialMemberIds,
      autoScheduleWhenFull: newAutoSchedule,
      requiredPlayerCount: Number(newRequiredCount),
      allowedTypes: allowedTypes.length > 0 ? allowedTypes : ['men_doubles', 'women_doubles', 'mixed_doubles'],
    });
    setShowCreateModal(false);
  };

  const handleActivateAndGenerate = (sessionId: string) => {
    setActiveSessionId(sessionId);
    const res = generateScheduleForSession(sessionId);
    alert(res.message);
    onGoToLive();
  };

  const setQuickDate = (daysAhead: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysAhead);
    setNewSessionDate(target.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-6 h-6 text-lime-400" />
            <h2 className="text-2xl font-black text-white">
              Đăng Ký Ngày Đánh & Lịch Sinh Hoạt
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Dành cho tất cả thành viên: Đăng ký tham gia các buổi đánh cố định và giao hữu CLB.
          </p>
        </div>

        {isAdminOrSubAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-lime-400 to-emerald-500 text-slate-950 shadow-lg shadow-lime-500/20 hover:from-lime-300 hover:to-emerald-400 transition shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Tạo Ngày Đánh Mới (Admin)
          </button>
        )}
      </div>

      {/* Member Fast Registration Status Card & Self Edit */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-700/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <UserAvatar player={currentUser} size="lg" />
          <div>
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <span>Hồ sơ vận động viên đang đăng nhập:</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-lime-400/20 text-lime-300 border border-lime-400/30">
                {currentUser.role === 'admin'
                  ? 'Admin'
                  : currentUser.role === 'sub_admin'
                  ? 'Phó Admin'
                  : 'Thành viên'}
              </span>
            </div>
            <div className="text-base font-extrabold text-white flex flex-wrap items-center gap-2 mt-0.5">
              <span>{currentUser.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {currentUser.gender === 'female' ? '♀ Nữ' : '♂ Nam'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-lime-400/10 text-lime-300 border border-lime-400/30">
                DUPR {currentUser.rating || '3.5'}
              </span>
              {currentUser.age && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-800/80 text-slate-400 border border-slate-700">
                  {currentUser.age} tuổi
                </span>
              )}
            </div>
            {currentUser.phone && (
              <div className="text-[11px] text-slate-400 mt-0.5">
                SĐT liên hệ: <span className="text-slate-300 font-mono">{currentUser.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons for Member */}
        <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setProfileModalMode('edit_self')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition shadow-sm cursor-pointer"
            title="Đổi tên, tuổi, trình độ DUPR, ảnh đại diện"
          >
            <Edit className="w-3.5 h-3.5 text-lime-400" />
            Sửa Hồ Sơ & DUPR
          </button>

          <button
            type="button"
            onClick={() => setProfileModalMode('register')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/40 transition shadow-sm cursor-pointer"
            title="Đăng ký thêm thành viên mới vào CLB"
          >
            <UserPlus className="w-3.5 h-3.5 text-indigo-300" />
            + Đăng Ký Thành Viên Mới
          </button>
        </div>
      </div>

      {/* Session Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-lime-400" />
          <h3 className="text-base font-extrabold text-white">
            Danh Sách Lịch Thi Đấu ({sessions.length})
          </h3>
        </div>

        <div className="flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              filterTab === 'all'
                ? 'bg-lime-500 text-slate-950 shadow font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tất cả ({sessions.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('upcoming')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              filterTab === 'upcoming'
                ? 'bg-lime-500 text-slate-950 shadow font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Lịch sắp tới & Đang mở (
            {sessions.filter((s) => s.status !== 'completed').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('registered')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              filterTab === 'registered'
                ? 'bg-lime-500 text-slate-950 shadow font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tôi đã đăng ký (
            {sessions.filter((s) => s.registeredPlayerIds.includes(currentUser.id)).length})
          </button>
        </div>
      </div>

      {/* Sessions Grid */}
      {(() => {
        const filteredSessions = sessions.filter((s) => {
          if (filterTab === 'upcoming') return s.status !== 'completed';
          if (filterTab === 'registered') return s.registeredPlayerIds.includes(currentUser.id);
          return true;
        });

        if (filteredSessions.length === 0) {
          return (
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white mb-1">
                Không tìm thấy buổi đánh phù hợp
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                {filterTab === 'registered'
                  ? 'Bạn chưa đăng ký tham gia buổi nào. Hãy chọn một buổi sắp tới và bấm "Đăng Ký Tham Gia Ngay"!'
                  : 'Hiện không có buổi đánh nào trong danh mục này.'}
              </p>
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
              >
                Xem tất cả lịch thi đấu
              </button>
            </div>
          );
        }

        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSessions.map((session) => {
              const isRegistered = session.registeredPlayerIds.includes(currentUser.id);
              const registeredMembers = players.filter((p) =>
                session.registeredPlayerIds.includes(p.id)
              );
              const maleCount = registeredMembers.filter((p) => p.gender === 'male').length;
              const femaleCount = registeredMembers.filter((p) => p.gender === 'female').length;
              const isActive = session.id === activeSessionId;
              const hasMatches = session.matches && session.matches.length > 0;

              return (
                <div
                  key={session.id}
                  className={`bg-slate-900/90 border rounded-3xl p-6 flex flex-col justify-between transition shadow-xl ${
                    isActive
                      ? 'border-lime-500/60 ring-1 ring-lime-500/30'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-lime-500/20 text-lime-300 border border-lime-500/30">
                          Đang hoạt động
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                        {session.status === 'in_progress'
                          ? 'Đang diễn ra'
                          : session.status === 'completed'
                          ? 'Đã kết thúc'
                          : 'Đang mở đăng ký'}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-white">
                      {session.name}
                    </h3>
                  </div>

                  {isAdminOrSubAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditSession(session)}
                        className="text-slate-400 hover:text-amber-400 p-1.5 transition rounded-lg hover:bg-slate-800 cursor-pointer"
                        title="Sửa ngày đánh & thông tin"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Xóa buổi đánh "${session.name}"?`)) {
                            deleteSession(session.id);
                          }
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1.5 transition rounded-lg hover:bg-slate-800 cursor-pointer"
                        title="Xóa buổi đánh"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs text-slate-300 mb-5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-lime-400 shrink-0" />
                    <span>
                      Ngày: <strong className="text-white">{session.date}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>
                      Giờ thi đấu: <strong className="text-white">{session.time}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">{session.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Quy mô: <strong>{session.courtCount} Sân</strong> • Mục tiêu: <strong>{session.targetMatchesPerPlayer} trận/người</strong>
                    </span>
                  </div>
                </div>

                {/* Registered Headcount & Breakdown */}
                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200">
                      Danh sách đã đăng ký ({registeredMembers.length} VĐV)
                    </span>
                    <div className="text-[11px] font-semibold text-slate-400">
                      <span className="text-blue-400 font-bold">{maleCount} Nam</span> •{' '}
                      <span className="text-pink-400 font-bold">{femaleCount} Nữ</span>
                    </div>
                  </div>

                  {/* Registered Avatars row */}
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {registeredMembers.map((p) => (
                      <span
                        key={p.id}
                        className={`text-[11px] px-2 py-0.5 rounded-lg border font-medium flex items-center gap-1 ${
                          p.id === currentUser.id
                            ? 'bg-lime-500/20 text-lime-300 border-lime-500/40 font-bold'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {p.name}
                        <span
                          className={`text-[9px] ${
                            p.gender === 'female' ? 'text-pink-400' : 'text-blue-400'
                          }`}
                        >
                          {p.gender === 'female' ? '♀' : '♂'}
                        </span>
                      </span>
                    ))}
                  </div>

                  {/* Readiness alert */}
                  <div className="mt-3 text-[11px] text-slate-400">
                    {registeredMembers.length === 16 && session.courtCount === 2 ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Chuẩn 16 VĐV cho 2 sân (8 đánh, 8 nghỉ, 100% nghỉ xen kẽ)!
                      </span>
                    ) : registeredMembers.length < 8 ? (
                      <span className="text-amber-400 font-medium">
                        Cần thêm {8 - registeredMembers.length} người để chia đủ sân.
                      </span>
                    ) : (
                      <span className="text-slate-300">
                        Đang có {registeredMembers.length} VĐV sẵn sàng.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                {/* Member Toggle Attendance */}
                <button
                  onClick={() => toggleAttendance(session.id, currentUser.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isRegistered
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                      : 'bg-gradient-to-r from-lime-500 to-emerald-600 text-slate-950 font-black shadow-md shadow-lime-500/20 hover:from-lime-400 hover:to-emerald-500'
                  }`}
                >
                  {isRegistered ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      Đã Đăng Ký (Bấm để Hủy)
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      Đăng Ký Tham Gia Ngay
                    </>
                  )}
                </button>

                {/* Switch to this session / Generate schedule */}
                {isActive ? (
                  <button
                    onClick={onGoToLive}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-lime-400" />
                    Xem Trực Tiếp
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setActiveSessionId(session.id);
                      if (hasMatches) {
                        onGoToLive();
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                  >
                    Chọn Buổi Này
                  </button>
                )}

                {isAdminOrSubAdmin && !hasMatches && (
                  <button
                    onClick={() => handleActivateAndGenerate(session.id)}
                    className="w-full mt-2 py-2 rounded-xl text-xs font-bold bg-lime-500/20 text-lime-300 border border-lime-500/30 hover:bg-lime-500/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    ⚡ Khởi Tạo Lịch Chia Trận Ngẫu Nhiên (Admin)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  })()}

      {/* CREATE NEW SESSION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-lime-400" />
                <h3 className="text-lg font-black text-white">
                  Tạo Ngày Đánh Pickleball Mới
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4 my-5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Tên Buổi Đánh:
                </label>
                <input
                  type="text"
                  required
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-lime-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Ngày Thi Đấu:
                </label>
                <input
                  type="date"
                  required
                  value={newSessionDate}
                  onChange={(e) => setNewSessionDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none focus:border-lime-500 mb-2"
                />
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuickDate(0)}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    Hôm nay
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(1)}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    Ngày mai
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(3)}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    +3 Ngày
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(7)}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    Tuần sau
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Khung Giờ:
                  </label>
                  <input
                    type="text"
                    required
                    value={newSessionTime}
                    onChange={(e) => setNewSessionTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-lime-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Số Sân Hoạt Động:
                  </label>
                  <select
                    value={newCourtCount}
                    onChange={(e) => setNewCourtCount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-lime-500 cursor-pointer"
                  >
                    <option value={1}>1 Sân (4 người đánh)</option>
                    <option value={2}>2 Sân (8 người đánh - Chuẩn 16 người)</option>
                    <option value={3}>3 Sân (12 người đánh)</option>
                    <option value={4}>4 Sân (16 người đánh)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Địa Điểm Sân Đấu:
                  </label>
                  <input
                    type="text"
                    required
                    value={newSessionLocation}
                    onChange={(e) => setNewSessionLocation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-lime-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Mục Tiêu Số Trận/Người:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={newTargetMatches}
                    onChange={(e) => setNewTargetMatches(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none focus:border-lime-500"
                  />
                </div>
              </div>

              {/* Headcount Preset */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Chọn Số Thành Viên Ban Đầu:
                </label>
                <select
                  value={newHeadcountPreset}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setNewHeadcountPreset(val);
                    if (val === '0') setNewAutoSchedule(true);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-lime-500 cursor-pointer"
                >
                  <option value="0">⭐ Để trống danh sách (Mở cho thành viên tự đăng ký)</option>
                  <option value="16">Chọn sẵn 16 VĐV (8 Nam + 8 Nữ)</option>
                  <option value="12">Chọn sẵn 12 VĐV (6 Nam + 6 Nữ)</option>
                  <option value="20">Chọn sẵn 20 VĐV (10 Nam + 10 Nữ)</option>
                </select>
              </div>

              {/* Auto Schedule Toggle & Required Count */}
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-lime-500/30 space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAutoSchedule}
                    onChange={(e) => setNewAutoSchedule(e.target.checked)}
                    className="w-4 h-4 rounded text-lime-500 bg-slate-900 border-slate-700 cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-white">
                      ⚡ Tự động chia lịch thi đấu khi đủ số lượng
                    </span>
                    <p className="text-[10px] text-slate-400">
                      Khi các thành viên đăng ký đủ chỉ tiêu, hệ thống sẽ tự động xếp lịch ngẫu nhiên nghỉ xen kẽ 1 trận.
                    </p>
                  </div>
                </label>

                {newAutoSchedule && (
                  <div className="pt-2 border-t border-slate-700/60">
                    <label className="text-[11px] font-bold text-lime-300 block mb-1">
                      Số VĐV cần để tự động kích hoạt chia lịch:
                    </label>
                    <select
                      value={newRequiredCount}
                      onChange={(e) => setNewRequiredCount(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold outline-none focus:border-lime-500 cursor-pointer"
                    >
                      <option value={8}>8 Người (Chuẩn 1 sân: 4 đánh, 4 nghỉ)</option>
                      <option value={12}>12 Người (6 đánh, 6 nghỉ)</option>
                      <option value={16}>16 Người (Chuẩn 2 sân: 8 đánh, 8 nghỉ)</option>
                      <option value={20}>20 Người</option>
                      <option value={24}>24 Người (Chuẩn 3 sân)</option>
                    </select>
                  </div>
                )}
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
                      checked={newAllowMen}
                      onChange={(e) => setNewAllowMen(e.target.checked)}
                      className="w-4 h-4 rounded text-lime-500 bg-slate-800"
                    />
                    <span className="font-bold text-blue-300">Nam Nam</span>
                  </label>

                  <label className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={newAllowWomen}
                      onChange={(e) => setNewAllowWomen(e.target.checked)}
                      className="w-4 h-4 rounded text-lime-500 bg-slate-800"
                    />
                    <span className="font-bold text-pink-300">Nữ Nữ</span>
                  </label>

                  <label className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={newAllowMixed}
                      onChange={(e) => setNewAllowMixed(e.target.checked)}
                      className="w-4 h-4 rounded text-lime-500 bg-slate-800"
                    />
                    <span className="font-bold text-lime-300">Nam Nữ</span>
                  </label>
                </div>
              </div>

              {/* Strict Rest Toggle */}
              <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/60 border border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newStrictRest}
                  onChange={(e) => setNewStrictRest(e.target.checked)}
                  className="w-4 h-4 rounded text-lime-500 bg-slate-900 border-slate-700 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-bold text-white">
                    Bắt buộc quy tắc 1 trận đánh, 1 trận nghỉ
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Thuật toán sẽ tự động chia người và loại trừ tuyệt đối đánh 2 trận liên tục.
                  </p>
                </div>
              </label>

              {/* 4 CAM KẾT THUẬT TOÁN THÔNG MINH */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-lime-500/30 space-y-2">
                <span className="text-[11px] font-black uppercase text-lime-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  4 Tiêu Chí Thuật Toán Xếp Lịch Tối Ưu:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5 text-lime-400">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>Đánh số trận bằng nhau ({newTargetMatches} trận)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-lime-400">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>Hạn chế đánh 2 trận liên tiếp</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-lime-400">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>Hạn chế trùng bạn đánh & đối thủ</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-lime-400">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>Cân bằng DUPR giữa 2 đội</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
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

      {/* EDIT SESSION MODAL (Chỉnh Sửa Ngày Đánh) */}
      {editingSession && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black text-white">
                  Chỉnh Sửa Ngày Đánh CLB
                </h3>
              </div>
              <button
                onClick={() => setEditingSession(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSession} className="space-y-4 my-5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Tên Buổi Đánh:
                </label>
                <input
                  type="text"
                  required
                  value={editSName}
                  onChange={(e) => setEditSName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-medium outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Ngày Thi Đấu (YYYY-MM-DD):
                  </label>
                  <input
                    type="date"
                    required
                    value={editSDate}
                    onChange={(e) => setEditSDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-bold outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Khung Giờ:
                  </label>
                  <input
                    type="text"
                    required
                    value={editSTime}
                    onChange={(e) => setEditSTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Địa Điểm:
                  </label>
                  <input
                    type="text"
                    required
                    value={editSLocation}
                    onChange={(e) => setEditSLocation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Trạng Thái Buổi Đánh:
                  </label>
                  <select
                    value={editSStatus}
                    onChange={(e) => setEditSStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="open_registration">Đang mở đăng ký</option>
                    <option value="in_progress">Đang diễn ra</option>
                    <option value="completed">Đã kết thúc</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Số Sân Hoạt Động:
                  </label>
                  <select
                    value={editSCourts}
                    onChange={(e) => setEditSCourts(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-amber-400 cursor-pointer"
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
                    value={editSTarget}
                    onChange={(e) => setEditSTarget(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Strict Rest Toggle */}
              <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/60 border border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editSStrictRest}
                  onChange={(e) => setEditSStrictRest(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-bold text-white">
                    Bắt buộc quy tắc 1 trận đánh - 1 trận nghỉ xen kẽ
                  </span>
                </div>
              </label>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-lg shadow-amber-400/20 hover:scale-105 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Lưu Thay Đổi Ngày Đánh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Profile Self-Edit & Registration Modal */}
      {profileModalMode && (
        <MemberProfileModal
          mode={profileModalMode}
          onClose={() => setProfileModalMode(null)}
        />
      )}
    </div>
  );
};
