import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Medal,
  TrendingUp,
  Search,
  Calendar,
  Flame,
  Award,
} from 'lucide-react';
import { usePickleball } from '../context/PickleballContext';
import { PlayerStats } from '../types/pickleball';
import { UserAvatar } from './UserAvatar';

export const LeaderboardView: React.FC = () => {
  const {
    activeSession,
    currentUser,
    getStatsForSession,
    getStatsForFilter,
  } = usePickleball();

  const [periodType, setPeriodType] = useState<'session' | 'month' | 'year'>('session');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-11');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const rankings: PlayerStats[] = useMemo(() => {
    let list: PlayerStats[] = [];
    if (periodType === 'session') {
      list = activeSession ? getStatsForSession(activeSession.id) : [];
    } else if (periodType === 'month') {
      list = getStatsForFilter('month', selectedMonth);
    } else {
      list = getStatsForFilter('year', undefined, 2026);
    }
    return list;
  }, [periodType, selectedMonth, activeSession, getStatsForSession, getStatsForFilter]);

  const filteredRankings = useMemo(() => {
    return rankings.filter((r) => {
      if (genderFilter !== 'all' && r.gender !== genderFilter) return false;
      if (searchQuery.trim() && !r.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [rankings, genderFilter, searchQuery]);

  const renderRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 font-black flex items-center justify-center text-sm shadow-lg shadow-amber-400/30">
          🥇
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-950 font-black flex items-center justify-center text-sm shadow-md">
          🥈
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-700 to-amber-600 text-white font-black flex items-center justify-center text-sm shadow-md">
          🥉
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-xs">
        {rank}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-black text-white tracking-tight">
                Bảng Xếp Hạng CLB Pickleball
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Quy tắc tính chuẩn: <strong className="text-lime-400">Thắng 1 điểm, Thua 0 điểm</strong>. Xếp hạng phụ theo Hiệu số điểm (+/-) và Tổng điểm ghi.
            </p>
          </div>

          {/* Period Selector Tabs */}
          <div className="flex items-center p-1.5 rounded-2xl bg-slate-800/90 border border-slate-700">
            <button
              onClick={() => setPeriodType('session')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                periodType === 'session'
                  ? 'bg-lime-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Buổi Đang Đấu
            </button>
            <button
              onClick={() => setPeriodType('month')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                periodType === 'month'
                  ? 'bg-lime-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Theo Tháng
            </button>
            <button
              onClick={() => setPeriodType('year')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                periodType === 'year'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Tổng Kết Năm 2026
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {periodType === 'month' && (
              <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
                <Calendar className="w-4 h-4 text-lime-400" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-white font-bold outline-none cursor-pointer"
                >
                  <option value="2026-11" className="bg-slate-900">Tháng 11 / 2026 (Hiện tại)</option>
                  <option value="2026-10" className="bg-slate-900">Tháng 10 / 2026</option>
                  <option value="2026-09" className="bg-slate-900">Tháng 09 / 2026</option>
                </select>
              </div>
            )}

            {/* Gender Filter Buttons */}
            <div className="flex items-center p-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
              <button
                onClick={() => setGenderFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  genderFilter === 'all'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tất cả ({rankings.length})
              </button>
              <button
                onClick={() => setGenderFilter('male')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  genderFilter === 'male'
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ♂ Nam ({rankings.filter((r) => r.gender === 'male').length})
              </button>
              <button
                onClick={() => setGenderFilter('female')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  genderFilter === 'female'
                    ? 'bg-pink-600/30 text-pink-300 border border-pink-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ♀ Nữ ({rankings.filter((r) => r.gender === 'female').length})
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tên VĐV..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white outline-none w-full placeholder-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Top 3 Podium Highlights for the selected period */}
      {filteredRankings.length >= 3 && !searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Top 2 Silver */}
          <div className="bg-slate-900/90 border border-slate-700/60 rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden order-2 md:order-1">
            <div className="relative shrink-0">
              <UserAvatar player={filteredRankings[1]} size="lg" />
              <div className="absolute -bottom-1 -right-1 text-base">🥈</div>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Hạng 2 • Huy Chương Bạc
              </span>
              <h4 className="text-base font-extrabold text-white truncate">
                {filteredRankings[1].name}
              </h4>
              <div className="text-xs text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                <span className="text-lime-400 font-black">{filteredRankings[1].points} Điểm</span>
                <span>•</span>
                <span className="text-amber-300 font-mono font-bold">
                  DUPR {filteredRankings[1].rating ? parseFloat(filteredRankings[1].rating).toFixed(3) : '3.500'}
                </span>
                <span>•</span>
                <span>{filteredRankings[1].wins} Thắng / {filteredRankings[1].matchesPlayed} Trận</span>
              </div>
            </div>
          </div>

          {/* Top 1 Gold (Crown) */}
          <div className="bg-gradient-to-br from-amber-500/20 via-slate-900 to-amber-950/30 border-2 border-amber-500/60 rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden shadow-xl shadow-amber-500/10 order-1 md:order-2 scale-105 z-10">
            <div className="relative shrink-0">
              <UserAvatar player={filteredRankings[0]} size="xl" />
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl animate-bounce">👑</div>
              <div className="absolute -bottom-1 -right-1 text-lg">🥇</div>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-400" /> Hạng 1 • Dẫn Đầu Bảng
              </span>
              <h4 className="text-lg font-black text-white truncate">
                {filteredRankings[0].name}
              </h4>
              <div className="text-xs text-amber-200 mt-1 flex items-center gap-2 flex-wrap">
                <span className="text-amber-400 font-black text-sm">
                  {filteredRankings[0].points} Điểm
                </span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono font-bold border border-amber-400/30">
                  DUPR {filteredRankings[0].rating ? parseFloat(filteredRankings[0].rating).toFixed(3) : '3.500'}
                </span>
                <span>•</span>
                <span>{filteredRankings[0].winRate}% Thắng</span>
                <span>•</span>
                <span className="flex items-center text-orange-400 font-bold">
                  <Flame className="w-3.5 h-3.5" /> Chuỗi {filteredRankings[0].streak}
                </span>
              </div>
            </div>
          </div>

          {/* Top 3 Bronze */}
          <div className="bg-slate-900/90 border border-slate-700/60 rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden order-3">
            <div className="relative shrink-0">
              <UserAvatar player={filteredRankings[2]} size="lg" />
              <div className="absolute -bottom-1 -right-1 text-base">🥉</div>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase text-amber-600 tracking-wider">
                Hạng 3 • Huy Chương Đồng
              </span>
              <h4 className="text-base font-extrabold text-white truncate">
                {filteredRankings[2].name}
              </h4>
              <div className="text-xs text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                <span className="text-lime-400 font-black">{filteredRankings[2].points} Điểm</span>
                <span>•</span>
                <span className="text-amber-300 font-mono font-bold">
                  DUPR {filteredRankings[2].rating ? parseFloat(filteredRankings[2].rating).toFixed(3) : '3.500'}
                </span>
                <span>•</span>
                <span>{filteredRankings[2].wins} Thắng / {filteredRankings[2].matchesPlayed} Trận</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Leaderboard Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-[11px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-800">
                <th className="py-4 px-4 text-center w-16">Hạng</th>
                <th className="py-4 px-4">Vận Động Viên</th>
                <th className="py-4 px-3 text-center text-amber-300 font-black">DUPR Động</th>
                <th className="py-4 px-3 text-center">Giới Tính</th>
                <th className="py-4 px-4 text-center font-black text-lime-400">
                  Điểm (BXH)
                </th>
                <th className="py-4 px-3 text-center">Trận</th>
                <th className="py-4 px-4 text-center">Thắng - Thua</th>
                <th className="py-4 px-3 text-center">Tỉ Lệ Thắng</th>
                <th className="py-4 px-3 text-center">Ghi - Thủng</th>
                <th className="py-4 px-3 text-center">Hiệu Số</th>
                <th className="py-4 px-3 text-center">Chuỗi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredRankings.map((stat, idx) => {
                const rank = idx + 1;
                const isCurrentUser = stat.playerId === currentUser.id;

                return (
                  <tr
                    key={stat.playerId}
                    className={`transition ${
                      isCurrentUser
                        ? 'bg-lime-500/10 font-bold hover:bg-lime-500/20'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-4 text-center">{renderRankBadge(rank)}</td>

                    {/* Player Name & Avatar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar player={stat} size="sm" />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{stat.name}</span>
                            {isCurrentUser && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-lime-400 text-slate-950 font-black">
                                BẠN
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {stat.role === 'admin'
                              ? 'Quản trị viên'
                              : stat.role === 'sub_admin'
                              ? 'Phó quản trị'
                              : 'Thành viên'}{' '}
                            • DUPR {stat.rating || '3.5'}
                            {stat.age ? ` • ${stat.age} tuổi` : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* DUPR Rating & Delta */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-mono font-black text-amber-300 text-xs px-2 py-0.5 rounded-lg bg-amber-400/10 border border-amber-400/20">
                          {stat.rating ? parseFloat(stat.rating).toFixed(3) : '3.500'}
                        </span>
                        {stat.duprChange !== undefined && stat.duprChange !== 0 && (
                          <span
                            className={`text-[10px] font-mono font-bold mt-0.5 flex items-center gap-0.5 ${
                              stat.duprChange > 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {stat.duprChange > 0 ? `+${stat.duprChange.toFixed(3)}` : stat.duprChange.toFixed(3)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Gender */}
                    <td className="py-3 px-3 text-center">
                      {stat.gender === 'female' ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 font-semibold">
                          ♀ Nữ
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                          ♂ Nam
                        </span>
                      )}
                    </td>

                    {/* Points (Thắng 1đ, Thua 0đ) */}
                    <td className="py-3 px-4 text-center">
                      <span className="text-base font-black text-lime-400 px-3 py-1 rounded-xl bg-lime-500/10 border border-lime-500/20">
                        {stat.points} đ
                      </span>
                    </td>

                    {/* Matches Played */}
                    <td className="py-3 px-3 text-center text-slate-300 font-semibold">
                      {stat.matchesPlayed}
                    </td>

                    {/* Wins - Losses */}
                    <td className="py-3 px-4 text-center">
                      <span className="text-emerald-400 font-bold">{stat.wins}</span>
                      <span className="text-slate-500 mx-1">/</span>
                      <span className="text-rose-400 font-bold">{stat.losses}</span>
                    </td>

                    {/* Win Rate */}
                    <td className="py-3 px-3 text-center font-bold text-slate-200">
                      <div className="flex items-center justify-center gap-1">
                        <span>{stat.winRate}%</span>
                        {stat.winRate >= 60 && (
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                    </td>

                    {/* Scores For - Against */}
                    <td className="py-3 px-3 text-center text-slate-400">
                      <span className="text-white">{stat.scoreFor}</span> -{' '}
                      <span>{stat.scoreAgainst}</span>
                    </td>

                    {/* Point Diff */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`font-bold ${
                          stat.pointDiff > 0
                            ? 'text-emerald-400'
                            : stat.pointDiff < 0
                            ? 'text-rose-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {stat.pointDiff > 0 ? `+${stat.pointDiff}` : stat.pointDiff}
                      </span>
                    </td>

                    {/* Streak */}
                    <td className="py-3 px-3 text-center">
                      {stat.streak > 0 ? (
                        <span className="text-[11px] font-bold text-orange-400 flex items-center justify-center gap-0.5">
                          <Flame className="w-3.5 h-3.5" /> W{stat.streak}
                        </span>
                      ) : stat.streak < 0 ? (
                        <span className="text-[11px] font-bold text-slate-500">
                          L{Math.abs(stat.streak)}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
