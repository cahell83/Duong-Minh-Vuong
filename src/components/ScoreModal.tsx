import React, { useState, useMemo } from 'react';
import { X, Trophy, CheckCircle, RotateCcw, TrendingUp, TrendingDown, Zap, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Match, Player } from '../types/pickleball';
import { usePickleball } from '../context/PickleballContext';
import { calculateMatchDupr, parseDupr } from '../utils/dupr';

interface ScoreModalProps {
  match: Match;
  onClose: () => void;
}

export const ScoreModal: React.FC<ScoreModalProps> = ({ match, onClose }) => {
  const { players, recordMatchScore, resetMatchScore } = usePickleball();

  const [scoreA, setScoreA] = useState<number>(match.teamA.score ?? 0);
  const [scoreB, setScoreB] = useState<number>(match.teamB.score ?? 0);
  const [markCompleted, setMarkCompleted] = useState<boolean>(true);

  const getPlayer = (id: string): Player | undefined => players.find((p) => p.id === id);

  const pA1 = getPlayer(match.teamA.player1Id);
  const pA2 = getPlayer(match.teamA.player2Id);
  const pB1 = getPlayer(match.teamB.player1Id);
  const pB2 = getPlayer(match.teamB.player2Id);

  // Live DUPR impact simulation based on entered score
  const duprImpact = useMemo(() => {
    return calculateMatchDupr(match.teamA, match.teamB, scoreA, scoreB, players);
  }, [match.teamA, match.teamB, scoreA, scoreB, players]);

  const isUpsetWin = useMemo(() => {
    if (scoreA > scoreB && duprImpact.teamBRatingBefore > duprImpact.teamARatingBefore + 0.05) {
      return { team: 'A', gap: (duprImpact.teamBRatingBefore - duprImpact.teamARatingBefore).toFixed(3) };
    }
    if (scoreB > scoreA && duprImpact.teamARatingBefore > duprImpact.teamBRatingBefore + 0.05) {
      return { team: 'B', gap: (duprImpact.teamARatingBefore - duprImpact.teamBRatingBefore).toFixed(3) };
    }
    return null;
  }, [scoreA, scoreB, duprImpact]);

  const handleSave = () => {
    recordMatchScore(match.id, scoreA, scoreB, markCompleted);

    if (markCompleted && (scoreA >= 11 || scoreB >= 11) && Math.abs(scoreA - scoreB) >= 2) {
      // Fire victory confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#a3e635', '#10b981', '#38bdf8', '#fbbf24'],
        });
      } catch {
        // ignore
      }
    }
    onClose();
  };

  const handleReset = () => {
    resetMatchScore(match.id);
    onClose();
  };

  const applyPreset = (sA: number, sB: number) => {
    setScoreA(sA);
    setScoreB(sB);
    setMarkCompleted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Glow Accent Header */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-lime-400 via-emerald-500 to-cyan-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-400" />
              <h3 className="text-base sm:text-lg font-black text-white">
                Ghi Sổ Điểm: Sân {match.courtNumber} - Vòng {match.roundIndex}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Quy tắc DUPR: <span className="text-lime-400 font-bold">Thắng được cộng DUPR, Thua bị trừ DUPR</span>. Thắng người trình cao hơn được thưởng điểm lớn!
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Matchup Teams & DUPR Rating Overview */}
        <div className="my-4 grid grid-cols-2 gap-3">
          {/* Team A Box */}
          <div
            className={`p-3.5 rounded-2xl border transition ${
              scoreA > scoreB
                ? 'bg-emerald-950/40 border-emerald-500/50 ring-1 ring-emerald-500/30'
                : 'bg-slate-800/60 border-slate-700/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase text-emerald-400 tracking-wider">
                Đội A
              </span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                TB: {duprImpact.teamARatingBefore.toFixed(3)}
              </span>
            </div>

            <div className="space-y-1 mb-3">
              <div className="text-xs font-bold text-white truncate flex items-center justify-between">
                <span className="truncate">{pA1?.name || 'VĐV 1'}</span>
                <span className="text-[10px] text-lime-400 font-mono shrink-0 ml-1">
                  {parseDupr(pA1?.rating).toFixed(3)}
                </span>
              </div>
              <div className="text-xs font-bold text-white truncate flex items-center justify-between">
                <span className="truncate">{pA2?.name || 'VĐV 2'}</span>
                <span className="text-[10px] text-lime-400 font-mono shrink-0 ml-1">
                  {parseDupr(pA2?.rating).toFixed(3)}
                </span>
              </div>
            </div>

            {/* Score input with +/- */}
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setScoreA(Math.max(0, scoreA - 1))}
                className="w-8 h-8 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-black text-lg transition flex items-center justify-center cursor-pointer"
              >
                -
              </button>
              <input
                type="number"
                min="0"
                max="99"
                value={scoreA}
                onChange={(e) => setScoreA(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-14 h-11 text-center text-xl font-black bg-slate-900 border-2 border-emerald-500/50 rounded-xl text-white outline-none focus:border-emerald-400"
              />
              <button
                type="button"
                onClick={() => setScoreA(scoreA + 1)}
                className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg transition flex items-center justify-center cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Team B Box */}
          <div
            className={`p-3.5 rounded-2xl border transition ${
              scoreB > scoreA
                ? 'bg-cyan-950/40 border-cyan-500/50 ring-1 ring-cyan-500/30'
                : 'bg-slate-800/60 border-slate-700/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase text-cyan-400 tracking-wider">
                Đội B
              </span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                TB: {duprImpact.teamBRatingBefore.toFixed(3)}
              </span>
            </div>

            <div className="space-y-1 mb-3">
              <div className="text-xs font-bold text-white truncate flex items-center justify-between">
                <span className="truncate">{pB1?.name || 'VĐV 1'}</span>
                <span className="text-[10px] text-cyan-400 font-mono shrink-0 ml-1">
                  {parseDupr(pB1?.rating).toFixed(3)}
                </span>
              </div>
              <div className="text-xs font-bold text-white truncate flex items-center justify-between">
                <span className="truncate">{pB2?.name || 'VĐV 2'}</span>
                <span className="text-[10px] text-cyan-400 font-mono shrink-0 ml-1">
                  {parseDupr(pB2?.rating).toFixed(3)}
                </span>
              </div>
            </div>

            {/* Score input with +/- */}
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setScoreB(Math.max(0, scoreB - 1))}
                className="w-8 h-8 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-black text-lg transition flex items-center justify-center cursor-pointer"
              >
                -
              </button>
              <input
                type="number"
                min="0"
                max="99"
                value={scoreB}
                onChange={(e) => setScoreB(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-14 h-11 text-center text-xl font-black bg-slate-900 border-2 border-cyan-500/50 rounded-xl text-white outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={() => setScoreB(scoreB + 1)}
                className="w-8 h-8 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-lg transition flex items-center justify-center cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* DYNAMIC DUPR RATING IMPACT PREVIEW (DỰ ĐOÁN BIẾN ĐỘNG DUPR) */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-white flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-lime-400" />
              Biến Động Điểm DUPR Trận Này:
            </span>
            <span className="text-[10px] text-slate-400">
              Kỳ vọng thắng: Đội A {Math.round(duprImpact.expectedA * 100)}% • Đội B {Math.round(duprImpact.expectedB * 100)}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center pt-1">
            <div
              className={`p-2 rounded-xl border text-xs ${
                scoreA > scoreB
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : scoreA < scoreB
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-[10px] font-bold uppercase text-slate-400">Đội A</div>
              <div className="text-sm font-black flex items-center justify-center gap-1 mt-0.5">
                {duprImpact.deltaTeamA > 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>+{duprImpact.deltaTeamA.toFixed(3)} DUPR</span>
                  </>
                ) : duprImpact.deltaTeamA < 0 ? (
                  <>
                    <TrendingDown className="w-4 h-4 text-rose-400" />
                    <span>{duprImpact.deltaTeamA.toFixed(3)} DUPR</span>
                  </>
                ) : (
                  <span>0.000 DUPR</span>
                )}
              </div>
            </div>

            <div
              className={`p-2 rounded-xl border text-xs ${
                scoreB > scoreA
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                  : scoreB < scoreA
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-[10px] font-bold uppercase text-slate-400">Đội B</div>
              <div className="text-sm font-black flex items-center justify-center gap-1 mt-0.5">
                {duprImpact.deltaTeamB > 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    <span>+{duprImpact.deltaTeamB.toFixed(3)} DUPR</span>
                  </>
                ) : duprImpact.deltaTeamB < 0 ? (
                  <>
                    <TrendingDown className="w-4 h-4 text-rose-400" />
                    <span>{duprImpact.deltaTeamB.toFixed(3)} DUPR</span>
                  </>
                ) : (
                  <span>0.000 DUPR</span>
                )}
              </div>
            </div>
          </div>

          {/* UPSET WIN HIGHLIGHT BANNER */}
          {isUpsetWin && (
            <div className="mt-1.5 p-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
              <Trophy className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>
                🔥 Chiến thắng Upset: Đội {isUpsetWin.team} có DUPR thấp hơn nhưng đã giành chiến thắng ({scoreA} - {scoreB}), được thưởng điểm DUPR cộng vượt trội!
              </span>
            </div>
          )}
        </div>

        {/* Quick Presets for standard Pickleball Scores */}
        <div className="mb-4">
          <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
            Tỉ số kết thúc nhanh phổ biến (Chạm 11 hoặc 15):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              [11, 9],
              [11, 8],
              [11, 7],
              [11, 4],
              [11, 2],
              [9, 11],
              [8, 11],
              [7, 11],
              [15, 13],
            ].map(([a, b]) => (
              <button
                key={`${a}-${b}`}
                type="button"
                onClick={() => applyPreset(a, b)}
                className="px-2 py-0.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
              >
                {a} - {b}
              </button>
            ))}
          </div>
        </div>

        {/* Mark Completed Checkbox */}
        <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={markCompleted}
            onChange={(e) => setMarkCompleted(e.target.checked)}
            className="w-4 h-4 rounded text-lime-500 focus:ring-lime-500 bg-slate-900 border-slate-700 cursor-pointer"
          />
          <div className="text-xs text-slate-300">
            <span className="font-bold text-white">Xác nhận hoàn thành trận & cập nhật điểm DUPR</span>
            <p className="text-[10px] text-slate-400">
              Hệ thống tự động cộng 1đ trên BXH và cập nhật điểm DUPR cá nhân của 4 vận động viên.
            </p>
          </div>
        </label>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
          {match.status === 'completed' ? (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Đặt lại trận đấu
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-lime-400 to-emerald-500 text-slate-950 shadow-lg shadow-lime-500/20 hover:from-lime-300 hover:to-emerald-400 transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              Lưu sổ điểm & DUPR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
