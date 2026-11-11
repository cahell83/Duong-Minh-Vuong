import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Player,
  ClubSession,
  Match,
  MatchStatus,
  PlayerStats,
  HonorPodium,
  UserRole,
  MatchType,
} from '../types/pickleball';
import {
  INITIAL_PLAYERS,
  INITIAL_SESSIONS,
} from '../data/mockData';
import {
  generateSmartSchedule,
  calculatePlayerStats,
  sortRankings,
} from '../utils/scheduler';
import { calculateMatchDupr, parseDupr } from '../utils/dupr';

interface PickleballContextType {
  players: Player[];
  sessions: ClubSession[];
  activeSessionId: string;
  activeSession: ClubSession | undefined;
  currentUser: Player;
  setCurrentUserId: (id: string) => void;
  isAdmin: boolean;
  isAdminOrSubAdmin: boolean;
  setActiveSessionId: (id: string) => void;
  // Actions
  updateSession: (session: ClubSession) => void;
  createSession: (data: {
    name: string;
    date: string;
    time: string;
    location: string;
    courtCount: number;
    targetMatchesPerPlayer: number;
    strictAlternatingRest: boolean;
    registeredPlayerIds?: string[];
    autoScheduleWhenFull?: boolean;
    requiredPlayerCount?: number;
    allowedTypes?: MatchType[];
  }) => ClubSession;
  deleteSession: (sessionId: string) => void;
  generateScheduleForSession: (sessionId: string) => { success: boolean; message: string; warning?: string };
  recordMatchScore: (
    matchId: string,
    scoreA: number,
    scoreB: number,
    finishMatch?: boolean
  ) => void;
  resetMatchScore: (matchId: string) => void;
  toggleAttendance: (sessionId: string, playerId: string) => void;
  addPlayer: (data: Omit<Player, 'id'>) => Player;
  updatePlayer: (player: Player) => void;
  deletePlayer: (playerId: string) => void;
  authenticatePlayer: (
    idOrPhoneOrName: string,
    password: string
  ) => { success: boolean; message: string; player?: Player };
  resetAllData: () => void;
  // Stats
  getStatsForSession: (sessionId: string) => PlayerStats[];
  getStatsForFilter: (period: 'all' | 'month' | 'year' | 'week', monthValue?: string, yearValue?: number) => PlayerStats[];
  hallOfFame: {
    weeklyMVP: HonorPodium;
    monthlyMVP: HonorPodium;
    yearlyMVP: HonorPodium;
  };
}

const STORAGE_PLAYERS_KEY = 'picklematch_players_v1';
const STORAGE_SESSIONS_KEY = 'picklematch_sessions_v1';
const STORAGE_USER_KEY = 'picklematch_current_user_v1';
const STORAGE_ACTIVE_SESSION_KEY = 'picklematch_active_session_v1';

const PickleballContext = createContext<PickleballContextType | undefined>(undefined);

export const PickleballProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PLAYERS_KEY);
      if (saved) {
        const parsed: Player[] = JSON.parse(saved);
        return parsed.map((p) => {
          const r = parseFloat(p.rating || '3.500');
          const formatted = isNaN(r) ? '3.500' : r.toFixed(3);
          return {
            ...p,
            rating: formatted,
            initialRating: p.initialRating || formatted,
            password: p.password || '123456',
          };
        });
      }
    } catch {
      // ignore
    }
    return INITIAL_PLAYERS;
  });

  const [sessions, setSessions] = useState<ClubSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SESSIONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_SESSIONS;
  });

  const [currentUserId, setCurrentUserIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USER_KEY);
      if (saved) return saved;
    } catch {
      // ignore
    }
    return 'p-1'; // Default: Nguyễn Tuấn (Admin)
  });

  const [activeSessionId, setActiveSessionIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVE_SESSION_KEY);
      if (saved) return saved;
    } catch {
      // ignore
    }
    return 'session-live';
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_PLAYERS_KEY, JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_USER_KEY, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_ACTIVE_SESSION_KEY, activeSessionId);
  }, [activeSessionId]);

  const currentUser = useMemo(() => {
    return players.find((p) => p.id === currentUserId) || players[0];
  }, [players, currentUserId]);

  const isAdmin = currentUser.role === 'admin';
  const isAdminOrSubAdmin = currentUser.role === 'admin' || currentUser.role === 'sub_admin';

  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || sessions[0];
  }, [sessions, activeSessionId]);

  const setCurrentUserId = (id: string) => {
    setCurrentUserIdState(id);
  };

  const setActiveSessionId = (id: string) => {
    setActiveSessionIdState(id);
  };

  const updateSession = (updatedSession: ClubSession) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === updatedSession.id ? updatedSession : s))
    );
  };

  const createSession = (data: {
    name: string;
    date: string;
    time: string;
    location: string;
    courtCount: number;
    targetMatchesPerPlayer: number;
    strictAlternatingRest: boolean;
    registeredPlayerIds?: string[];
    autoScheduleWhenFull?: boolean;
    requiredPlayerCount?: number;
    allowedTypes?: MatchType[];
  }) => {
    const newSession: ClubSession = {
      id: `session-${Date.now().toString(36)}`,
      name: data.name,
      date: data.date,
      time: data.time,
      location: data.location,
      courtCount: data.courtCount,
      targetMatchesPerPlayer: data.targetMatchesPerPlayer,
      strictAlternatingRest: data.strictAlternatingRest,
      status: 'open_registration',
      registeredPlayerIds: data.registeredPlayerIds || [],
      matches: [],
      allowedTypes:
        data.allowedTypes && data.allowedTypes.length > 0
          ? data.allowedTypes
          : ['men_doubles', 'women_doubles', 'mixed_doubles'],
      autoScheduleWhenFull: data.autoScheduleWhenFull ?? true,
      requiredPlayerCount:
        data.requiredPlayerCount ??
        (data.courtCount === 1 ? 8 : data.courtCount === 2 ? 16 : data.courtCount * 8),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    return newSession;
  };

  const deleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      const remaining = sessions.filter((s) => s.id !== sessionId);
      if (remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
      }
    }
  };

  const generateScheduleForSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) {
      return { success: false, message: 'Không tìm thấy buổi đánh.' };
    }

    const regPlayers = players.filter((p) => session.registeredPlayerIds.includes(p.id));

    if (regPlayers.length < 4) {
      return {
        success: false,
        message: 'Cần tối thiểu 4 người đăng ký để tạo lịch thi đấu.',
      };
    }

    const result = generateSmartSchedule({
      sessionId: session.id,
      players: regPlayers,
      courtCount: session.courtCount,
      targetMatchesPerPlayer: session.targetMatchesPerPlayer,
      strictAlternatingRest: session.strictAlternatingRest,
      allowedTypes: session.allowedTypes,
    });

    const updatedSession: ClubSession = {
      ...session,
      matches: result.matches,
      status: 'in_progress',
    };

    updateSession(updatedSession);

    return {
      success: true,
      message: `Đã tạo thành công ${result.matches.length} trận (${result.totalRounds} vòng đấu) cho ${regPlayers.length} VĐV. Tuân thủ nghiêm ngặt quy tắc nghỉ 1 trận xen kẽ!`,
      warning: result.warning,
    };
  };

  const recordMatchScore = (
    matchId: string,
    scoreA: number,
    scoreB: number,
    finishMatch = true
  ) => {
    // 1. Calculate DUPR updates if match is completed
    let duprDeltasToSave: Record<string, number> | undefined = undefined;
    let duprDetailsToSave: Match['duprDetails'] = undefined;

    let targetMatch: Match | undefined;
    for (const s of sessions) {
      const found = s.matches?.find((m) => m.id === matchId);
      if (found) {
        targetMatch = found;
        break;
      }
    }

    if (finishMatch && targetMatch && (scoreA > 0 || scoreB > 0) && scoreA !== scoreB) {
      // Revert previous DUPR deltas if this match was already completed before
      let currentPlayersState = [...players];
      if (targetMatch.duprDeltas) {
        const oldDeltas = targetMatch.duprDeltas;
        currentPlayersState = currentPlayersState.map((p) => {
          const oldDelta = oldDeltas[p.id];
          if (oldDelta === undefined) return p;
          const curVal = parseDupr(p.rating);
          const revVal = Math.min(6.5, Math.max(2.0, curVal - oldDelta));
          return {
            ...p,
            rating: revVal.toFixed(3),
          };
        });
      }

      // Calculate DUPR changes with standard pickleball dynamic Elo algorithm
      const impact = calculateMatchDupr(
        targetMatch.teamA,
        targetMatch.teamB,
        scoreA,
        scoreB,
        currentPlayersState
      );

      duprDeltasToSave = Object.fromEntries(
        Object.entries(impact.playerDeltas).map(([pId, info]) => [pId, info.delta])
      );
      duprDetailsToSave = {
        teamARating: impact.teamARatingBefore,
        teamBRating: impact.teamBRatingBefore,
        deltaA: impact.deltaTeamA,
        deltaB: impact.deltaTeamB,
      };

      // Save new ratings to players state
      setPlayers(() =>
        currentPlayersState.map((p) => {
          const pImpact = impact.playerDeltas[p.id];
          if (!pImpact) return p;
          return {
            ...p,
            rating: pImpact.after.toFixed(3),
          };
        })
      );
    }

    setSessions((prevSessions) =>
      prevSessions.map((session) => {
        const matchIndex = session.matches.findIndex((m) => m.id === matchId);
        if (matchIndex === -1) return session;

        const currentMatch = session.matches[matchIndex];
        let winner: 'teamA' | 'teamB' | undefined = undefined;
        let status: MatchStatus = currentMatch.status;

        if (finishMatch) {
          if (scoreA > scoreB) winner = 'teamA';
          else if (scoreB > scoreA) winner = 'teamB';
          status = 'completed';
        } else {
          status = 'playing';
        }

        const updatedMatch: Match = {
          ...currentMatch,
          teamA: { ...currentMatch.teamA, score: scoreA },
          teamB: { ...currentMatch.teamB, score: scoreB },
          winner,
          status,
          completedAt: finishMatch ? new Date().toISOString() : currentMatch.completedAt,
          duprDeltas: duprDeltasToSave ?? currentMatch.duprDeltas,
          duprDetails: duprDetailsToSave ?? currentMatch.duprDetails,
        };

        const newMatches = [...session.matches];
        newMatches[matchIndex] = updatedMatch;

        // Auto-advance next round to 'playing' if current round matches are completed
        const currentRound = currentMatch.roundIndex;
        const currentRoundMatches = newMatches.filter((m) => m.roundIndex === currentRound);
        const allCurrentRoundDone = currentRoundMatches.every((m) => m.status === 'completed');

        if (allCurrentRoundDone) {
          const nextRound = currentRound + 1;
          newMatches.forEach((m) => {
            if (m.roundIndex === nextRound && m.status === 'upcoming') {
              m.status = 'playing';
            }
          });
        }

        return {
          ...session,
          matches: newMatches,
        };
      })
    );
  };

  const resetMatchScore = (matchId: string) => {
    // Revert DUPR changes if match was completed and had deltas
    let targetMatch: Match | undefined;
    for (const s of sessions) {
      const found = s.matches?.find((m) => m.id === matchId);
      if (found) {
        targetMatch = found;
        break;
      }
    }

    if (targetMatch && targetMatch.duprDeltas) {
      const deltas = targetMatch.duprDeltas;
      setPlayers((prev) =>
        prev.map((p) => {
          const delta = deltas[p.id];
          if (delta === undefined) return p;
          const curVal = parseDupr(p.rating);
          const revVal = Math.min(6.5, Math.max(2.0, curVal - delta));
          return {
            ...p,
            rating: revVal.toFixed(3),
          };
        })
      );
    }

    setSessions((prevSessions) =>
      prevSessions.map((session) => {
        const matchIndex = session.matches.findIndex((m) => m.id === matchId);
        if (matchIndex === -1) return session;

        const currentMatch = session.matches[matchIndex];
        const updatedMatch: Match = {
          ...currentMatch,
          teamA: { ...currentMatch.teamA, score: undefined },
          teamB: { ...currentMatch.teamB, score: undefined },
          winner: undefined,
          status: 'upcoming',
          completedAt: undefined,
          duprDeltas: undefined,
          duprDetails: undefined,
        };

        const newMatches = [...session.matches];
        newMatches[matchIndex] = updatedMatch;

        return {
          ...session,
          matches: newMatches,
        };
      })
    );
  };

  const toggleAttendance = (sessionId: string, playerId: string) => {
    let autoScheduled = false;
    let autoSessionName = '';
    let autoMatchCount = 0;

    setSessions((prevSessions) =>
      prevSessions.map((s) => {
        if (s.id !== sessionId) return s;
        const exists = s.registeredPlayerIds.includes(playerId);
        const newIds = exists
          ? s.registeredPlayerIds.filter((id) => id !== playerId)
          : [...s.registeredPlayerIds, playerId];

        const targetCount =
          s.requiredPlayerCount ||
          (s.courtCount === 1 ? 8 : s.courtCount === 2 ? 16 : s.courtCount * 8);

        // Auto schedule when reaching target and session currently has no matches
        if (
          !exists &&
          s.autoScheduleWhenFull !== false &&
          newIds.length >= targetCount &&
          (!s.matches || s.matches.length === 0)
        ) {
          const regPlayers = players.filter((p) => newIds.includes(p.id));
          if (regPlayers.length >= 4) {
            const result = generateSmartSchedule({
              sessionId: s.id,
              players: regPlayers,
              courtCount: s.courtCount,
              targetMatchesPerPlayer: s.targetMatchesPerPlayer,
              strictAlternatingRest: s.strictAlternatingRest,
              allowedTypes: s.allowedTypes,
            });

            autoScheduled = true;
            autoSessionName = s.name;
            autoMatchCount = result.matches.length;

            return {
              ...s,
              registeredPlayerIds: newIds,
              matches: result.matches,
              status: 'in_progress',
            };
          }
        }

        return {
          ...s,
          registeredPlayerIds: newIds,
        };
      })
    );

    if (autoScheduled) {
      setTimeout(() => {
        alert(
          `🎉 Tuyệt vời! Buổi đánh "${autoSessionName}" vừa đạt đủ quân số đăng ký. Hệ thống đã TỰ ĐỘNG CHIA LỊCH THI ĐẤU (${autoMatchCount} trận) ngẫu nhiên theo đúng quy tắc 1 trận đánh - 1 trận nghỉ xen kẽ!`
        );
      }, 200);
    }
  };

  const addPlayer = (data: Omit<Player, 'id'>) => {
    const newPlayer: Player = {
      ...data,
      id: `p-${Date.now().toString(36)}`,
      avatarColor:
        data.gender === 'male'
          ? 'from-blue-500 to-indigo-600'
          : 'from-pink-500 to-rose-600',
      active: true,
      joinDate: new Date().toISOString().split('T')[0],
    };
    setPlayers((prev) => [...prev, newPlayer]);
    return newPlayer;
  };

  const updatePlayer = (updatedPlayer: Player) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p))
    );
  };

  const deletePlayer = (playerId: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
  };

  const authenticatePlayer = (
    idOrPhoneOrName: string,
    pass: string
  ): { success: boolean; message: string; player?: Player } => {
    const query = idOrPhoneOrName.trim().toLowerCase();
    const queryCleanPhone = query.replace(/\s+/g, '');
    const found = players.find((p) => {
      const matchId = p.id.toLowerCase() === query;
      const matchName = p.name.toLowerCase() === query;
      const matchPhone = p.phone && p.phone.replace(/\s+/g, '') === queryCleanPhone;
      return matchId || matchName || matchPhone;
    });

    if (!found) {
      return { success: false, message: 'Không tìm thấy tài khoản (kiểm tra lại Tên hoặc SĐT).' };
    }

    const expectedPass = found.password || '123456';
    if (expectedPass !== pass) {
      return { success: false, message: 'Mật khẩu không chính xác.' };
    }

    setCurrentUserIdState(found.id);
    return {
      success: true,
      message: `Đăng nhập thành công! Chào ${found.name}.`,
      player: found,
    };
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_PLAYERS_KEY);
    localStorage.removeItem(STORAGE_SESSIONS_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_ACTIVE_SESSION_KEY);
    setPlayers(INITIAL_PLAYERS);
    setSessions(INITIAL_SESSIONS);
    setCurrentUserIdState('p-1');
    setActiveSessionIdState('session-live');
  };

  const getStatsForSession = (sessionId: string): PlayerStats[] => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return [];
    const regPlayers = players.filter((p) => session.registeredPlayerIds.includes(p.id));
    const statsMap = calculatePlayerStats(regPlayers, session.matches);
    return sortRankings(Object.values(statsMap));
  };

  const getStatsForFilter = (
    period: 'all' | 'month' | 'year' | 'week',
    monthValue?: string, // e.g. "2026-11"
    yearValue = 2026
  ): PlayerStats[] => {
    // Collect all matches from sessions matching the filter
    const filteredMatches: Match[] = [];

    sessions.forEach((session) => {
      const sessionDate = new Date(session.date);
      const sYear = sessionDate.getFullYear();
      const sMonth = `${sYear}-${String(sessionDate.getMonth() + 1).padStart(2, '0')}`;

      if (period === 'year' && sYear !== yearValue) return;
      if (period === 'month' && monthValue && sMonth !== monthValue) return;
      if (period === 'week') {
        // Current week (Nov 01 - Nov 07, 2026)
        if (session.id !== 'session-live' && session.id !== 'session-week-44') return;
      }

      filteredMatches.push(...session.matches);
    });

    const statsMap = calculatePlayerStats(players, filteredMatches);
    return sortRankings(Object.values(statsMap));
  };

  // Hall of fame calculations
  const hallOfFame = useMemo(() => {
    // Weekly MVP (Tuần 45 - Tháng 11/2026)
    const weekMatches: Match[] = [];
    sessions.forEach((s) => {
      if (s.id === 'session-live' || s.id === 'session-week-44') {
        weekMatches.push(...s.matches);
      }
    });
    const weekStats = sortRankings(Object.values(calculatePlayerStats(players, weekMatches)));

    // Monthly MVP (Tháng 11/2026)
    const monthMatches: Match[] = [];
    sessions.forEach((s) => {
      if (s.date.startsWith('2026-11')) {
        monthMatches.push(...s.matches);
      }
    });
    const monthStats = sortRankings(Object.values(calculatePlayerStats(players, monthMatches)));

    // Yearly MVP (Năm 2026 - all sessions)
    const allMatches: Match[] = [];
    sessions.forEach((s) => allMatches.push(...s.matches));
    const yearStats = sortRankings(Object.values(calculatePlayerStats(players, allMatches)));

    const createPodium = (
      periodType: 'week' | 'month' | 'year',
      periodLabel: string,
      ranking: PlayerStats[]
    ): HonorPodium => {
      return {
        periodType,
        periodLabel,
        top1: ranking[0] || ({} as PlayerStats),
        top2: ranking[1],
        top3: ranking[2],
        allTop: ranking.slice(0, 10),
      };
    };

    return {
      weeklyMVP: createPodium('week', 'Tuần 45 (01/11 - 07/11/2026)', weekStats),
      monthlyMVP: createPodium('month', 'Tháng 11 / 2026', monthStats),
      yearlyMVP: createPodium('year', 'Mùa Giải Toàn Quốc 2026', yearStats),
    };
  }, [players, sessions]);

  return (
    <PickleballContext.Provider
      value={{
        players,
        sessions,
        activeSessionId,
        activeSession,
        currentUser,
        setCurrentUserId,
        isAdmin,
        isAdminOrSubAdmin,
        setActiveSessionId,
        updateSession,
        createSession,
        deleteSession,
        generateScheduleForSession,
        recordMatchScore,
        resetMatchScore,
        toggleAttendance,
        addPlayer,
        updatePlayer,
        deletePlayer,
        authenticatePlayer,
        resetAllData,
        getStatsForSession,
        getStatsForFilter,
        hallOfFame,
      }}
    >
      {children}
    </PickleballContext.Provider>
  );
};

export const usePickleball = () => {
  const context = useContext(PickleballContext);
  if (!context) {
    throw new Error('usePickleball must be used within a PickleballProvider');
  }
  return context;
};
