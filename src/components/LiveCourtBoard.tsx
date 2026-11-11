import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Coffee,
  ArrowRight,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { usePickleball } from '../context/PickleballContext';
import { Match, Player } from '../types/pickleball';
import { CourtGraphic } from './CourtGraphic';
import { ScoreModal } from './ScoreModal';

export const LiveCourtBoard: React.FC = () => {
  const {
    activeSession,
    players,
    currentUser,
    isAdminOrSubAdmin,
  } = usePickleball();

  const [selectedMatchForScore, setSelectedMatchForScore] = useState<Match | null>(null);
  const [onlyMyMatches, setOnlyMyMatches] = useState<boolean>(false);

  if (!activeSession) {
    return (
      <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800 p-8">
        <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">Chưa có buổi đánh nào được chọn</h3>
        <p className="text-sm text-slate-400">Vui lòng chọn hoặc tạo một buổi đánh từ danh sách.</p>
      </div>
    );
  }

  // Find currently active round
  const matches = activeSession.matches || [];
  const playingMatches = matches.filter((m) => m.status === 'playing');
  const completedMatches = matches.filter((m) => m.status === 'completed');
  const upcomingMatches = matches.filter((m) => m.status === 'upcoming');

  // Determine current round
  let currentRoundIndex = 1;
  if (playingMatches.length > 0) {
    currentRoundIndex = playingMatches[0].roundIndex;
  } else if (upcomingMatches.length > 0) {
    currentRoundIndex = upcomingMatches[0].roundIndex;
  } else if (completedMatches.length > 0) {
    currentRoundIndex = Math.max(...completedMatches.map((m) => m.roundIndex));
  }

  // Current round matches
  const currentRoundMatches = matches.filter((m) => m.roundIndex === currentRoundIndex);

  // Next round matches
  const nextRoundMatches = matches.filter((m) => m.roundIndex === currentRoundIndex + 1);

  // Identify players currently on court
  const activePlayerIdsOnCourt = new Set<string>();
  currentRoundMatches.forEach((m) => {
    activePlayerIdsOnCourt.add(m.teamA.player1Id);
    activePlayerIdsOnCourt.add(m.teamA.player2Id);
    activePlayerIdsOnCourt.add(m.teamB.player1Id);
    activePlayerIdsOnCourt.add(m.teamB.player2Id);
  });

  // Registered players for this session
  const registeredPlayers = players.filter((p) =>
    activeSession.registeredPlayerIds.includes(p.id)
  );

  // Resting players this round (Strict Rest Rule!)
  const restingPlayers = registeredPlayers.filter(
    (p) => !activePlayerIdsOnCourt.has(p.id)
  );

  const getPlayer = (id: string): Player | undefined => players.find((p) => p.id === id);

  const isUserInMatch = (m: Match) => {
    return (
      m.teamA.player1Id === currentUser.id ||
      m.teamA.player2Id === currentUser.id ||
      m.teamB.player1Id === currentUser.id ||
      m.teamB.player2Id === currentUser.id
    );
  };

  const displayedMatches = onlyMyMatches
    ? currentRoundMatches.filter(isUserInMatch)
    : currentRoundMatches;

  return (
    <div className="space-y-6">
      {/* Session Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 border border-slate-700/80 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Trực Tiếp Thời Gian Thực
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-lime-400/20 text-lime-300 border border-lime-400/30">
                Nghỉ Xen Kẽ 1-1 Chuẩn
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {activeSession.courtCount} Sân • {activeSession.targetMatchesPerPlayer} trận/người
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {activeSession.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-lime-400" />
                <span>{activeSession.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>{activeSession.time} • Ngày {activeSession.date}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700/80 shrink-0">
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Vòng đấu</div>
              <div className="text-2xl font-black text-lime-400">
                {currentRoundIndex}
                <span className="text-xs text-slate-500 font-normal">
                  /{matches.length > 0 ? Math.max(...matches.map((m) => m.roundIndex)) : 14}
                </span>
              </div>
            </div>
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Đã xong</div>
              <div className="text-2xl font-black text-white">
                {completedMatches.length}
                <span className="text-xs text-slate-500 font-normal">/{matches.length}</span>
              </div>
            </div>
            <div className="text-center px-3">
              <div className="text-xs text-slate-400 font-medium">VĐV đăng ký</div>
              <div className="text-2xl font-black text-cyan-400">
                {registeredPlayers.length}
              </div>
            </div>
          </div>
        </div>

        {/* Member Filter Bar */}
        <div className="mt-6 pt-4 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnlyMyMatches(!onlyMyMatches)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                onlyMyMatches
                  ? 'bg-lime-400 text-slate-950 border-white shadow-md shadow-lime-400/20'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              {onlyMyMatches
                ? `Đang lọc: Trận của ${currentUser.name}`
                : `Lọc: Chỉ xem trận của tôi (${currentUser.name})`}
            </button>
            {activePlayerIdsOnCourt.has(currentUser.id) ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-lime-500/20 text-lime-300 border border-lime-500/30">
                🏸 Bạn đang thi đấu Vòng {currentRoundIndex}!
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ☕ Bạn đang nghỉ ngơi ở Vòng {currentRoundIndex}
              </span>
            )}
          </div>

          <div className="text-xs text-slate-400">
            {isAdminOrSubAdmin ? (
              <span className="text-lime-400 font-medium">
                Quản trị viên có quyền bấm "Ghi sổ điểm" để nhập kết quả trực tiếp
              </span>
            ) : (
              <span>Chế độ xem trực tiếp cho Thành viên (Cập nhật tự động)</span>
            )}
          </div>
        </div>
      </div>

      {/* Live Courts Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <span>🏟️ Các Sân Đang Diễn Ra (Vòng {currentRoundIndex})</span>
            </h2>
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700">
              {displayedMatches.length} Trận
            </span>
          </div>

          <div className="text-xs text-slate-400 hidden sm:block">
            Mỗi trận tối đa 11 điểm • Cách biệt 2 điểm
          </div>
        </div>

        {displayedMatches.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800">
            <p className="text-slate-300 font-medium">
              Không có trận nào của bạn trong vòng đấu này.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Bạn đang ở lượt nghỉ (1 trận đánh - 1 trận nghỉ). Hãy sẵn sàng cho vòng tiếp theo!
            </p>
            <button
              onClick={() => setOnlyMyMatches(false)}
              className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-lime-400"
            >
              Xem tất cả các sân
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayedMatches.map((match) => (
              <CourtGraphic
                key={match.id}
                courtNumber={match.courtNumber}
                matchType={match.type}
                teamAPlayer1={getPlayer(match.teamA.player1Id)}
                teamAPlayer2={getPlayer(match.teamA.player2Id)}
                teamBPlayer1={getPlayer(match.teamB.player1Id)}
                teamBPlayer2={getPlayer(match.teamB.player2Id)}
                scoreA={match.teamA.score}
                scoreB={match.teamB.score}
                status={match.status}
                highlightPlayerId={currentUser.id}
                canEditScore={isAdminOrSubAdmin}
                onQuickScoreClick={() => setSelectedMatchForScore(match)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Two Column Grid: Resting Bench & Next Up Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Resting Players (Ghế Nghỉ - 100% Tuân thủ nghỉ 1 trận xen kẽ) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Coffee className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">
                  Hàng Ghế Nghỉ (Vòng {currentRoundIndex})
                </h3>
                <p className="text-[11px] text-slate-400">
                  {restingPlayers.length} VĐV đang nghỉ (Sẽ thi đấu ở Vòng {currentRoundIndex + 1})
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Quy tắc chuẩn 1-1
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {restingPlayers.map((player) => {
              const isCurrent = player.id === currentUser.id;
              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border transition ${
                    isCurrent
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-200 font-bold'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full bg-gradient-to-tr ${
                      player.avatarColor || 'from-lime-400 to-emerald-600'
                    } flex items-center justify-center text-xs font-black text-white shrink-0`}
                  >
                    {player.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate flex items-center gap-1">
                      <span className="truncate">{player.name}</span>
                      <span
                        className={`text-[10px] ${
                          player.gender === 'female' ? 'text-pink-400' : 'text-blue-400'
                        }`}
                      >
                        {player.gender === 'female' ? '♀' : '♂'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Vào sân: Vòng {currentRoundIndex + 1}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-lime-400 shrink-0" />
            <span>
              Cam kết: Không ai phải đánh 2 trận liên tục. Mọi người đều có đủ thời gian hồi phục thể lực!
            </span>
          </div>
        </div>

        {/* Next Round Preview (Vòng Tiếp Theo) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <ArrowRight className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">
                  Chuẩn Bị Lên Sân (Vòng {currentRoundIndex + 1})
                </h3>
                <p className="text-[11px] text-slate-400">
                  Lịch đấu tiếp theo dành cho nhóm đang nghỉ ngơi
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg">
              Sắp bắt đầu
            </span>
          </div>

          {nextRoundMatches.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Đây là vòng đấu cuối cùng hoặc chưa tạo vòng tiếp theo.
            </div>
          ) : (
            <div className="space-y-3">
              {nextRoundMatches.map((m) => {
                const pA1 = getPlayer(m.teamA.player1Id);
                const pA2 = getPlayer(m.teamA.player2Id);
                const pB1 = getPlayer(m.teamB.player1Id);
                const pB2 = getPlayer(m.teamB.player2Id);

                return (
                  <div
                    key={m.id}
                    className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-black px-2 py-1 rounded-lg bg-slate-700 text-lime-400">
                        Sân {m.courtNumber}
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold uppercase">
                        {m.type === 'men_doubles'
                          ? '4 Nam'
                          : m.type === 'women_doubles'
                          ? '4 Nữ'
                          : 'Nam Nữ'}
                      </span>
                    </div>

                    <div className="text-xs text-center flex-1 truncate">
                      <span className="font-bold text-white">
                        {pA1?.name} & {pA2?.name}
                      </span>
                      <span className="text-slate-400 mx-2 font-black">VS</span>
                      <span className="font-bold text-white">
                        {pB1?.name} & {pB2?.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Sẵn sàng khởi động trước khi vào sân</span>
            <Sparkles className="w-4 h-4 text-lime-400" />
          </div>
        </div>
      </div>

      {/* Score Modal if opened */}
      {selectedMatchForScore && (
        <ScoreModal
          match={selectedMatchForScore}
          onClose={() => setSelectedMatchForScore(null)}
        />
      )}
    </div>
  );
};
