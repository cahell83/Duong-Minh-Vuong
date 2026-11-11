import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Crown,
  Users,
  Plus,
  Trash2,
  Lock,
  RotateCw,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Edit,
  UserCheck,
  Search,
  Sparkles,
  X,
  Save,
  PlusCircle,
  UserPlus,
  FileText,
  Globe,
  Smartphone,
  Download,
  Copy,
  Check,
  Server,
  Cloud,
  Zap,
} from 'lucide-react';
import { usePickleball } from '../context/PickleballContext';
import { Player, Gender, UserRole, MatchType, ClubSession } from '../types/pickleball';
import { UserAvatar } from './UserAvatar';
import { PWAInstallModal } from './PWAInstallModal';

export const AdminSettings: React.FC<{
  onScheduleGenerated: () => void;
}> = ({ onScheduleGenerated }) => {
  const {
    sessions,
    activeSession,
    players,
    currentUser,
    isAdminOrSubAdmin,
    isAdmin,
    setCurrentUserId,
    updateSession,
    createSession,
    deleteSession,
    setActiveSessionId,
    generateScheduleForSession,
    addPlayer,
    updatePlayer,
    deletePlayer,
  } = usePickleball();

  // If member, show informative locked state with one-click switcher
  if (!isAdminOrSubAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Khu vực Quản Trị Viên & Phó Quản Trị
          </span>

          <h3 className="text-2xl font-black text-white mt-3 mb-2">
            Quyền Cài Đặt Dành Riêng Cho Ban Quản Trị
          </h3>

          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            Theo phân quyền: <strong>Phần cài đặt ngày đánh, số người, số trận, số sân và chỉnh sửa tên thành viên do Quản trị viên và Phó quản trị setup.</strong> Thành viên chỉ đăng ký ngày đánh và xem bảng thời gian thực.
          </p>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 mb-6">
            💡 Bạn đang đóng vai: <strong className="text-white">{currentUser.name} (Thành viên)</strong>. Để kiểm tra tính năng cài đặt, hãy chuyển vai trò sang Quản trị viên:
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setCurrentUserId('p-1')} // Switch to Admin Nguyễn Tuấn
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-lg shadow-amber-400/20 hover:scale-105 transition cursor-pointer"
            >
              <Crown className="w-4 h-4" />
              Đổi vai: Quản trị viên (Nguyễn Tuấn)
            </button>
            <button
              onClick={() => setCurrentUserId('p-2')} // Switch to Sub-Admin Trần Hoàng
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/20 hover:scale-105 transition cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              Đổi vai: Phó quản trị (Trần Hoàng)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Session settings state
  const [courtCount, setCourtCount] = useState<number>(activeSession?.courtCount ?? 2);
  const [targetMatches, setTargetMatches] = useState<number>(activeSession?.targetMatchesPerPlayer ?? 7);
  const [strictRest, setStrictRest] = useState<boolean>(activeSession?.strictAlternatingRest ?? true);
  const [sessionName, setSessionName] = useState<string>(activeSession?.name ?? '');
  const [sessionDate, setSessionDate] = useState<string>(activeSession?.date ?? '');
  const [sessionTime, setSessionTime] = useState<string>(activeSession?.time ?? '18:00 - 21:00');
  const [sessionLocation, setSessionLocation] = useState<string>(activeSession?.location ?? 'Sân D-Pickleball Center');
  const [allowedTypes, setAllowedTypes] = useState<MatchType[]>(
    activeSession?.allowedTypes ?? ['men_doubles', 'women_doubles', 'mixed_doubles']
  );

  // Sync state if activeSession changes
  React.useEffect(() => {
    if (activeSession) {
      setCourtCount(activeSession.courtCount);
      setTargetMatches(activeSession.targetMatchesPerPlayer);
      setStrictRest(activeSession.strictAlternatingRest);
      setSessionName(activeSession.name);
      setSessionDate(activeSession.date);
      setSessionTime(activeSession.time);
      setSessionLocation(activeSession.location);
      setAllowedTypes(activeSession.allowedTypes);
    }
  }, [activeSession]);

  // Modal: Create New Session (Tạo Ngày Đánh Mới)
  const [showCreateSessionModal, setShowCreateSessionModal] = useState(false);
  const [newSName, setNewSName] = useState('Buổi Giao Lưu CLB Mới');
  const [newSDate, setNewSDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [newSTime, setNewSTime] = useState('18:00 - 21:00');
  const [newSLocation, setNewSLocation] = useState('Sân D-Pickleball Center, TP. Thủ Đức');
  const [newSCourts, setNewSCourts] = useState(2);
  const [newSTarget, setNewSTarget] = useState(7);
  const [newSStrictRest, setNewSStrictRest] = useState(true);
  const [newSHeadcountPreset, setNewSHeadcountPreset] = useState<'16' | '12' | '20' | '0'>('0');
  const [newSAutoSchedule, setNewSAutoSchedule] = useState(true);
  const [newSRequiredCount, setNewSRequiredCount] = useState(16);
  const [newSAllowMen, setNewSAllowMen] = useState(true);
  const [newSAllowWomen, setNewSAllowWomen] = useState(true);
  const [newSAllowMixed, setNewSAllowMixed] = useState(true);

  // Modal: Edit Member (Chỉnh sửa tên và thông tin thành viên)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editPlayerName, setEditPlayerName] = useState('');
  const [editPlayerGender, setEditPlayerGender] = useState<Gender>('male');
  const [editPlayerRating, setEditPlayerRating] = useState('3.5');
  const [editPlayerAge, setEditPlayerAge] = useState<number | string>(28);
  const [editPlayerPhone, setEditPlayerPhone] = useState('');
  const [editPlayerPassword, setEditPlayerPassword] = useState('123456');
  const [editPlayerRole, setEditPlayerRole] = useState<UserRole>('member');
  const [editPlayerActive, setEditPlayerActive] = useState<boolean>(true);

  // Single New Player Form State
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerGender, setNewPlayerGender] = useState<Gender>('male');
  const [newPlayerRating, setNewPlayerRating] = useState('3.5');
  const [newPlayerRole, setNewPlayerRole] = useState<UserRole>('member');
  const [newPlayerPhone, setNewPlayerPhone] = useState('');

  // Bulk Add Members Modal State
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [bulkNamesText, setBulkNamesText] = useState('');
  const [bulkGenderMode, setBulkGenderMode] = useState<'auto' | 'male' | 'female'>('auto');
  const [bulkDefaultRating, setBulkDefaultRating] = useState('3.5');
  const [bulkAddToActiveSession, setBulkAddToActiveSession] = useState(true);

  // Member search & filter
  const [memberSearch, setMemberSearch] = useState('');
  const [memberGenderFilter, setMemberGenderFilter] = useState<'all' | 'male' | 'female'>('all');

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [showPublishInstallModal, setShowPublishInstallModal] = useState(false);
  const [copiedAppUrl, setCopiedAppUrl] = useState(false);

  if (!activeSession) return null;

  // Vietnamese female name keyword detector
  const femaleKeywords = [
    'thị', 'mai', 'lan', 'hương', 'ngọc', 'thảo', 'nga', 'hoa', 'tuyết', 'trang',
    'vy', 'linh', 'thúy', 'diễm', 'phương', 'ánh', 'ngân', 'hà', 'oanh', 'nhi',
    'quỳnh', 'nhung', 'hằng', 'chi', 'yến', 'bích', 'ly', 'huyền', 'loan'
  ];

  const detectGenderFromName = (name: string): Gender => {
    const lower = name.toLowerCase();
    for (const kw of femaleKeywords) {
      if (lower.includes(kw)) return 'female';
    }
    return 'male';
  };

  // Toggle type checkbox
  const handleTypeToggle = (type: MatchType) => {
    if (allowedTypes.includes(type)) {
      if (allowedTypes.length === 1) return;
      setAllowedTypes(allowedTypes.filter((t) => t !== type));
    } else {
      setAllowedTypes([...allowedTypes, type]);
    }
  };

  // Save Session Settings & Regenerate matches
  const handleSaveSessionSettings = () => {
    const updated: ClubSession = {
      ...activeSession,
      name: sessionName,
      date: sessionDate,
      time: sessionTime,
      location: sessionLocation,
      courtCount,
      targetMatchesPerPlayer: targetMatches,
      strictAlternatingRest: strictRest,
      allowedTypes,
    };
    updateSession(updated);

    const res = generateScheduleForSession(activeSession.id);
    setFeedbackMsg(`✓ Đã lưu cài đặt ngày đánh "${sessionName}" và cập nhật lịch thi đấu thành công!`);
    setTimeout(() => setFeedbackMsg(null), 5000);
    onScheduleGenerated();
  };

  // Quick preset: Select headcount for active session
  const handleSetHeadcount = (count: number) => {
    let selectedIds: string[] = [];
    if (count === 16) {
      const males = players.filter((p) => p.gender === 'male').slice(0, 8).map((p) => p.id);
      const females = players.filter((p) => p.gender === 'female').slice(0, 8).map((p) => p.id);
      selectedIds = [...males, ...females];
    } else if (count === 12) {
      const males = players.filter((p) => p.gender === 'male').slice(0, 6).map((p) => p.id);
      const females = players.filter((p) => p.gender === 'female').slice(0, 6).map((p) => p.id);
      selectedIds = [...males, ...females];
    } else if (count === 20) {
      const males = players.filter((p) => p.gender === 'male').slice(0, 10).map((p) => p.id);
      const females = players.filter((p) => p.gender === 'female').slice(0, 10).map((p) => p.id);
      selectedIds = [...males, ...females];
    } else if (count === 8) {
      const males = players.filter((p) => p.gender === 'male').slice(0, 4).map((p) => p.id);
      const females = players.filter((p) => p.gender === 'female').slice(0, 4).map((p) => p.id);
      selectedIds = [...males, ...females];
    } else if (count === -1) {
      selectedIds = players.map((p) => p.id);
    } else if (count === 0) {
      selectedIds = [];
    }

    updateSession({
      ...activeSession,
      registeredPlayerIds: selectedIds,
    });
    setFeedbackMsg(`Đã điều chỉnh số thành viên tham gia buổi này thành ${selectedIds.length} người.`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Handle Add Single Member
  const handleAddPlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    const newP = addPlayer({
      name: newPlayerName.trim(),
      gender: newPlayerGender,
      role: newPlayerRole,
      rating: newPlayerRating,
      phone: newPlayerPhone.trim() || undefined,
      active: true,
    });

    updateSession({
      ...activeSession,
      registeredPlayerIds: [...activeSession.registeredPlayerIds, newP.id],
    });

    setNewPlayerName('');
    setNewPlayerPhone('');
    setFeedbackMsg(`✓ Đã thêm thành viên "${newP.name}" vào câu lạc bộ.`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Handle Bulk Add Members
  const handleBulkAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawLines = bulkNamesText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (rawLines.length === 0) return;

    const createdIds: string[] = [];
    rawLines.forEach((name) => {
      let gender: Gender = 'male';
      if (bulkGenderMode === 'auto') {
        gender = detectGenderFromName(name);
      } else {
        gender = bulkGenderMode;
      }

      const p = addPlayer({
        name,
        gender,
        rating: bulkDefaultRating,
        role: 'member',
        active: true,
      });
      createdIds.push(p.id);
    });

    if (bulkAddToActiveSession && createdIds.length > 0) {
      updateSession({
        ...activeSession,
        registeredPlayerIds: [...new Set([...activeSession.registeredPlayerIds, ...createdIds])],
      });
    }

    setBulkNamesText('');
    setShowBulkAddModal(false);
    setFeedbackMsg(`✓ Đã thêm thành công ${createdIds.length} thành viên mới vào CLB!`);
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  // Quick preset sample members
  const addQuickSampleMembers = (type: 'male' | 'female' | 'both') => {
    const maleNames = ['Hoàng Tuấn Anh', 'Đinh Trọng Hưng', 'Lê Minh Trí', 'Phạm Cao Cường'];
    const femaleNames = ['Nguyễn Thùy Trang', 'Vũ Minh Anh', 'Đặng Bích Hạnh', 'Lê Kim Chi'];

    const toAdd: { name: string; gender: Gender }[] = [];
    if (type === 'male' || type === 'both') {
      maleNames.forEach((name) => toAdd.push({ name, gender: 'male' }));
    }
    if (type === 'female' || type === 'both') {
      femaleNames.forEach((name) => toAdd.push({ name, gender: 'female' }));
    }

    const createdIds: string[] = [];
    toAdd.forEach((item) => {
      const p = addPlayer({
        name: item.name,
        gender: item.gender,
        rating: '3.5',
        role: 'member',
        active: true,
      });
      createdIds.push(p.id);
    });

    updateSession({
      ...activeSession,
      registeredPlayerIds: [...new Set([...activeSession.registeredPlayerIds, ...createdIds])],
    });

    setFeedbackMsg(`✓ Đã thêm ${createdIds.length} thành viên mẫu vào câu lạc bộ!`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Open Edit Player Modal
  const handleOpenEditPlayer = (p: Player) => {
    setEditingPlayer(p);
    setEditPlayerName(p.name);
    setEditPlayerGender(p.gender);
    setEditPlayerRating(p.rating || '3.5');
    setEditPlayerAge(p.age || 28);
    setEditPlayerPhone(p.phone || '');
    setEditPlayerPassword(p.password || '123456');
    setEditPlayerRole(p.role);
    setEditPlayerActive(p.active);
  };

  // Save Player Edit
  const handleSavePlayerEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer || !editPlayerName.trim()) return;

    const updated: Player = {
      ...editingPlayer,
      name: editPlayerName.trim(),
      gender: editPlayerGender,
      rating: editPlayerRating.trim(),
      age: editPlayerAge ? Number(editPlayerAge) : undefined,
      phone: editPlayerPhone.trim() || undefined,
      password: editPlayerPassword.trim() || undefined,
      role: editPlayerRole,
      active: editPlayerActive,
    };

    updatePlayer(updated);
    setEditingPlayer(null);
    setFeedbackMsg(`✓ Đã cập nhật thành công thông tin VĐV "${updated.name}"!`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Quick Date Helpers
  const setQuickDate = (daysAhead: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysAhead);
    setNewSDate(target.toISOString().split('T')[0]);
  };

  const handleCreateSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let initialMemberIds: string[] = [];
    if (newSHeadcountPreset === '16') {
      const males = players.filter((p) => p.gender === 'male').slice(0, 8).map((p) => p.id);
      const females = players.filter((p) => p.gender === 'female').slice(0, 8).map((p) => p.id);
      initialMemberIds = [...males, ...females];
    } else if (newSHeadcountPreset === '12') {
      const males = players.filter((p) => p.gender === 'male').slice(0, 6).map((p) => p.id);
      const females = players.filter((p) => p.gender === 'female').slice(0, 6).map((p) => p.id);
      initialMemberIds = [...males, ...females];
    } else if (newSHeadcountPreset === '20') {
      const males = players.filter((p) => p.gender === 'male').slice(0, 10).map((p) => p.id);
      const females = players.filter((p) => p.gender === 'female').slice(0, 10).map((p) => p.id);
      initialMemberIds = [...males, ...females];
    }

    const allowedTypes: MatchType[] = [];
    if (newSAllowMen) allowedTypes.push('men_doubles');
    if (newSAllowWomen) allowedTypes.push('women_doubles');
    if (newSAllowMixed) allowedTypes.push('mixed_doubles');

    const created = createSession({
      name: newSName,
      date: newSDate,
      time: newSTime,
      location: newSLocation,
      courtCount: Number(newSCourts),
      targetMatchesPerPlayer: Number(newSTarget),
      strictAlternatingRest: newSStrictRest,
      registeredPlayerIds: initialMemberIds,
      autoScheduleWhenFull: newSAutoSchedule,
      requiredPlayerCount: Number(newSRequiredCount),
      allowedTypes: allowedTypes.length > 0 ? allowedTypes : ['men_doubles', 'women_doubles', 'mixed_doubles'],
    });

    setShowCreateSessionModal(false);
    setActiveSessionId(created.id);
    if (initialMemberIds.length === 0) {
      setFeedbackMsg(`✓ Đã tạo buổi trống "${created.name}" (${created.date}). Khi đủ ${newSRequiredCount} VĐV đăng ký, hệ thống sẽ tự động chia lịch ngẫu nhiên!`);
    } else {
      setFeedbackMsg(`✓ Đã tạo thành công ngày đánh mới "${created.name}" (${created.date}) với ${initialMemberIds.length} VĐV!`);
    }
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  // Filtered members for display
  const filteredPlayers = players.filter((p) => {
    if (memberGenderFilter !== 'all' && p.gender !== memberGenderFilter) return false;
    if (memberSearch.trim() && !p.name.toLowerCase().includes(memberSearch.toLowerCase())) {
      return false;
    }
    return true;
  });

  const registeredInActive = players.filter((p) => activeSession.registeredPlayerIds.includes(p.id));
  const activeMales = registeredInActive.filter((p) => p.gender === 'male').length;
  const activeFemales = registeredInActive.filter((p) => p.gender === 'female').length;

  return (
    <div className="space-y-8">
      {/* Top Banner with Admin Identity & Create Date Button */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Settings className="w-6 h-6 text-lime-400" />
              <h2 className="text-2xl font-black text-white">
                Bảng Cài Đặt Ban Quản Trị CLB
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Quyền thiết lập: Tạo ngày đánh, chỉnh sửa số thành viên, đổi tên thành viên, thêm nhiều thành viên tùy ý.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowCreateSessionModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-lime-400 to-emerald-500 text-slate-950 shadow-lg shadow-lime-500/20 hover:from-lime-300 hover:to-emerald-400 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Tạo Ngày Đánh Mới
            </button>

            <button
              onClick={() => setShowBulkAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Thêm Nhiều Thành Viên Cùng Lúc
            </button>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" />
              {currentUser.name} ({currentUser.role === 'admin' ? 'Quản trị viên' : 'Phó quản trị'})
            </span>
          </div>
        </div>

        {feedbackMsg && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-in fade-in">
            {feedbackMsg}
          </div>
        )}
      </div>

      {/* SECTION 1: Cài Tạo & Chỉnh Sửa Ngày Đánh */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-lime-500/20 text-lime-400 flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                Cài Đặt & Chỉnh Sửa Ngày Đánh
              </h3>
              <p className="text-xs text-slate-400">
                Đang cấu hình: <strong className="text-white">{activeSession.name}</strong> ({activeSession.date})
              </p>
            </div>
          </div>

          {/* Quick Session Switcher */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
            <Calendar className="w-4 h-4 text-lime-400" />
            <span className="text-slate-400 font-medium">Chọn ngày khác:</span>
            <select
              value={activeSession.id}
              onChange={(e) => setActiveSessionId(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                  {s.name} ({s.date})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Tên Buổi Đánh */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Tên Buổi Sinh Hoạt:
            </label>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-lime-500 font-medium"
            />
          </div>

          {/* Ngày Thi Đấu */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Ngày Thi Đấu (YYYY-MM-DD):
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-lime-500 font-medium"
            />
          </div>

          {/* Khung Giờ */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Khung Giờ Thi Đấu:
            </label>
            <input
              type="text"
              value={sessionTime}
              onChange={(e) => setSessionTime(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-lime-500 font-medium"
            />
          </div>

          {/* Địa Điểm Sân */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Địa Điểm / Cụm Sân:
            </label>
            <input
              type="text"
              value={sessionLocation}
              onChange={(e) => setSessionLocation(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-lime-500 font-medium"
            />
          </div>

          {/* Số Sân */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Số Sân Hoạt Động Đồng Thời:
            </label>
            <select
              value={courtCount}
              onChange={(e) => setCourtCount(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-lime-500 cursor-pointer font-bold"
            >
              <option value={1}>1 Sân (Tối đa 4 người thi đấu / vòng)</option>
              <option value={2}>2 Sân (Tối đa 8 người thi đấu / vòng - Chuẩn cho 16 người)</option>
              <option value={3}>3 Sân (Tối đa 12 người thi đấu / vòng)</option>
              <option value={4}>4 Sân (Tối đa 16 người thi đấu / vòng)</option>
            </select>
          </div>

          {/* Mục tiêu số trận mỗi người */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Mục Tiêu Số Trận / Người:
            </label>
            <input
              type="number"
              min="1"
              max="15"
              value={targetMatches}
              onChange={(e) => setTargetMatches(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-lime-500"
            />
          </div>
        </div>

        {/* Strict Alternating Rest Toggle */}
        <div className="mt-5">
          <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={strictRest}
              onChange={(e) => setStrictRest(e.target.checked)}
              className="w-4 h-4 rounded text-lime-500 bg-slate-900 border-slate-700 cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-bold text-white">
                Bắt buộc: Không ai được đánh 2 trận liên tiếp (Đánh 1 trận, Nghỉ 1 trận xen kẽ)
              </span>
              <p className="text-[11px] text-slate-400">
                Thuật toán loại trừ 100% những người vừa đấu ở vòng trước, đảm bảo nghỉ ngơi công bằng.
              </p>
            </div>
          </label>
        </div>

        {/* Categories to generate */}
        <div className="mt-5 pt-5 border-t border-slate-800">
          <label className="text-xs font-bold text-slate-300 block mb-2.5">
            Các Thể Loại Trận Đấu Được Phép Chia:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label
              className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition ${
                allowedTypes.includes('men_doubles')
                  ? 'bg-blue-500/10 border-blue-500/40 text-blue-200'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-400'
              }`}
            >
              <input
                type="checkbox"
                checked={allowedTypes.includes('men_doubles')}
                onChange={() => handleTypeToggle('men_doubles')}
                className="w-4 h-4 rounded text-blue-500"
              />
              <div className="text-xs font-bold">
                Trận 4 Nam (Đôi Nam)
              </div>
            </label>

            <label
              className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition ${
                allowedTypes.includes('women_doubles')
                  ? 'bg-pink-500/10 border-pink-500/40 text-pink-200'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-400'
              }`}
            >
              <input
                type="checkbox"
                checked={allowedTypes.includes('women_doubles')}
                onChange={() => handleTypeToggle('women_doubles')}
                className="w-4 h-4 rounded text-pink-500"
              />
              <div className="text-xs font-bold">
                Trận 4 Nữ (Đôi Nữ)
              </div>
            </label>

            <label
              className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition ${
                allowedTypes.includes('mixed_doubles')
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-400'
              }`}
            >
              <input
                type="checkbox"
                checked={allowedTypes.includes('mixed_doubles')}
                onChange={() => handleTypeToggle('mixed_doubles')}
                className="w-4 h-4 rounded text-emerald-500"
              />
              <div className="text-xs font-bold">
                Trận Nam Nữ (Đôi Nam Nữ)
              </div>
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="mt-6 pt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            Lưu thay đổi ngày đánh sẽ cập nhật lại toàn bộ lịch đấu cho ngày này.
          </div>
          <button
            onClick={handleSaveSessionSettings}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-lime-400 to-emerald-500 text-slate-950 shadow-lg shadow-lime-500/20 hover:from-lime-300 hover:to-emerald-400 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Lưu Cài Đặt Ngày Đánh & Tạo Lịch Mới
          </button>
        </div>
      </div>

      {/* SECTION 2: Chỉnh Sửa Số Thành Viên Tham Gia Ngày Đánh */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                Chỉnh Sửa Số Thành Viên Buổi Đánh ({registeredInActive.length} VĐV Đã Chọn)
              </h3>
              <p className="text-xs text-slate-400">
                Điều chỉnh số lượng người tham gia chính thức cho ngày {activeSession.date}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {activeMales} Nam
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-pink-500/20 text-pink-300 border border-pink-500/30">
              {activeFemales} Nữ
            </span>
          </div>
        </div>

        {/* Quick Headcount Presets Buttons */}
        <div>
          <div className="text-xs font-bold text-slate-300 mb-2.5">
            Cài đặt nhanh số lượng thành viên tham gia:
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => handleSetHeadcount(16)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                registeredInActive.length === 16
                  ? 'bg-lime-500 text-slate-950 border-lime-400 shadow-md font-black'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-500'
              }`}
            >
              ⭐ Chuẩn 16 VĐV (8 Nam + 8 Nữ) • Đủ 2 sân nghỉ 1-1
            </button>

            <button
              type="button"
              onClick={() => handleSetHeadcount(12)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                registeredInActive.length === 12
                  ? 'bg-lime-500 text-slate-950 border-lime-400 shadow-md font-black'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-500'
              }`}
            >
              12 VĐV (6 Nam + 6 Nữ) • Đủ 1-2 sân
            </button>

            <button
              type="button"
              onClick={() => handleSetHeadcount(20)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                registeredInActive.length === 20
                  ? 'bg-lime-500 text-slate-950 border-lime-400 shadow-md font-black'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-500'
              }`}
            >
              20 VĐV (10 Nam + 10 Nữ) • Đủ 2-3 sân
            </button>

            <button
              type="button"
              onClick={() => handleSetHeadcount(8)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                registeredInActive.length === 8
                  ? 'bg-lime-500 text-slate-950 border-lime-400 shadow-md font-black'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-500'
              }`}
            >
              8 VĐV (4 Nam + 4 Nữ) • Đủ 1 sân
            </button>

            <button
              type="button"
              onClick={() => handleSetHeadcount(-1)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            >
              Chọn tất cả ({players.length})
            </button>

            <button
              type="button"
              onClick={() => handleSetHeadcount(0)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition cursor-pointer"
            >
              Bỏ chọn tất cả
            </button>
          </div>
        </div>

        {/* Headcount validation feedback */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
          {registeredInActive.length === 16 && courtCount === 2 ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Tỷ lệ hoàn hảo: 16 người với 2 sân $\rightarrow$ 8 người đánh, 8 người nghỉ, đúng 100% quy tắc 1 trận đánh - 1 trận nghỉ!
            </span>
          ) : registeredInActive.length < 4 ? (
            <span className="text-rose-400 font-bold">
              Cần tối thiểu 4 người để tổ chức đánh. Hãy tích chọn thêm thành viên bên dưới.
            </span>
          ) : (
            <span>
              Số thành viên hiện tại: <strong>{registeredInActive.length} người</strong> ({activeMales} Nam, {activeFemales} Nữ). Thuật toán sẽ tự động chia vòng và tối ưu hóa thời gian nghỉ cho từng người.
            </span>
          )}
        </div>
      </div>

      {/* SECTION 3: Quản Lý & Chỉnh Sửa Tên Thành Viên (Edit Member Name & Profile) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">
                  Quản Lý Thành Viên CLB ({players.length} Người)
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  Không giới hạn số lượng
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Admin và Phó quản trị có thể thêm nhiều thành viên tùy ý, bấm nút <strong className="text-amber-400">"Sửa tên & TT"</strong> để chỉnh sửa tên người.
              </p>
            </div>
          </div>

          {/* Quick Bulk Batch Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBulkAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 transition cursor-pointer shadow-md"
            >
              <UserPlus className="w-4 h-4" />
              Thêm Hàng Loạt (Paste danh sách)
            </button>
            <button
              type="button"
              onClick={() => addQuickSampleMembers('male')}
              className="px-2.5 py-2 rounded-xl text-xs font-semibold bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30 transition cursor-pointer"
            >
              + 4 Nam mẫu
            </button>
            <button
              type="button"
              onClick={() => addQuickSampleMembers('female')}
              className="px-2.5 py-2 rounded-xl text-xs font-semibold bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 border border-pink-500/30 transition cursor-pointer"
            >
              + 4 Nữ mẫu
            </button>
          </div>
        </div>

        {/* Single Member Add Form */}
        <form
          onSubmit={handleAddPlayerSubmit}
          className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
        >
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              Họ và tên thành viên mới:
            </label>
            <input
              type="text"
              required
              placeholder="VD: Lê Anh Quân"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-lime-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              Giới tính:
            </label>
            <select
              value={newPlayerGender}
              onChange={(e) => setNewPlayerGender(e.target.value as Gender)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-lime-500 cursor-pointer"
            >
              <option value="male">♂ Nam</option>
              <option value="female">♀ Nữ</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              Trình độ (DUPR):
            </label>
            <input
              type="text"
              placeholder="VD: 3.5"
              value={newPlayerRating}
              onChange={(e) => setNewPlayerRating(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-lime-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              Vai trò:
            </label>
            <select
              value={newPlayerRole}
              onChange={(e) => setNewPlayerRole(e.target.value as UserRole)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-lime-500 cursor-pointer"
            >
              <option value="member">Thành viên</option>
              <option value="sub_admin">Phó quản trị</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs font-black bg-lime-500 hover:bg-lime-400 text-slate-950 transition flex items-center justify-center gap-1.5 shadow-md shadow-lime-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Thêm VĐV Mới
            </button>
          </div>
        </form>

        {/* Filter & Search Bar for Members Table */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMemberGenderFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                memberGenderFilter === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tất cả ({players.length})
            </button>
            <button
              type="button"
              onClick={() => setMemberGenderFilter('male')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                memberGenderFilter === 'male'
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ♂ Nam ({players.filter((p) => p.gender === 'male').length})
            </button>
            <button
              type="button"
              onClick={() => setMemberGenderFilter('female')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                memberGenderFilter === 'female'
                  ? 'bg-pink-600/30 text-pink-300 border border-pink-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ♀ Nữ ({players.filter((p) => p.gender === 'female').length})
            </button>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên thành viên..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="bg-transparent text-white outline-none w-full placeholder-slate-500"
            />
          </div>
        </div>

        {/* Players Table with Dedicated "Sửa tên & TT" Button */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800/80 text-[11px] font-bold uppercase text-slate-400 border-b border-slate-800">
                <th className="py-3 px-3 text-center w-12">Tham gia buổi này</th>
                <th className="py-3 px-4">Tên Vận Động Viên (Bấm nút để sửa)</th>
                <th className="py-3 px-3 text-center">Giới Tính</th>
                <th className="py-3 px-3 text-center">DUPR</th>
                <th className="py-3 px-3">Vai Trò</th>
                <th className="py-3 px-4 text-right">Chỉnh Sửa Tên & Thông Tin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPlayers.map((p) => {
                const isRegisteredInActive = activeSession.registeredPlayerIds.includes(p.id);

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isRegisteredInActive}
                        onChange={() => {
                          const newIds = isRegisteredInActive
                            ? activeSession.registeredPlayerIds.filter((id) => id !== p.id)
                            : [...activeSession.registeredPlayerIds, p.id];
                          updateSession({
                            ...activeSession,
                            registeredPlayerIds: newIds,
                          });
                        }}
                        className="w-4 h-4 rounded text-lime-500 bg-slate-900 border-slate-700 cursor-pointer"
                      />
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar player={p} size="sm" />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{p.name}</span>
                            {p.age && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                ({p.age} tuổi)
                              </span>
                            )}
                            {p.phone && (
                              <span className="text-[10px] text-slate-500 font-normal">
                                • {p.phone}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {p.role === 'admin'
                              ? '👑 Quản trị viên'
                              : p.role === 'sub_admin'
                              ? '🛡️ Phó quản trị'
                              : 'Thành viên'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      {p.gender === 'female' ? (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-semibold">
                          ♀ Nữ
                        </span>
                      ) : (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold">
                          ♂ Nam
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-slate-300">
                      {p.rating || '3.5'}
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-xs text-slate-300">
                        {p.role === 'admin'
                          ? 'Quản trị viên'
                          : p.role === 'sub_admin'
                          ? 'Phó quản trị'
                          : 'Thành viên'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit Player Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditPlayer(p)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Sửa tên & TT
                        </button>

                        {/* Delete Player Button */}
                        {p.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Xác nhận xóa thành viên "${p.name}" khỏi câu lạc bộ?`)) {
                                deletePlayer(p.id);
                              }
                            }}
                            className="text-slate-500 hover:text-rose-400 p-1.5 transition rounded-lg hover:bg-slate-800 cursor-pointer"
                            title="Xóa thành viên"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4: Xuất Bản Web App, Tên Miền & Hosting Miễn Phí (PWA & Deployment Guide) */}
      <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              4
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">
                  Xuất Bản Web App, Tên Miền & Máy Chủ Miễn Phí 100%
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  PWA Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Hướng dẫn cài đặt ứng dụng lên màn hình điện thoại thành viên và các kênh lưu trữ web miễn phí tốt nhất.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowPublishInstallModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition cursor-pointer self-start sm:self-auto"
          >
            <Smartphone className="w-4 h-4" />
            Xem Hướng Dẫn Cài App
          </button>
        </div>

        {/* Card 1: Link Hiện Tại Đang Chạy Sẵn */}
        <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 mb-6">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Đường Link Web App Hiện Tại Của Bạn (Đang Hoạt Động Miễn Phí)
              </span>
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              ✓ Đã có SSL HTTPS & PWA
            </span>
          </div>

          <div className="flex items-center gap-2 flex-col sm:flex-row">
            <input
              type="text"
              readOnly
              value={typeof window !== 'undefined' ? window.location.href : ''}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-mono focus:outline-none"
            />
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    navigator.clipboard.writeText(window.location.href);
                    setCopiedAppUrl(true);
                    setTimeout(() => setCopiedAppUrl(false), 2000);
                  }
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
              >
                {copiedAppUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Đã Chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao Chép Link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowPublishInstallModal(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-lime-400 to-emerald-500 text-slate-950 text-xs font-black shadow-md transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Cài Ra Màn Hình</span>
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            💡 <strong>Mẹo:</strong> Bạn có thể sao chép đường link này và gửi vào nhóm <strong>Zalo / Messenger CLB Cún Cưng</strong>. Thành viên mở link trên Safari (iPhone) hoặc Chrome (Android) là có thể bấm "Cài Đặt App" để dùng như ứng dụng thông thường!
          </p>
        </div>

        {/* Card: Tải Về Mã Nguồn & Bản Build (.ZIP) cho kho lưu trữ */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 mb-6">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">📦</span>
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Tải Mã Nguồn Để Đưa Lên Kho Lưu Trữ (GitHub / Vercel / Netlify)
              </h4>
            </div>
            <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Đã đóng gói sẵn file ZIP
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 mb-4 leading-relaxed">
            🔍 <strong>Giải thích lý do kho lưu trữ của bạn chỉ thấy dự án cũ "Noibaitaxi":</strong>
            <p className="mt-1 text-slate-400">
              Dự án <strong>"Pickleball Cún Cưng"</strong> hiện đang chạy độc lập trên máy chủ Google AI Studio / Cloud Run, <em>chưa được đẩy lên tài khoản GitHub cá nhân của bạn</em> (nơi bạn đang lưu dự án Noibaitaxi).
            </p>
            <p className="mt-1 text-slate-400">
              👉 Bạn có thể dùng trực tiếp đường link ở trên mà không cần tạo kho lưu trữ, HOẶC bấm nút tải file <code className="text-amber-300">.ZIP</code> bên dưới để đưa lên GitHub thành một repository mới!
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="/pickleball-cun-cung-source.zip"
              download="pickleball-cun-cung-source.zip"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Tải Toàn Bộ Code Dự Án (.ZIP)
            </a>

            <a
              href="/pickleball-cun-cung-dist.zip"
              download="pickleball-cun-cung-dist.zip"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Tải Bản Build Kéo Thả Netlify (.ZIP)
            </a>
          </div>
        </div>

        {/* Card 2: 4 Kênh Hosting & Tên Miền Miễn Phí 100% */}
        <div className="mb-6">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Server className="w-4 h-4 text-lime-400" />
            Top 4 Kênh Hosting & Tên Miền Miễn Phí 100% Để Xuất Bản Lâu Dài:
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vercel */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-slate-600 transition">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs">
                    ▲
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white">Vercel (Khuyên dùng số 1)</h5>
                    <span className="text-[10px] text-emerald-400">Miễn phí 100% trọn đời</span>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300 font-mono">
                  .vercel.app
                </span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 mb-3">
                <li>• <strong>Tên miền free:</strong> Ví dụ: <code className="text-lime-300 bg-slate-900 px-1 py-0.5 rounded">pickleball-cuncung.vercel.app</code></li>
                <li>• <strong>Ưu điểm:</strong> Băng thông 100GB/tháng, tự động cấp HTTPS SSL miễn phí, tải trang siêu tốc.</li>
                <li>• <strong>Cách triển khai:</strong> Đẩy code lên GitHub &rarr; Đăng nhập Vercel.com bằng GitHub &rarr; Bấm "Import" là xong trong 30 giây!</li>
              </ul>
            </div>

            {/* Cloudflare Pages */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-slate-600 transition">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                    ⚡
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white">Cloudflare Pages</h5>
                    <span className="text-[10px] text-emerald-400">Băng thông Không giới hạn</span>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300 font-mono">
                  .pages.dev
                </span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 mb-3">
                <li>• <strong>Tên miền free:</strong> Ví dụ: <code className="text-lime-300 bg-slate-900 px-1 py-0.5 rounded">pickleballcuncung.pages.dev</code></li>
                <li>• <strong>Ưu điểm:</strong> Máy chủ CDN tại Hà Nội & TP.HCM, tốc độ phản hồi cực nhanh, không lo hết băng thông.</li>
                <li>• <strong>Cách triển khai:</strong> Vào pages.cloudflare.com &rarr; Kết nối GitHub &rarr; Build command: <code className="text-amber-300">npm run build</code>, Output: <code className="text-amber-300">dist</code>.</li>
              </ul>
            </div>

            {/* Netlify */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-slate-600 transition">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
                    🌐
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white">Netlify</h5>
                    <span className="text-[10px] text-emerald-400">Dễ kéo thả file nhất</span>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300 font-mono">
                  .netlify.app
                </span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 mb-3">
                <li>• <strong>Tên miền free:</strong> Ví dụ: <code className="text-lime-300 bg-slate-900 px-1 py-0.5 rounded">cuncung-pickleball.netlify.app</code></li>
                <li>• <strong>Ưu điểm:</strong> Có thể kéo thả trực tiếp thư mục <code className="text-cyan-300">dist</code> sau khi build lên web netlify.com mà không cần tài khoản GitHub!</li>
              </ul>
            </div>

            {/* GitHub Pages */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-slate-600 transition">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                    🐙
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white">GitHub Pages</h5>
                    <span className="text-[10px] text-emerald-400">Mã nguồn mở trọn đời</span>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300 font-mono">
                  .github.io
                </span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 mb-3">
                <li>• <strong>Tên miền free:</strong> Ví dụ: <code className="text-lime-300 bg-slate-900 px-1 py-0.5 rounded">&lt;username&gt;.github.io</code></li>
                <li>• <strong>Ưu điểm:</strong> Quản lý phiên bản code an toàn, hoàn toàn miễn phí trọn đời cho dự án CLB cộng đồng.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Card 3: Hướng Dẫn Tên Miền Riêng (Custom Domain) */}
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-sky-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Nếu Muốn Gắn Tên Miền Riêng (Ví dụ: pickleballcuncung.club hoặc .vn)
            </h4>
          </div>
          <p className="text-xs text-slate-300 mb-3 leading-relaxed">
            Các nền tảng miễn phí ở trên (Vercel, Cloudflare, Netlify) đều <strong>cho phép bạn gắn tên miền riêng miễn phí 100%</strong> mà không thu thêm bất kỳ khoản phí duy trì nào.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <strong className="text-amber-300 block mb-1">1. Mua tên miền giá rẻ:</strong>
              <p className="text-slate-400 text-[11px]">
                Mua tại Namecheap, Porkbun, Mắt Bão hoặc PA Việt Nam. Đuôi <code className="text-white">.club</code> hoặc <code className="text-white">.xyz</code> chỉ khoảng 30.000đ - 70.000đ/năm.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <strong className="text-lime-300 block mb-1">2. Trỏ bản ghi DNS:</strong>
              <p className="text-slate-400 text-[11px]">
                Thêm 1 bản ghi CNAME: Host <code className="text-white">@</code> hoặc <code className="text-white">app</code> trỏ về địa chỉ Vercel/Cloudflare cung cấp.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <strong className="text-cyan-300 block mb-1">3. Tự động kích hoạt SSL:</strong>
              <p className="text-slate-400 text-[11px]">
                Hệ thống tự động kích hoạt ổ khóa bảo mật HTTPS màu xanh sau 5 phút. Thành viên truy cập siêu mượt!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Thêm Hàng Loạt Nhiều Thành Viên (Bulk Add Modal) */}
      {showBulkAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black text-white">
                  Thêm Nhiều Thành Viên Cùng Lúc
                </h3>
              </div>
              <button
                onClick={() => setShowBulkAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBulkAddSubmit} className="space-y-4 my-5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Nhập danh sách họ tên (mỗi người 1 dòng hoặc cách nhau bởi dấu phẩy):
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder={`Nguyễn Văn Hùng\nTrần Thị Mai Lan\nLê Quốc Toàn\nPhạm Thu Cúc\nĐỗ Minh Tuấn`}
                  value={bulkNamesText}
                  onChange={(e) => setBulkNamesText(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-400 font-mono"
                />
                <div className="text-[11px] text-slate-400 mt-1">
                  Số người nhận diện: <strong>{bulkNamesText.split(/[\n,]+/).map(s=>s.trim()).filter(s=>s.length>0).length} thành viên</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Chế độ phân loại giới tính:
                  </label>
                  <select
                    value={bulkGenderMode}
                    onChange={(e) => setBulkGenderMode(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="auto">Tự động nhận diện (Thị, Mai, Lan... là Nữ)</option>
                    <option value="male">Tất cả là Nam</option>
                    <option value="female">Tất cả là Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Trình độ DUPR mặc định:
                  </label>
                  <input
                    type="text"
                    value={bulkDefaultRating}
                    onChange={(e) => setBulkDefaultRating(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/60 border border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bulkAddToActiveSession}
                  onChange={(e) => setBulkAddToActiveSession(e.target.checked)}
                  className="w-4 h-4 rounded text-lime-500 bg-slate-900 border-slate-700 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-bold text-white">
                    Tự động thêm ngay vào danh sách buổi đánh hiện tại ({activeSession.name})
                  </span>
                </div>
              </label>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBulkAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-lg shadow-amber-400/20 hover:scale-105 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  Xác Nhận Thêm Hàng Loạt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Chỉnh Sửa Tên & Thông Tin Thành Viên */}
      {editingPlayer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black text-white">
                  Chỉnh Sửa Thành Viên
                </h3>
              </div>
              <button
                onClick={() => setEditingPlayer(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlayerEdit} className="space-y-4 my-5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Họ và Tên Vận Động Viên:
                </label>
                <input
                  type="text"
                  required
                  value={editPlayerName}
                  onChange={(e) => setEditPlayerName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Giới tính:
                  </label>
                  <select
                    value={editPlayerGender}
                    onChange={(e) => setEditPlayerGender(e.target.value as Gender)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="male">♂ Nam</option>
                    <option value="female">♀ Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Trình độ (DUPR):
                  </label>
                  <input
                    type="text"
                    value={editPlayerRating}
                    onChange={(e) => setEditPlayerRating(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Tuổi Vận Động Viên:
                </label>
                <input
                  type="number"
                  min="10"
                  max="85"
                  value={editPlayerAge}
                  onChange={(e) => setEditPlayerAge(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Số Điện Thoại:
                  </label>
                  <input
                    type="text"
                    value={editPlayerPhone}
                    onChange={(e) => setEditPlayerPhone(e.target.value)}
                    placeholder="VD: 0903 123 456"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Vai Trò Quyền Hạn:
                  </label>
                  <select
                    value={editPlayerRole}
                    onChange={(e) => setEditPlayerRole(e.target.value as UserRole)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="member">Thành viên</option>
                    <option value="sub_admin">Phó quản trị</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Mật Khẩu Đăng Nhập (Admin có thể cấp lại / đổi mật khẩu):
                </label>
                <input
                  type="text"
                  value={editPlayerPassword}
                  onChange={(e) => setEditPlayerPassword(e.target.value)}
                  placeholder="Mật khẩu của thành viên..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPlayer(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-lg shadow-amber-400/20 hover:scale-105 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Lưu Tên & Thông Tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tạo Ngày Đánh Mới (Create New Session Date) */}
      {showCreateSessionModal && (
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
                onClick={() => setShowCreateSessionModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSessionSubmit} className="space-y-4 my-5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Tên Buổi Đánh:
                </label>
                <input
                  type="text"
                  required
                  value={newSName}
                  onChange={(e) => setNewSName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-medium outline-none focus:border-lime-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Chọn Ngày Thi Đấu:
                </label>
                <input
                  type="date"
                  required
                  value={newSDate}
                  onChange={(e) => setNewSDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-bold outline-none focus:border-lime-500 mb-2"
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
                    onClick={() => setQuickDate(2)}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    +2 Ngày
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
                    value={newSTime}
                    onChange={(e) => setNewSTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-lime-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Số Sân Hoạt Động:
                  </label>
                  <select
                    value={newSCourts}
                    onChange={(e) => setNewSCourts(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-lime-500 cursor-pointer"
                  >
                    <option value={1}>1 Sân</option>
                    <option value={2}>2 Sân (Chuẩn 16 người)</option>
                    <option value={3}>3 Sân</option>
                    <option value={4}>4 Sân</option>
                  </select>
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
                    value={newSLocation}
                    onChange={(e) => setNewSLocation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-lime-500"
                  />
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
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-lime-500"
                  />
                </div>
              </div>

              {/* Headcount Preset */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Khởi Tạo Số Thành Viên Ban Đầu:
                </label>
                <select
                  value={newSHeadcountPreset}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setNewSHeadcountPreset(val);
                    if (val === '0') setNewSAutoSchedule(true);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-lime-500 cursor-pointer"
                >
                  <option value="0">⭐ Để trống danh sách (Mở cho thành viên tự đăng ký)</option>
                  <option value="16">Chọn sẵn 16 VĐV (8 Nam + 8 Nữ)</option>
                  <option value="12">Chọn sẵn 12 VĐV (6 Nam + 6 Nữ)</option>
                  <option value="20">Chọn sẵn 20 VĐV (10 Nam + 10 Nữ)</option>
                </select>
              </div>

              {/* Auto Schedule Settings */}
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-lime-500/30 space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSAutoSchedule}
                    onChange={(e) => setNewSAutoSchedule(e.target.checked)}
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

                {newSAutoSchedule && (
                  <div className="pt-2 border-t border-slate-700/60">
                    <label className="text-[11px] font-bold text-lime-300 block mb-1">
                      Số VĐV cần để tự động kích hoạt chia lịch:
                    </label>
                    <select
                      value={newSRequiredCount}
                      onChange={(e) => setNewSRequiredCount(Number(e.target.value))}
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
                      checked={newSAllowMen}
                      onChange={(e) => setNewSAllowMen(e.target.checked)}
                      className="w-4 h-4 rounded text-lime-500 bg-slate-800"
                    />
                    <span className="font-bold text-blue-300">Nam Nam</span>
                  </label>

                  <label className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={newSAllowWomen}
                      onChange={(e) => setNewSAllowWomen(e.target.checked)}
                      className="w-4 h-4 rounded text-lime-500 bg-slate-800"
                    />
                    <span className="font-bold text-pink-300">Nữ Nữ</span>
                  </label>

                  <label className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={newSAllowMixed}
                      onChange={(e) => setNewSAllowMixed(e.target.checked)}
                      className="w-4 h-4 rounded text-lime-500 bg-slate-800"
                    />
                    <span className="font-bold text-lime-300">Nam Nữ</span>
                  </label>
                </div>
              </div>

              {/* Strict Rest & DUPR Balance Algorithm Guarantee */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-lime-500/30 text-xs space-y-1.5">
                <span className="font-black text-lime-400 block">
                  🎯 Tiêu Chuẩn Thuật Toán Chia Trận Cún Cưng:
                </span>
                <p className="text-[11px] text-slate-300">
                  • <strong>Số trận bằng nhau:</strong> Mỗi thành viên được xếp đúng {newSTarget} trận.
                </p>
                <p className="text-[11px] text-slate-300">
                  • <strong>Nghỉ 1 trận xen kẽ:</strong> Hạn chế tối đa thi đấu 2 trận liên tiếp.
                </p>
                <p className="text-[11px] text-slate-300">
                  • <strong>Cân bằng DUPR:</strong> Cân đối điểm DUPR giữa 2 đội tránh chênh lệch trình độ.
                </p>
                <p className="text-[11px] text-slate-300">
                  • <strong>Đa dạng đối thủ:</strong> Hạn chế trùng lặp bạn cặp và đối thủ đã thi đấu.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateSessionModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-lime-400 to-emerald-500 text-slate-950 shadow-lg shadow-lime-500/20 hover:scale-105 transition cursor-pointer"
                >
                  Xác Nhận Tạo Ngày Đánh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PWA Install Guide Modal */}
      <PWAInstallModal
        isOpen={showPublishInstallModal}
        onClose={() => setShowPublishInstallModal(false)}
      />
    </div>
  );
};
