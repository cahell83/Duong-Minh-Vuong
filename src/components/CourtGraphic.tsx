import React from 'react';
import { Player, MatchType } from '../types/pickleball';

interface CourtGraphicProps {
  courtNumber: number;
  matchType: MatchType;
  teamAPlayer1: Player | undefined;
  teamAPlayer2: Player | undefined;
  teamBPlayer1: Player | undefined;
  teamBPlayer2: Player | undefined;
  scoreA?: number;
  scoreB?: number;
  status: 'playing' | 'completed' | 'upcoming';
  highlightPlayerId?: string;
  onQuickScoreClick?: () => void;
  canEditScore?: boolean;
}

export const CourtGraphic: React.FC<CourtGraphicProps> = ({
  courtNumber,
  matchType,
  teamAPlayer1,
  teamAPlayer2,
  teamBPlayer1,
  teamBPlayer2,
  scoreA = 0,
  scoreB = 0,
  status,
  highlightPlayerId,
  onQuickScoreClick,
  canEditScore = false,
}) => {
  const getCategoryBadge = (type: MatchType) => {
    switch (type) {
      case 'men_doubles':
        return {
          label: '4 NAM (Đôi Nam)',
          color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        };
      case 'women_doubles':
        return {
          label: '4 NỮ (Đôi Nữ)',
          color: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
        };
      case 'mixed_doubles':
        return {
          label: 'NAM NỮ (Đôi Nam Nữ)',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        };
    }
  };

  const badge = getCategoryBadge(matchType);

  const renderPlayerBadge = (player: Player | undefined, isRight = false) => {
    if (!player) {
      return (
        <div className="bg-slate-800/80 rounded-lg p-2 text-center text-xs text-slate-500">
          Chưa chọn
        </div>
      );
    }

    const isHighlighted = highlightPlayerId === player.id;

    return (
      <div
        className={`flex items-center gap-2 p-2 rounded-xl transition backdrop-blur-md shadow-md border ${
          isHighlighted
            ? 'bg-lime-400 text-slate-950 border-white ring-2 ring-lime-400 font-bold scale-105'
            : 'bg-slate-900/90 text-white border-slate-700/80 hover:border-slate-500'
        } ${isRight ? 'flex-row-reverse text-right' : ''}`}
      >
        <div
          className={`w-7 h-7 rounded-full bg-gradient-to-tr ${
            player.avatarColor || 'from-lime-400 to-emerald-600'
          } flex items-center justify-center text-xs font-black text-white shrink-0 shadow`}
        >
          {player.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold truncate flex items-center gap-1">
            <span className="truncate">{player.name}</span>
            <span
              className={`text-[10px] font-semibold ${
                player.gender === 'female' ? 'text-pink-400' : 'text-blue-400'
              }`}
            >
              {player.gender === 'female' ? '♀' : '♂'}
            </span>
          </div>
          <div
            className={`text-[10px] ${
              isHighlighted ? 'text-slate-800' : 'text-slate-400'
            }`}
          >
            DUPR {player.rating || '3.5'}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition hover:border-slate-700 flex flex-col">
      {/* Court Header Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-800/90 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-lime-500/20 text-lime-400 border border-lime-500/30 flex items-center justify-center font-black text-sm">
            #{courtNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-white text-base tracking-tight">
                Sân Thi Đấu Số {courtNumber}
              </h4>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}
              >
                {badge.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Quy tắc chuẩn: Nghỉ 1 trận xen kẽ • 11 điểm
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status === 'playing' && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Đang đấu
            </span>
          )}
          {status === 'completed' && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              ✓ Hoàn thành
            </span>
          )}
          {status === 'upcoming' && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-300">
              Sắp diễn ra
            </span>
          )}
        </div>
      </div>

      {/* Realistic Pickleball Court Visualizer */}
      <div className="relative p-4 sm:p-5 flex-1 flex flex-col justify-center">
        {/* The Court Container */}
        <div className="relative w-full aspect-[2.1/1] min-h-[220px] rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-900 border-4 border-white/90 shadow-inner flex overflow-hidden">
          {/* Left Baseline Out-of-bounds pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />

          {/* TEAM A HALF (LEFT SIDE) */}
          <div className="relative flex-1 flex flex-col border-r-2 border-white/80 bg-blue-950/40 p-2 sm:p-3 justify-between">
            {/* NVZ Kitchen Zone for Team A */}
            <div className="absolute right-0 top-0 bottom-0 w-[28%] bg-amber-600/30 border-l border-white/60 pointer-events-none flex items-center justify-center">
              <span className="text-[9px] sm:text-[10px] font-bold text-amber-200/60 uppercase tracking-widest rotate-90 select-none">
                Kitchen (NVZ)
              </span>
            </div>

            {/* Team A Label & Score */}
            <div className="z-10 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-slate-900/80 px-2 py-0.5 rounded border border-emerald-500/30">
                Đội A
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white px-2.5 py-0.5 rounded-lg bg-slate-900/90 border border-slate-700 shadow-md">
                {scoreA}
              </div>
            </div>

            {/* Players Placement in Team A */}
            <div className="z-10 grid grid-cols-1 sm:grid-cols-2 gap-2 my-auto max-w-[70%]">
              {renderPlayerBadge(teamAPlayer1)}
              {renderPlayerBadge(teamAPlayer2)}
            </div>

            <div className="z-10 text-[10px] text-slate-400">
              Sân đón trả & giao bóng Đội A
            </div>
          </div>

          {/* CENTER NET (LƯỚI TRUNG TÂM) */}
          <div className="relative w-4 bg-slate-950 flex flex-col items-center justify-between py-1 z-20 shadow-2xl">
            <div className="w-3 h-3 rounded-full bg-slate-400 border border-white" />
            <div className="flex-1 w-0.5 bg-gradient-to-b from-white via-slate-300 to-white opacity-80" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter rotate-90 my-auto select-none">
              LƯỚI
            </span>
            <div className="flex-1 w-0.5 bg-gradient-to-b from-white via-slate-300 to-white opacity-80" />
            <div className="w-3 h-3 rounded-full bg-slate-400 border border-white" />
          </div>

          {/* TEAM B HALF (RIGHT SIDE) */}
          <div className="relative flex-1 flex flex-col border-l-2 border-white/80 bg-blue-950/40 p-2 sm:p-3 justify-between">
            {/* NVZ Kitchen Zone for Team B */}
            <div className="absolute left-0 top-0 bottom-0 w-[28%] bg-amber-600/30 border-r border-white/60 pointer-events-none flex items-center justify-center">
              <span className="text-[9px] sm:text-[10px] font-bold text-amber-200/60 uppercase tracking-widest -rotate-90 select-none">
                Kitchen (NVZ)
              </span>
            </div>

            {/* Team B Label & Score */}
            <div className="z-10 flex items-center justify-between flex-row-reverse">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 bg-slate-900/80 px-2 py-0.5 rounded border border-cyan-500/30">
                Đội B
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white px-2.5 py-0.5 rounded-lg bg-slate-900/90 border border-slate-700 shadow-md">
                {scoreB}
              </div>
            </div>

            {/* Players Placement in Team B */}
            <div className="z-10 grid grid-cols-1 sm:grid-cols-2 gap-2 my-auto max-w-[70%] ml-auto">
              {renderPlayerBadge(teamBPlayer1, true)}
              {renderPlayerBadge(teamBPlayer2, true)}
            </div>

            <div className="z-10 text-[10px] text-slate-400 text-right">
              Sân đón trả & giao bóng Đội B
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Footer */}
      <div className="px-5 py-3 bg-slate-800/60 border-t border-slate-800 flex items-center justify-between">
        <div className="text-xs text-slate-400">
          {scoreA > scoreB ? (
            <span className="text-emerald-400 font-semibold">
              Đội A đang dẫn trước +{scoreA - scoreB}
            </span>
          ) : scoreB > scoreA ? (
            <span className="text-cyan-400 font-semibold">
              Đội B đang dẫn trước +{scoreB - scoreA}
            </span>
          ) : (
            <span>Tỉ số hòa: {scoreA} - {scoreB}</span>
          )}
        </div>

        {canEditScore && onQuickScoreClick && (
          <button
            onClick={onQuickScoreClick}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-lime-500 hover:bg-lime-400 text-slate-950 transition shadow-md shadow-lime-500/20 flex items-center gap-1.5"
          >
            ✏️ Ghi sổ điểm
          </button>
        )}
      </div>
    </div>
  );
};
