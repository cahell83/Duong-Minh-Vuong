import React, { useState } from 'react';
import {
  Sparkles,
  Trophy,
  Flame,
  Award,
  Calendar,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePickleball } from '../context/PickleballContext';
import { PlayerStats } from '../types/pickleball';
import { UserAvatar } from './UserAvatar';

export const HallOfFame: React.FC = () => {
  const { hallOfFame } = usePickleball();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  const currentPodium =
    selectedPeriod === 'week'
      ? hallOfFame.weeklyMVP
      : selectedPeriod === 'month'
      ? hallOfFame.monthlyMVP
      : hallOfFame.yearlyMVP;

  const triggerCelebration = () => {
    try {
      // Multi-stage confetti blast
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#a3e635', '#38bdf8', '#ec4899', '#ffffff'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 250);
    } catch {
      // ignore
    }
  };

  const renderPlayerCard = (
    stat: PlayerStats | undefined,
    rank: 1 | 2 | 3,
    podiumHeight: string
  ) => {
    if (!stat || !stat.name) {
      return (
        <div className="flex-1 flex flex-col items-center justify-end">
          <div className="text-xs text-slate-500 mb-2">Đang cập nhật</div>
          <div className={`w-full ${podiumHeight} bg-slate-800/40 rounded-t-3xl border border-slate-700/40`} />
        </div>
      );
    }

    const isRank1 = rank === 1;

    return (
      <div className={`flex-1 flex flex-col items-center justify-end ${isRank1 ? 'z-10' : ''}`}>
        {/* Player Avatar & Crown */}
        <div className="flex flex-col items-center mb-3 group transition transform hover:-translate-y-1">
          {isRank1 && (
            <div className="text-3xl sm:text-4xl -mb-2 animate-bounce">👑</div>
          )}
          <div className="relative">
            <div
              className={`rounded-full shadow-2xl ring-4 ${
                isRank1
                  ? 'ring-amber-400 shadow-amber-500/50'
                  : rank === 2
                  ? 'ring-slate-300 shadow-slate-400/30'
                  : 'ring-amber-700 shadow-amber-700/30'
              }`}
            >
              <UserAvatar player={stat} size={isRank1 ? 'xl' : 'lg'} />
            </div>
            <div
              className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-lg border-2 border-slate-900 ${
                isRank1
                  ? 'bg-amber-400 text-slate-950'
                  : rank === 2
                  ? 'bg-slate-300 text-slate-950'
                  : 'bg-amber-700 text-white'
              }`}
            >
              {rank}
            </div>
          </div>

          <h4 className="mt-2 text-sm sm:text-base font-extrabold text-white text-center truncate max-w-[140px]">
            {stat.name}
          </h4>

          <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-0.5">
            <span
              className={`font-semibold ${
                stat.gender === 'female' ? 'text-pink-400' : 'text-blue-400'
              }`}
            >
              {stat.gender === 'female' ? '♀ Nữ' : '♂ Nam'}
            </span>
            <span className="font-bold text-lime-400">{stat.points} Điểm</span>
            <span>•</span>
            <span className="font-mono text-amber-300 font-bold">
              DUPR {stat.rating ? parseFloat(stat.rating).toFixed(3) : '3.500'}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 mt-0.5">
            {stat.wins} Thắng / {stat.matchesPlayed} Trận ({stat.winRate}%)
          </div>
        </div>

        {/* Podium Block */}
        <div
          className={`w-full ${podiumHeight} rounded-t-3xl p-4 flex flex-col items-center justify-between border-t-2 border-x shadow-2xl relative overflow-hidden ${
            isRank1
              ? 'bg-gradient-to-b from-amber-500/30 via-slate-900 to-slate-950 border-amber-400/80'
              : rank === 2
              ? 'bg-gradient-to-b from-slate-600/30 via-slate-900 to-slate-950 border-slate-400/60'
              : 'bg-gradient-to-b from-amber-800/30 via-slate-900 to-slate-950 border-amber-700/60'
          }`}
        >
          <div className="text-center">
            <div
              className={`text-2xl sm:text-3xl font-black ${
                isRank1
                  ? 'text-amber-400'
                  : rank === 2
                  ? 'text-slate-200'
                  : 'text-amber-600'
              }`}
            >
              #{rank}
            </div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              {isRank1 ? 'QUÁN QUÂN' : rank === 2 ? 'Á QUÂN 1' : 'Á QUÂN 2'}
            </div>
          </div>

          {isRank1 && (
            <div className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black flex items-center gap-1 animate-pulse">
              <Sparkles className="w-3 h-3" /> MVP VÔ ĐỊCH
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Trophy className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Bảng Vàng Danh Dự CLB
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Vinh Danh Người Đạt Điểm Cao Nhất
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Tôn vinh những tay vợt xuất sắc nhất với số điểm thắng cao nhất, phong độ bền bỉ và tinh thần thể thao dink bóng tuyệt vời!
            </p>
          </div>

          {/* Confetti Celebration Button */}
          <button
            onClick={triggerCelebration}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-slate-950 animate-spin" />
            Bắn Pháo Hoa Vinh Danh!
          </button>
        </div>

        {/* Period Selector Tabs */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-800/80 border border-slate-700">
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                selectedPeriod === 'week'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Vinh Danh Trong Tuần
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                selectedPeriod === 'month'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Vinh Danh Trong Tháng
            </button>
            <button
              onClick={() => setSelectedPeriod('year')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                selectedPeriod === 'year'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black shadow-lg shadow-amber-400/20'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Vua Sân Đấu Cả Năm 2026
            </button>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Kỳ vinh danh: <strong className="text-amber-400">{currentPodium.periodLabel}</strong>
          </div>
        </div>
      </div>

      {/* The 3D Championship Podium */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
        <div className="text-center mb-6">
          <h3 className="text-lg font-black text-white">
            BỤC VINH QUANG: {currentPodium.periodLabel.toUpperCase()}
          </h3>
          <p className="text-xs text-slate-400">
            Top 3 tay vợt dẫn đầu bảng xếp hạng điểm số CLB
          </p>
        </div>

        {/* Podium Display (Rank 2 on Left, Rank 1 in Middle, Rank 3 on Right) */}
        <div className="flex items-end justify-center max-w-3xl mx-auto pt-6 gap-3 sm:gap-6 min-h-[380px]">
          {/* Rank 2 (Silver) */}
          {renderPlayerCard(currentPodium.top2, 2, 'h-40 sm:h-48')}

          {/* Rank 1 (Gold - Highest) */}
          {renderPlayerCard(currentPodium.top1, 1, 'h-52 sm:h-64')}

          {/* Rank 3 (Bronze) */}
          {renderPlayerCard(currentPodium.top3, 3, 'h-32 sm:h-36')}
        </div>
      </div>

      {/* Top 10 Honors Honor Roll */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <h3 className="font-extrabold text-white text-base flex items-center gap-2">
            <Zap className="w-4 h-4 text-lime-400" />
            Top 10 Vận Động Viên Xuất Sắc Nhất Kỳ Này
          </h3>
          <span className="text-xs text-slate-400">
            Cập nhật theo tỉ số các trận đấu đã ghi sổ
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentPodium.allTop.map((stat, idx) => {
            const rank = idx + 1;
            return (
              <div
                key={stat.playerId}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 transition hover:bg-slate-800 hover:border-slate-600"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                      rank === 1
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : rank === 2
                        ? 'bg-slate-300 text-slate-950 font-bold'
                        : rank === 3
                        ? 'bg-amber-700 text-white font-bold'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {rank}
                  </span>
                  <UserAvatar player={stat} size="xs" />
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{stat.name}</span>
                      <span
                        className={`text-[10px] ${
                          stat.gender === 'female' ? 'text-pink-400' : 'text-blue-400'
                        }`}
                      >
                        {stat.gender === 'female' ? '♀' : '♂'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {stat.wins} Thắng / {stat.matchesPlayed} Trận • DUPR {stat.rating || '3.5'}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-lime-400">
                    {stat.points} Điểm
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {stat.winRate}% Thắng
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
