import React, { useState, useRef } from 'react';
import {
  User,
  Upload,
  Camera,
  X,
  CheckCircle,
  Save,
  Sparkles,
  Calendar,
  Clock,
  Users,
  Lock,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Palette,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { usePickleball } from '../context/PickleballContext';
import { Player, Gender } from '../types/pickleball';
import { UserAvatar } from './UserAvatar';

export interface MemberProfileModalProps {
  mode: 'register' | 'edit_self' | 'login';
  onClose: () => void;
  onGoToRegistrationSchedule?: () => void;
}

// 🐶 Cún Cưng Pickleball mascot avatars
const PUPPY_AVATARS = [
  {
    name: 'Shiba Băng Đô',
    url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200&auto=format&fit=crop&q=80',
    emoji: '🐕',
  },
  {
    name: 'Corgi Pickleball',
    url: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=200&auto=format&fit=crop&q=80',
    emoji: '🐶',
  },
  {
    name: 'Poodle Dễ Thương',
    url: 'https://images.unsplash.com/photo-1591769225440-811ad7d6eab2?w=200&auto=format&fit=crop&q=80',
    emoji: '🐩',
  },
  {
    name: 'Golden Năng Động',
    url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&auto=format&fit=crop&q=80',
    emoji: '🦮',
  },
  {
    name: 'Husky Tốc Độ',
    url: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=200&auto=format&fit=crop&q=80',
    emoji: '🐾',
  },
  {
    name: 'Pug Hài Hước',
    url: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=200&auto=format&fit=crop&q=80',
    emoji: '🐶',
  },
];

// Athletic Human VĐV Avatars
const ATHLETIC_AVATARS = [
  {
    name: 'VĐV Nữ 1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  {
    name: 'VĐV Nam 1',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  },
  {
    name: 'VĐV Nam 2',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  {
    name: 'VĐV Nữ 2',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  },
  {
    name: 'VĐV Nam 3',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  },
  {
    name: 'VĐV Nữ 3',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  },
];

const GRADIENT_PRESETS = [
  { name: 'Xanh Lá - Emerald', class: 'from-lime-400 to-emerald-600' },
  { name: 'Hồng - Ruby', class: 'from-pink-500 to-rose-600' },
  { name: 'Xanh Biển - Cyan', class: 'from-blue-500 to-cyan-600' },
  { name: 'Tím - Indigo', class: 'from-purple-500 to-indigo-600' },
  { name: 'Cam - Amber', class: 'from-amber-500 to-orange-600' },
];

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  mode: initialMode,
  onClose,
  onGoToRegistrationSchedule,
}) => {
  const {
    currentUser,
    setCurrentUserId,
    addPlayer,
    updatePlayer,
    authenticatePlayer,
    sessions,
    toggleAttendance,
  } = usePickleball();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'register' | 'login' | 'edit_self'>(
    initialMode === 'edit_self' ? 'edit_self' : initialMode === 'login' ? 'login' : 'register'
  );

  const isEdit = activeTab === 'edit_self';

  // Form states
  const [name, setName] = useState(isEdit ? currentUser.name : '');
  const [age, setAge] = useState<number | string>(isEdit ? currentUser.age ?? 28 : 26);
  const [gender, setGender] = useState<Gender>(isEdit ? currentUser.gender : 'male');
  const [rating, setRating] = useState(isEdit ? currentUser.rating ?? '3.5' : '3.5');
  const [phone, setPhone] = useState(isEdit ? currentUser.phone ?? '' : '');
  const [password, setPassword] = useState(isEdit ? currentUser.password ?? '123456' : '');
  const [showPassword, setShowPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>(isEdit ? currentUser.avatarUrl ?? '' : '');
  const [avatarColor, setAvatarColor] = useState<string>(
    isEdit ? currentUser.avatarColor ?? 'from-lime-400 to-emerald-600' : 'from-lime-400 to-emerald-600'
  );

  // Avatar picker tab
  const [avatarCategory, setAvatarCategory] = useState<'puppy' | 'human' | 'url' | 'color'>('puppy');
  const [customUrlInput, setCustomUrlInput] = useState('');

  // Login states
  const [loginQuery, setLoginQuery] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Feedback & steps
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'success_schedule'>('form');
  const [newlyCreatedPlayer, setNewlyCreatedPlayer] = useState<Player | null>(null);

  // Handle image upload from computer or phone camera
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg('Vui lòng chọn ảnh có kích thước dưới 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAvatarUrl(result);
        setErrorMsg(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    setAvatarUrl(customUrlInput.trim());
    setCustomUrlInput('');
  };

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên thành viên.');
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Vui lòng nhập mật khẩu đăng nhập (tối thiểu 4 ký tự).');
      return;
    }

    if (password.trim().length < 4) {
      setErrorMsg('Mật khẩu cần ít nhất 4 ký tự để đảm bảo bảo mật.');
      return;
    }

    const parsedAge = Number(age) || 28;

    if (isEdit) {
      const updated: Player = {
        ...currentUser,
        name: name.trim(),
        age: parsedAge,
        gender,
        rating: rating.trim(),
        phone: phone.trim() || undefined,
        password: password.trim(),
        avatarUrl: avatarUrl || undefined,
        avatarColor: avatarColor,
      };
      updatePlayer(updated);
      setSuccessMsg('✓ Đã lưu hồ sơ cá nhân và mật khẩu thành công!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      // Register New Member
      const newP = addPlayer({
        name: name.trim(),
        age: parsedAge,
        gender,
        rating: rating.trim(),
        phone: phone.trim() || undefined,
        password: password.trim(),
        avatarUrl: avatarUrl || undefined,
        avatarColor: avatarColor,
        role: 'member',
        active: true,
      });

      setCurrentUserId(newP.id);
      setNewlyCreatedPlayer(newP);
      setStep('success_schedule');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!loginQuery.trim()) {
      setErrorMsg('Vui lòng nhập Tên hoặc Số điện thoại đăng ký.');
      return;
    }
    if (!loginPassword.trim()) {
      setErrorMsg('Vui lòng nhập mật khẩu.');
      return;
    }

    const result = authenticatePlayer(loginQuery, loginPassword);
    if (!result.success) {
      setErrorMsg(result.message);
    } else {
      setSuccessMsg(result.message);
      setTimeout(() => {
        onClose();
      }, 900);
    }
  };

  // Upcoming sessions available for registration
  const upcomingSessions = sessions.filter(
    (s) => s.status === 'open_registration' || s.status === 'in_progress'
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        {/* Glow Accent Header */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-lime-400 via-emerald-500 to-amber-400" />

        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-lime-400/20 to-emerald-500/20 text-lime-400 flex items-center justify-center font-black">
              {isEdit ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                {isEdit
                  ? 'Chỉnh Sửa Hồ Sơ & Mật Khẩu'
                  : activeTab === 'login'
                  ? 'Đăng Nhập Thành Viên CLB'
                  : 'Đăng Ký Thành Viên CLB 🐶'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isEdit
                  ? 'Cập nhật ảnh đại diện, DUPR và mật khẩu cá nhân'
                  : 'Tham gia CLB Pickleball Cún Cưng & đăng ký các buổi thi đấu'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector for Non-Edit: Đăng Ký vs Đăng Nhập */}
        {!isEdit && (
          <div className="grid grid-cols-2 gap-2 mt-4 p-1 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-lime-400 to-emerald-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Đăng Ký Thành Viên Mới
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-lime-400 to-emerald-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Đã Có Tài Khoản (Đăng Nhập)
            </button>
          </div>
        )}

        {/* Error / Success Feedback */}
        {errorMsg && (
          <div className="mt-3.5 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold animate-in fade-in">
            ⚠️ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mt-3.5 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-in fade-in">
            {successMsg}
          </div>
        )}

        {/* TAB: LOGIN FORM */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4 my-5 animate-in fade-in">
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
              💡 Mẹo: Thành viên mẫu có mật khẩu mặc định là <code className="text-lime-400 font-bold">123456</code>.
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Tên Vận Động Viên hoặc Số Điện Thoại:
              </label>
              <input
                type="text"
                required
                placeholder="VD: Nguyễn Tuấn hoặc 0903 123 456"
                value={loginQuery}
                onChange={(e) => setLoginQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold outline-none focus:border-lime-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Mật Khẩu Đăng Nhập:
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  placeholder="Nhập mật khẩu của bạn..."
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white font-bold outline-none focus:border-lime-400"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-lime-400 to-emerald-500 text-slate-950 shadow-lg shadow-lime-500/20 hover:from-lime-300 hover:to-emerald-400 transition flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                Đăng Nhập Ngay
              </button>
            </div>
          </form>
        ) : step === 'form' ? (
          /* TAB: REGISTRATION OR EDIT PROFILE FORM */
          <form onSubmit={handleSubmitProfile} className="space-y-4 my-4 animate-in fade-in">
            {/* AVATAR ADJUSTMENT PANEL (ĐIỀU CHỈNH AVATAR) */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-lime-400 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  Điều Chỉnh Ảnh Đại Diện (Avatar):
                </span>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="text-[11px] font-bold text-rose-400 hover:underline cursor-pointer"
                  >
                    Xóa ảnh (dùng chữ cái)
                  </button>
                )}
              </div>

              {/* Live Preview & Upload Action */}
              <div className="flex items-center gap-4">
                <div className="relative group shrink-0">
                  <UserAvatar
                    player={{
                      name: name || 'VĐV',
                      avatarUrl,
                      avatarColor,
                      gender,
                    }}
                    size="xl"
                    className="ring-4 ring-lime-400/30"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-lime-400 text-slate-950 flex items-center justify-center shadow-lg hover:bg-lime-300 transition cursor-pointer"
                    title="Chụp ảnh hoặc tải từ máy"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-lime-500/20 text-lime-300 border border-lime-500/40 hover:bg-lime-500/30 transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Tải từ máy / Chụp ảnh
                    </button>
                    <span className="text-[11px] text-slate-400">hoặc chọn bộ avatar bên dưới:</span>
                  </div>
                </div>
              </div>

              {/* Avatar Preset Tabs */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-2.5 text-xs no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setAvatarCategory('puppy')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                      avatarCategory === 'puppy'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    🐶 Mascot Cún Cưng (6)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarCategory('human')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                      avatarCategory === 'human'
                        ? 'bg-emerald-400 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    🏃 VĐV Thể Thao (6)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarCategory('url')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                      avatarCategory === 'url'
                        ? 'bg-cyan-400 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    🔗 Dán Link Ảnh
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarCategory('color')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                      avatarCategory === 'color'
                        ? 'bg-pink-400 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    🎨 Màu Nền Chữ
                  </button>
                </div>

                {/* Subcategory 1: Mascot Cún Cưng */}
                {avatarCategory === 'puppy' && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {PUPPY_AVATARS.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatarUrl(item.url)}
                        className={`group p-1.5 rounded-xl border flex flex-col items-center gap-1 transition hover:scale-105 cursor-pointer ${
                          avatarUrl === item.url
                            ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700"
                        />
                        <span className="text-[10px] text-slate-300 truncate w-full text-center">
                          {item.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Subcategory 2: Human Athletes */}
                {avatarCategory === 'human' && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {ATHLETIC_AVATARS.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatarUrl(item.url)}
                        className={`group p-1.5 rounded-xl border flex flex-col items-center gap-1 transition hover:scale-105 cursor-pointer ${
                          avatarUrl === item.url
                            ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400/50'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700"
                        />
                        <span className="text-[10px] text-slate-300 truncate w-full text-center">
                          {item.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Subcategory 3: Paste Direct URL */}
                {avatarCategory === 'url' && (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Dán đường dẫn ảnh: https://...jpg / png"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCustomUrl}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 cursor-pointer"
                    >
                      Áp Dụng
                    </button>
                  </div>
                )}

                {/* Subcategory 4: Gradient Color Picker */}
                {avatarCategory === 'color' && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {GRADIENT_PRESETS.map((g, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAvatarColor(g.class);
                          setAvatarUrl('');
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          avatarColor === g.class && !avatarUrl
                            ? 'border-lime-400 ring-2 ring-lime-400/50 text-white bg-slate-800'
                            : 'border-slate-800 text-slate-300 hover:bg-slate-850'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${g.class}`} />
                        <span>{g.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* INPUTS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Họ và tên */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Họ và Tên Vận Động Viên: <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Nguyễn Tuấn Anh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold outline-none focus:border-lime-400"
                />
              </div>

              {/* MẬT KHẨU (PASSWORD) - YÊU CẦU MỚI */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-lime-400" />
                    Mật Khẩu Đăng Nhập: <span className="text-rose-400">*</span>
                  </span>
                  <span className="text-[10px] text-slate-400">(Tối thiểu 4 ký tự)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Nhập mật khẩu..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white font-bold outline-none focus:border-lime-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Tuổi */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Tuổi (Năm sinh):
                </label>
                <input
                  type="number"
                  min="10"
                  max="80"
                  placeholder="VD: 28"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold outline-none focus:border-lime-400"
                />
              </div>

              {/* Giới tính */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Giới Tính:
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold outline-none focus:border-lime-400 cursor-pointer"
                >
                  <option value="male">♂ Nam</option>
                  <option value="female">♀ Nữ</option>
                </select>
              </div>

              {/* Trình độ DUPR */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Trình Độ Pickleball (DUPR):
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold outline-none focus:border-lime-400 cursor-pointer"
                >
                  <option value="2.5">2.5 (Mới tập chơi)</option>
                  <option value="3.0">3.0 (Cơ bản vững)</option>
                  <option value="3.5">3.5 (Phong trào tốt - Dinking chuẩn)</option>
                  <option value="4.0">4.0 (Nâng cao - Chiến thuật tốt)</option>
                  <option value="4.5">4.5 (Chuyên nghiệp)</option>
                  <option value="5.0">5.0 (VĐV đỉnh cao)</option>
                </select>
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Số Điện Thoại / Zalo:
                </label>
                <input
                  type="text"
                  placeholder="VD: 0903 123 456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-lime-400"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3.5 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-lime-400 to-emerald-500 text-slate-950 shadow-lg shadow-lime-500/20 hover:from-lime-300 hover:to-emerald-400 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {isEdit ? 'Lưu Hồ Sơ Của Tôi' : 'Hoàn Tất Đăng Ký & Xem Lịch'}
              </button>
            </div>
          </form>
        ) : (
          /* STEP 2: REGISTRATION SUCCESS - UPCOMING SCHEDULE */
          <div className="space-y-4 my-4 animate-in fade-in">
            <div className="text-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
              <CheckCircle className="w-10 h-10 text-lime-400 mx-auto mb-2" />
              <h4 className="text-base font-black text-white">
                Chào mừng {newlyCreatedPlayer?.name} gia nhập CLB Cún Cưng!
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Tài khoản thành viên đã kích hoạt (Mật khẩu: <span className="text-lime-400 font-bold">{password}</span>). Bạn hãy chọn lịch sắp tới để tham gia ngay:
              </p>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {upcomingSessions.map((session) => {
                const isRegistered = newlyCreatedPlayer
                  ? session.registeredPlayerIds.includes(newlyCreatedPlayer.id)
                  : false;
                const regCount = session.registeredPlayerIds.length;

                return (
                  <div
                    key={session.id}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                      isRegistered
                        ? 'bg-lime-500/15 border-lime-400/50'
                        : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-extrabold text-white">
                          {session.name}
                        </span>
                        {isRegistered && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-lime-400 text-slate-950">
                            Đã Đăng Ký
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-lime-400" /> {session.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" /> {session.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-amber-400" /> {regCount} VĐV
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (newlyCreatedPlayer) {
                          toggleAttendance(session.id, newlyCreatedPlayer.id);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                        isRegistered
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-lime-500 hover:bg-lime-400 text-slate-950 font-black'
                      }`}
                    >
                      {isRegistered ? 'Hủy' : 'Đăng Ký'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onGoToRegistrationSchedule) onGoToRegistrationSchedule();
                }}
                className="w-full py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-lime-400 to-emerald-500 text-slate-950 shadow-lg shadow-lime-500/20 hover:scale-[1.02] transition cursor-pointer"
              >
                Vào Xem Lịch Sinh Hoạt & Bảng Điểm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
