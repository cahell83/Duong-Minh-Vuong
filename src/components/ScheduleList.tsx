import React, { useState } from 'react';
import {
  Calendar,
  Filter,
  CheckCircle,
  Clock,
  RotateCw,
  Trophy,
  ShieldCheck,
  Edit3,
  Search,
  ArrowDown,
  Flame,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { usePickleball } from '../context/PickleballContext';
import { Match, MatchType, Player } from '../types/pickleball';
import { ScoreModal } from './ScoreModal';
import { UserAvatar } from './UserAvatar';

export const ScheduleList: React.FC = () => {
  const {
    activeSession,
    players,
    currentUser,
    isAdminOrSubAdmin,
    generateScheduleForSession,
  } = usePickleball();

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [roundFilter, setRoundFilter] = useState<number | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<MatchType | 'all'>('all');
  const [searchPlayer, setSearchPlayer] = useState<string>('');
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [regenNotice, setRegenNotice] = useState<string | null>(null);
  const [showCompletedSection, setShowCompletedSection] = useState<boolean>(true);

  if (!activeSession) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-3xl border border-slate-800">
        Chưa có buổi đánh nào được kích hoạt.
      </div>
    );
  }

  const matches = activeSession.matches || [];
  const getPlayer = (id: string): Player | undefined => players.find((p) => p.id === id);

  const totalRounds = matches.length > 0 ? Math.max(...matches.map((m) => m.roundIndex)) : 0;
  const completedCount = matches.filter((m) => m.status === 'completed').length;
  const unfinishedCount = matches.length - completedCount;

  const handleRegenerate = () => {
    if (!isAdminOrSubAdmin) return;
    if (
      completedCount > 0 &&
      !window.confirm(
        'Đã có một số trận có kết quả điểm. Tạo lại lịch sẽ xóa toàn bộ điểm đã ghi của buổi này. Bạn có chắc chắn muốn tạo lại không?'
      )
    ) {
      return;
    }
    setIsRegenerating(true);
    const res = generateScheduleForSession(activeSession.id);
    setIsRegenerating(false);
    setRegenNotice(res.message);
    setTimeout(() => setRegenNotice(null), 5000);
  };

  // Filter matches based on criteria
  const filteredMatches = matches.filter((m) => {
    if (roundFilter !== 'all' && m.roundIndex !== roundFilter) return false;
    if (typeFilter !== 'all' && m.type !== typeFilter) return false;
    if (searchPlayer.trim()) {
      const q = searchPlayer.toLowerCase();
      const pA1 = getPlayer(m.teamA.player1Id)?.name.toLowerCase() || '';
      const pA2 = getPlayer(m.teamA.player2Id)?.name.toLowerCase() || '';
      const pB1 = getPlayer(m.teamB.player1Id)?.name.toLowerCase() || '';
      const pB2 = getPlayer(m.teamB.player2Id)?.name.toLowerCase() || '';
      if (!pA1.includes(q) && !pA2.includes(q) && !pB1.includes(q) && !pB2.includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Separate into:
  // 1. UNFINISHED (playing / upcoming) -> Prioritized at the top
  // 2. COMPLETED -> Placed at the bottom automatically
  const unfinishedMatches = filteredMatches
    .filter((m) => m.status !== 'completed')
    .sort((a, b) => {
      // Playing matches first, then upcoming
      if (a.status === 'playing' && b.status !== 'playing') return -1;
      if (b.status === 'playing' && a.status !== 'playing') return 1;
      if (a.roundIndex !== b.roundIndex) return a.roundIndex - b.roundIndex;
      return a.courtNumber - b.courtNumber;
    });

  const completedMatches = filteredMatches
    .filter((m) => m.status === 'completed')
    .sort((a, b) => {
      // Latest completed at bottom or reverse chronological
      return a.roundIndex - b.roundIndex || a.courtNumber - b.courtNumber;
    });

  // Render a match card
  const renderMatchRow = (m: Match, isCompleted: boolean) => {
    const pA1 = getPlayer(m.teamA.player1Id);
    const pA2 = getPlayer(m.teamA.player2Id);
    const pB1 = getPlayer(m.teamB.player1Id);
    const pB2 = getPlayer(m.teamB.player2Id);

    const isUserPlaying =
      pA1?.id === currentUser.id ||
      pA2?.id === currentUser.id ||
      pB1?.id === currentUser.id ||
      pB2?.id === currentUser.id;

    const scoreA = m.teamA.score ?? '-';
    const scoreB = m.teamB.score ?? '-';

    return (
      <div
        key={m.id}
        className={`p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 transition ${
          isUserPlaying ? 'bg-lime-500/10 font-bold border-l-4 border-lime-400' : 'hover:bg-slate-800/40'
        } ${isCompleted ? 'opacity-90' : ''}`}
      >
        {/* Court & Round Info */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="flex flex-col">
            <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-slate-800 text-lime-400 border border-slate-700 shrink-0 text-center">
              SÂN {m.courtNumber}
            </span>
            <span className="text-[10px] text-slate-400 text-center mt-0.5 font-bold">
              Vòng {m.roundIndex}
            </span>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              m.type === 'men_doubles'
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                : m.type === 'women_doubles'
                ? 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}
          >
            {m.type === 'men_doubles'
              ? '4 Nam'
              : m.type === 'women_doubles'
              ? '4 Nữ'
              : 'Nam Nữ'}
          </span>

          {m.status === 'playing' && (
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Đang đấu
            </span>
          )}

          {isUserPlaying && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-lime-400 text-slate-950">
              Trận của bạn
            </span>
          )}
        </div>

        {/* Matchup & Scores */}
        <div className="flex-1 flex items-center justify-center gap-3 sm:gap-6 w-full">
          {/* Team A */}
          <div
            className={`flex-1 text-right p-2 rounded-xl transition ${
              m.winner === 'teamA' ? 'bg-emerald-500/10 font-black' : ''
            }`}
          >
            <div className="text-xs sm:text-sm font-bold text-white flex items-center justify-end gap-1.5">
              {m.winner === 'teamA' && (
                <Trophy className="w-3.5 h-3.5 text-amber-400 inline shrink-0" />
              )}
              <span>{pA1?.name || 'VĐV 1'}</span>
              {pA1 && <UserAvatar player={pA1} size="xs" />}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-300 flex items-center justify-end gap-1.5 mt-0.5">
              <span>{pA2?.name || 'VĐV 2'}</span>
              {pA2 && <UserAvatar player={pA2} size="xs" />}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-end gap-1.5 flex-wrap">
              {m.winner === 'teamA' && (
                <span className="text-emerald-400 font-bold">+1 điểm BXH</span>
              )}
              {m.duprDetails && (
                <span
                  className={`px-1.5 py-0.2 rounded font-mono font-bold text-[9px] ${
                    m.duprDetails.deltaA > 0
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {m.duprDetails.deltaA > 0 ? `+${m.duprDetails.deltaA.toFixed(3)}` : m.duprDetails.deltaA.toFixed(3)} DUPR
                </span>
              )}
              {!m.winner && !m.duprDetails && <span>Đội A</span>}
            </div>
          </div>

          {/* Score Display */}
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl bg-slate-950 border border-slate-700 shadow-inner">
            <span
              className={`text-lg sm:text-xl font-black ${
                m.winner === 'teamA' ? 'text-emerald-400' : 'text-white'
              }`}
            >
              {scoreA}
            </span>
            <span className="text-xs font-black text-slate-500">:</span>
            <span
              className={`text-lg sm:text-xl font-black ${
                m.winner === 'teamB' ? 'text-cyan-400' : 'text-white'
              }`}
            >
              {scoreB}
            </span>
          </div>

          {/* Team B */}
          <div
            className={`flex-1 text-left p-2 rounded-xl transition ${
              m.winner === 'teamB' ? 'bg-cyan-500/10 font-black' : ''
            }`}
          >
            <div className="text-xs sm:text-sm font-bold text-white flex items-center justify-start gap-1.5">
              {pB1 && <UserAvatar player={pB1} size="xs" />}
              <span>{pB1?.name || 'VĐV 1'}</span>
              {m.winner === 'teamB' && (
                <Trophy className="w-3.5 h-3.5 text-amber-400 inline shrink-0" />
              )}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-300 flex items-center justify-start gap-1.5 mt-0.5">
              {pB2 && <UserAvatar player={pB2} size="xs" />}
              <span>{pB2?.name || 'VĐV 2'}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-start gap-1.5 flex-wrap">
              {m.winner === 'teamB' && (
                <span className="text-cyan-400 font-bold">+1 điểm BXH</span>
              )}
              {m.duprDetails && (
                <span
                  className={`px-1.5 py-0.2 rounded font-mono font-bold text-[9px] ${
                    m.duprDetails.deltaB > 0
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {m.duprDetails.deltaB > 0 ? `+${m.duprDetails.deltaB.toFixed(3)}` : m.duprDetails.deltaB.toFixed(3)} DUPR
                </span>
              )}
              {!m.winner && !m.duprDetails && <span>Đội B</span>}
            </div>
          </div>
        </div>

        {/* Status / Action Button */}
        <div className="w-full md:w-auto flex items-center justify-end gap-2">
          {isAdminOrSubAdmin ? (
            <button
              onClick={() => setSelectedMatch(m)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer ${
                isCompleted
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  : 'bg-lime-500 hover:bg-lime-400 text-slate-950 font-black shadow-md shadow-lime-500/20'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isCompleted ? 'Sửa điểm' : 'Ghi sổ điểm'}
            </button>
          ) : (
            <div className="text-xs text-slate-400">
              {isCompleted ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Đã xong
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Chờ đấu
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-5 h-5 text-lime-400" />
              <h2 className="text-xl font-black text-white">
                Lịch Thi Đấu & Ghi Sổ Điểm
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {matches.length} Trận
              </span>
            </div>
            <p className="text-xs text-slate-400">
              <strong className="text-lime-400">Quy tắc tự động:</strong> Các trận chưa đánh luôn hiển thị ở trên cùng. Sau khi nhập điểm, trận đấu tự động chuyển xuống dưới.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300">
                Chưa đánh: <strong className="text-amber-400">{unfinishedCount}</strong> trận
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300">
                Đã đánh xong: <strong className="text-emerald-400">{completedCount}</strong> trận
              </span>
            </div>

            {isAdminOrSubAdmin && (
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-lime-500 to-emerald-600 hover:from-lime-400 hover:to-emerald-500 text-slate-950 transition shadow-md shadow-lime-500/20 cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                Tạo lại lịch ngẫu nhiên
              </button>
            )}
          </div>
        </div>

        {regenNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold animate-in fade-in">
            {regenNotice}
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Round Selector */}
          <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-2 rounded-xl border border-slate-700/60">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={roundFilter}
              onChange={(e) =>
                setRoundFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="bg-transparent text-xs font-semibold text-slate-200 outline-none w-full cursor-pointer"
            >
              <option value="all" className="bg-slate-900">
                Tất cả các vòng ({totalRounds} vòng)
              </option>
              {Array.from({ length: totalRounds }, (_, i) => i + 1).map((r) => (
                <option key={r} value={r} className="bg-slate-900">
                  Vòng {r}
                </option>
              ))}
            </select>
          </div>

          {/* Type Selector */}
          <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-2 rounded-xl border border-slate-700/60">
            <span className="text-xs text-slate-400 font-bold shrink-0">Loại:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as MatchType | 'all')}
              className="bg-transparent text-xs font-semibold text-slate-200 outline-none w-full cursor-pointer"
            >
              <option value="all" className="bg-slate-900">
                Tất cả thể loại (4 Nam, 4 Nữ, Nam Nữ)
              </option>
              <option value="men_doubles" className="bg-slate-900">
                4 Nam (Đôi Nam)
              </option>
              <option value="women_doubles" className="bg-slate-900">
                4 Nữ (Đôi Nữ)
              </option>
              <option value="mixed_doubles" className="bg-slate-900">
                Nam Nữ (Đôi Nam Nữ)
              </option>
            </select>
          </div>

          {/* Search Player Input */}
          <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-2 rounded-xl border border-slate-700/60">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Tìm theo tên VĐV..."
              value={searchPlayer}
              onChange={(e) => setSearchPlayer(e.target.value)}
              className="bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none w-full"
            />
          </div>
        </div>
      </div>

      {/* SECTION 1: CÁC TRẬN CHƯA ĐÁNH / ĐANG ĐẤU (ƯU TIÊN HIỂN THỊ LÊN TRƯỚC) */}
      <div className="bg-slate-900/95 border-2 border-lime-500/40 rounded-3xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-lime-500/20 text-lime-400 flex items-center justify-center font-black">
              🏸
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-base">
                  Các Trận Đang & Chưa Thi Đấu (Ưu Tiên Lên Trước)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-lime-400 text-slate-950">
                  {unfinishedMatches.length} Trận
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Bấm "Ghi sổ điểm" để nhập tỉ số $\rightarrow$ Trận đấu sẽ tự động chuyển xuống phần đã xong bên dưới!
              </p>
            </div>
          </div>
        </div>

        {unfinishedMatches.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white mb-1">
              Đã hoàn thành toàn bộ các trận đấu!
            </h4>
            <p className="text-xs text-slate-400">
              Tất cả các trận đã được ghi sổ điểm và xếp ở danh sách bên dưới.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {unfinishedMatches.map((m) => renderMatchRow(m, false))}
          </div>
        )}
      </div>

      {/* SECTION 2: CÁC TRẬN ĐÃ ĐÁNH XONG & ĐÃ GHI SỔ ĐIỂM (TỰ ĐỘNG XUỐNG DƯỚI) */}
      {completedMatches.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div
            onClick={() => setShowCompletedSection(!showCompletedSection)}
            className="flex items-center justify-between px-6 py-4 bg-slate-800/60 border-b border-slate-800 cursor-pointer hover:bg-slate-800/80 transition select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                ✓
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-white text-sm sm:text-base">
                    Các Trận Đã Đánh Xong & Đã Ghi Điểm (Tự Động Xuống Dưới)
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {completedMatches.length} Trận
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Đã cộng 1 điểm cho đội thắng, 0 điểm cho đội thua vào Bảng xếp hạng
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{showCompletedSection ? 'Thu gọn' : 'Mở rộng'}</span>
              {showCompletedSection ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </div>

          {showCompletedSection && (
            <div className="divide-y divide-slate-800/60">
              {completedMatches.map((m) => renderMatchRow(m, true))}
            </div>
          )}
        </div>
      )}

      {/* Score Modal if selected */}
      {selectedMatch && (
        <ScoreModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  );
};
