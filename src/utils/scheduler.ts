import { Player, Match, MatchType, MatchTeam } from '../types/pickleball';

export interface ScheduleOptions {
  sessionId: string;
  players: Player[];
  courtCount: number;
  targetMatchesPerPlayer: number;
  strictAlternatingRest?: boolean;
  allowedTypes?: MatchType[];
}

export interface ScheduleResult {
  matches: Match[];
  totalRounds: number;
  playerMatchCounts: Record<string, number>;
  restViolations: number;
  warning?: string;
}

/**
 * Get numeric DUPR rating with 3.5 fallback
 */
export function getPlayerRating(player?: Player): number {
  if (!player || !player.rating) return 3.5;
  const num = parseFloat(player.rating);
  return isNaN(num) ? 3.5 : num;
}

/**
 * Shuffle array randomly using Fisher-Yates
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Sắp xếp lịch thi đấu thông minh cho CLB Pickleball Cún Cưng:
 * 1. Mỗi thành viên đánh số trận bằng nhau (đạt đúng targetMatchesPerPlayer).
 * 2. Hạn chế tối đa đánh 2 trận liên tục (100% nghỉ 1 trận xen kẽ).
 * 3. Hạn chế lặp lại bạn cặp và đối thủ đã thi đấu.
 * 4. Hạn chế chênh lệch điểm DUPR giữa 2 đội (cân bằng trình độ Đội A và Đội B).
 * 5. Tuân thủ danh sách thể loại trận đấu cho phép: Nam Nam (men_doubles), Nữ Nữ (women_doubles), Nam Nữ (mixed_doubles).
 */
export function generateSmartSchedule(options: ScheduleOptions): ScheduleResult {
  const {
    sessionId,
    players,
    courtCount,
    targetMatchesPerPlayer,
    strictAlternatingRest = true,
    allowedTypes = ['men_doubles', 'women_doubles', 'mixed_doubles'],
  } = options;

  if (players.length < 4) {
    return {
      matches: [],
      totalRounds: 0,
      playerMatchCounts: {},
      restViolations: 0,
      warning: 'Cần tối thiểu 4 người chơi để tạo trận đấu.',
    };
  }

  // Ensure at least one match type is allowed
  const safeAllowedTypes: MatchType[] =
    allowedTypes.length > 0
      ? allowedTypes
      : ['men_doubles', 'women_doubles', 'mixed_doubles'];

  const playerMatchCounts: Record<string, number> = {};
  players.forEach((p) => {
    playerMatchCounts[p.id] = 0;
  });

  const getPairKey = (id1: string, id2: string) =>
    id1 < id2 ? `${id1}_${id2}` : `${id2}_${id1}`;

  // History tracking
  const partnerHistory = new Map<string, number>();
  const opponentHistory = new Map<string, number>();

  const recordPairing = (teamA: MatchTeam, teamB: MatchTeam) => {
    // Teammates
    const keyA = getPairKey(teamA.player1Id, teamA.player2Id);
    const keyB = getPairKey(teamB.player1Id, teamB.player2Id);
    partnerHistory.set(keyA, (partnerHistory.get(keyA) || 0) + 1);
    partnerHistory.set(keyB, (partnerHistory.get(keyB) || 0) + 1);

    // Opponents
    const oppPairs = [
      getPairKey(teamA.player1Id, teamB.player1Id),
      getPairKey(teamA.player1Id, teamB.player2Id),
      getPairKey(teamA.player2Id, teamB.player1Id),
      getPairKey(teamA.player2Id, teamB.player2Id),
    ];
    oppPairs.forEach((key) => {
      opponentHistory.set(key, (opponentHistory.get(key) || 0) + 1);
    });
  };

  // Courts that can run simultaneously per round
  const maxSimultaneousPlayers = strictAlternatingRest
    ? Math.floor(players.length / 2)
    : players.length;

  const usableCourtsPerRound = Math.max(
    1,
    Math.min(courtCount, Math.floor(maxSimultaneousPlayers / 4))
  );

  let warning: string | undefined;
  if (strictAlternatingRest && courtCount * 4 > players.length / 2) {
    warning = `Để đảm bảo quy tắc "Đánh 1 trận, Nghỉ 1 trận", mỗi vòng tối đa ${usableCourtsPerRound} sân hoạt động đồng thời (${usableCourtsPerRound * 4} VĐV thi đấu, ${players.length - usableCourtsPerRound * 4} VĐV nghỉ).`;
  }

  const matches: Match[] = [];
  let lastRoundPlayerIds = new Set<string>();
  let restViolations = 0;
  const maxRounds = Math.max(targetMatchesPerPlayer * 3, 30);

  // Helper to score match pairing
  const evaluateTeamsCost = (pA1: Player, pA2: Player, pB1: Player, pB2: Player) => {
    const ratingA = getPlayerRating(pA1) + getPlayerRating(pA2);
    const ratingB = getPlayerRating(pB1) + getPlayerRating(pB2);
    const duprDiff = Math.abs(ratingA - ratingB);

    const partnerPenalty =
      (partnerHistory.get(getPairKey(pA1.id, pA2.id)) || 0) +
      (partnerHistory.get(getPairKey(pB1.id, pB2.id)) || 0);

    const opponentPenalty =
      (opponentHistory.get(getPairKey(pA1.id, pB1.id)) || 0) +
      (opponentHistory.get(getPairKey(pA1.id, pB2.id)) || 0) +
      (opponentHistory.get(getPairKey(pA2.id, pB1.id)) || 0) +
      (opponentHistory.get(getPairKey(pA2.id, pB2.id)) || 0);

    // Weights: DUPR balance high priority (x15), repeat partner high (x8), repeat opponent (x4)
    return duprDiff * 15 + partnerPenalty * 8 + opponentPenalty * 4;
  };

  for (let round = 1; round <= maxRounds; round++) {
    // Check if every player has achieved target matches
    const remainingNeeded = players.filter(
      (p) => (playerMatchCounts[p.id] || 0) < targetMatchesPerPlayer
    );
    if (remainingNeeded.length === 0) {
      break;
    }

    // Determine candidate resting players for this round
    let candidates = players.filter(
      (p) =>
        (playerMatchCounts[p.id] || 0) < targetMatchesPerPlayer &&
        !lastRoundPlayerIds.has(p.id)
    );

    // If not enough rested players who still need matches, allow rested players who already reached target as fillers if necessary, or fallback
    if (candidates.length < 4) {
      if (strictAlternatingRest && remainingNeeded.length >= 4) {
        // Fallback: pick players from remainingNeeded even if played last round (least recent)
        candidates = [...remainingNeeded];
        restViolations++;
      } else if (candidates.length + remainingNeeded.length >= 4) {
        candidates = [...new Set([...candidates, ...remainingNeeded])];
      } else {
        // Tournament nearly complete: take players who need matches + lowest played fillers
        const fillers = shuffle(players.filter((p) => !candidates.some((c) => c.id === p.id))).sort(
          (a, b) => (playerMatchCounts[a.id] || 0) - (playerMatchCounts[b.id] || 0)
        );
        candidates = [...candidates, ...fillers.slice(0, 4 - candidates.length)];
      }
    }

    if (candidates.length < 4) {
      break;
    }

    // Sort candidates:
    // 1. Players who need matches most (lowest match count)
    // 2. Random tie-breaking
    candidates = shuffle(candidates).sort(
      (a, b) => (playerMatchCounts[a.id] || 0) - (playerMatchCounts[b.id] || 0)
    );

    const thisRoundPlayerIds = new Set<string>();
    const roundMatches: Match[] = [];

    for (let c = 1; c <= usableCourtsPerRound; c++) {
      const pool = candidates.filter((p) => !thisRoundPlayerIds.has(p.id));
      if (pool.length < 4) break;

      // Group pool by gender
      const poolMales = pool.filter((p) => p.gender === 'male');
      const poolFemales = pool.filter((p) => p.gender === 'female');

      // Possible types
      const possibleTypes: MatchType[] = [];
      if (safeAllowedTypes.includes('men_doubles') && poolMales.length >= 4) {
        possibleTypes.push('men_doubles');
      }
      if (safeAllowedTypes.includes('women_doubles') && poolFemales.length >= 4) {
        possibleTypes.push('women_doubles');
      }
      if (
        safeAllowedTypes.includes('mixed_doubles') &&
        poolMales.length >= 2 &&
        poolFemales.length >= 2
      ) {
        possibleTypes.push('mixed_doubles');
      }

      let chosenType: MatchType;
      let matchPlayers: Player[] = [];

      if (possibleTypes.length > 0) {
        // Choose type with fewest matches played so far or rotate
        chosenType = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
      } else {
        // Fallback to whichever valid combination exists
        if (poolMales.length >= 2 && poolFemales.length >= 2) {
          chosenType = 'mixed_doubles';
        } else if (poolMales.length >= 4) {
          chosenType = 'men_doubles';
        } else if (poolFemales.length >= 4) {
          chosenType = 'women_doubles';
        } else {
          chosenType = safeAllowedTypes[0] || 'mixed_doubles';
        }
      }

      // Select 4 players based on chosen type
      if (chosenType === 'men_doubles') {
        matchPlayers = poolMales.slice(0, 4);
      } else if (chosenType === 'women_doubles') {
        matchPlayers = poolFemales.slice(0, 4);
      } else {
        // Mixed: 2 males + 2 females
        matchPlayers = [...poolMales.slice(0, 2), ...poolFemales.slice(0, 2)];
      }

      if (matchPlayers.length < 4) {
        matchPlayers = pool.slice(0, 4);
        const mCount = matchPlayers.filter((p) => p.gender === 'male').length;
        if (mCount === 4) chosenType = 'men_doubles';
        else if (mCount === 0) chosenType = 'women_doubles';
        else chosenType = 'mixed_doubles';
      }

      // Optimize pairing for DUPR balance + minimal repeat partners + minimal repeat opponents
      let bestTeamA: MatchTeam = { player1Id: matchPlayers[0].id, player2Id: matchPlayers[1].id };
      let bestTeamB: MatchTeam = { player1Id: matchPlayers[2].id, player2Id: matchPlayers[3].id };
      let lowestCost = Infinity;

      if (chosenType === 'mixed_doubles') {
        const m = matchPlayers.filter((p) => p.gender === 'male');
        const f = matchPlayers.filter((p) => p.gender === 'female');

        if (m.length >= 2 && f.length >= 2) {
          // Permutation 1: (m0, f0) vs (m1, f1)
          const cost1 = evaluateTeamsCost(m[0], f[0], m[1], f[1]);
          // Permutation 2: (m0, f1) vs (m1, f0)
          const cost2 = evaluateTeamsCost(m[0], f[1], m[1], f[0]);

          if (cost1 <= cost2) {
            bestTeamA = { player1Id: m[0].id, player2Id: f[0].id };
            bestTeamB = { player1Id: m[1].id, player2Id: f[1].id };
            lowestCost = cost1;
          } else {
            bestTeamA = { player1Id: m[0].id, player2Id: f[1].id };
            bestTeamB = { player1Id: m[1].id, player2Id: f[0].id };
            lowestCost = cost2;
          }
        }
      } else {
        // Test all 3 combinations: (0,1) vs (2,3), (0,2) vs (1,3), (0,3) vs (1,2)
        const permutations = [
          { a: [matchPlayers[0], matchPlayers[1]], b: [matchPlayers[2], matchPlayers[3]] },
          { a: [matchPlayers[0], matchPlayers[2]], b: [matchPlayers[1], matchPlayers[3]] },
          { a: [matchPlayers[0], matchPlayers[3]], b: [matchPlayers[1], matchPlayers[2]] },
        ];

        permutations.forEach(({ a, b }) => {
          const cost = evaluateTeamsCost(a[0], a[1], b[0], b[1]);
          if (cost < lowestCost) {
            lowestCost = cost;
            bestTeamA = { player1Id: a[0].id, player2Id: a[1].id };
            bestTeamB = { player1Id: b[0].id, player2Id: b[1].id };
          }
        });
      }

      // Record pairing in history
      recordPairing(bestTeamA, bestTeamB);

      // Increment counts
      matchPlayers.forEach((p) => {
        thisRoundPlayerIds.add(p.id);
        playerMatchCounts[p.id] = (playerMatchCounts[p.id] || 0) + 1;
      });

      const matchId = `m-${sessionId}-r${round}-c${c}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

      const newMatch: Match = {
        id: matchId,
        sessionId,
        roundIndex: round,
        courtNumber: c,
        type: chosenType,
        teamA: bestTeamA,
        teamB: bestTeamB,
        status: round === 1 ? 'playing' : 'upcoming',
      };

      roundMatches.push(newMatch);
    }

    if (roundMatches.length > 0) {
      matches.push(...roundMatches);
      lastRoundPlayerIds = thisRoundPlayerIds;
    } else {
      break;
    }
  }

  const totalRounds = matches.length > 0 ? Math.max(...matches.map((m) => m.roundIndex)) : 0;

  return {
    matches,
    totalRounds,
    playerMatchCounts,
    restViolations,
    warning,
  };
}

/**
 * Calculate player statistics from a set of matches
 * Rule: Thắng = 1 điểm, Thua = 0 điểm
 */
export function calculatePlayerStats(
  players: Player[],
  matches: Match[]
): Record<string, import('../types/pickleball').PlayerStats> {
  const statsMap: Record<string, import('../types/pickleball').PlayerStats> = {};

  players.forEach((p) => {
    statsMap[p.id] = {
      playerId: p.id,
      name: p.name,
      gender: p.gender,
      role: p.role,
      avatarColor: p.avatarColor,
      avatarUrl: p.avatarUrl,
      age: p.age,
      rating: p.rating,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      points: 0, // 1 pt per win
      scoreFor: 0,
      scoreAgainst: 0,
      pointDiff: 0,
      winRate: 0,
      streak: 0,
    };
  });

  const playerStreaks: Record<string, number> = {};
  const playerDuprDeltas: Record<string, number> = {};
  players.forEach((p) => {
    playerStreaks[p.id] = 0;
    playerDuprDeltas[p.id] = 0;
  });

  matches.forEach((m) => {
    if (m.status !== 'completed' || !m.winner) return;

    // Track DUPR change
    if (m.duprDeltas) {
      Object.entries(m.duprDeltas).forEach(([pId, delta]) => {
        playerDuprDeltas[pId] = (playerDuprDeltas[pId] || 0) + delta;
      });
    }

    const teamAPlayers = [m.teamA.player1Id, m.teamA.player2Id];
    const teamBPlayers = [m.teamB.player1Id, m.teamB.player2Id];
    const scoreA = m.teamA.score ?? 0;
    const scoreB = m.teamB.score ?? 0;

    const isAWinner = m.winner === 'teamA';

    teamAPlayers.forEach((pId) => {
      const s = statsMap[pId];
      if (!s) return;
      s.matchesPlayed++;
      s.scoreFor += scoreA;
      s.scoreAgainst += scoreB;
      if (isAWinner) {
        s.wins++;
        s.points += 1;
        playerStreaks[pId] = (playerStreaks[pId] || 0) >= 0 ? (playerStreaks[pId] || 0) + 1 : 1;
      } else {
        s.losses++;
        playerStreaks[pId] = (playerStreaks[pId] || 0) <= 0 ? (playerStreaks[pId] || 0) - 1 : -1;
      }
    });

    teamBPlayers.forEach((pId) => {
      const s = statsMap[pId];
      if (!s) return;
      s.matchesPlayed++;
      s.scoreFor += scoreB;
      s.scoreAgainst += scoreA;
      if (!isAWinner) {
        s.wins++;
        s.points += 1;
        playerStreaks[pId] = (playerStreaks[pId] || 0) >= 0 ? (playerStreaks[pId] || 0) + 1 : 1;
      } else {
        s.losses++;
        playerStreaks[pId] = (playerStreaks[pId] || 0) <= 0 ? (playerStreaks[pId] || 0) - 1 : -1;
      }
    });
  });

  Object.values(statsMap).forEach((s) => {
    s.pointDiff = s.scoreFor - s.scoreAgainst;
    s.winRate = s.matchesPlayed > 0 ? Math.round((s.wins / s.matchesPlayed) * 100) : 0;
    s.streak = playerStreaks[s.playerId] || 0;
    s.duprChange = Number((playerDuprDeltas[s.playerId] || 0).toFixed(3));
  });

  return statsMap;
}

/**
 * Sort players by:
 * 1. Points (descending)
 * 2. Point Differential (descending)
 * 3. Total Score For (descending)
 * 4. Win Rate (descending)
 */
export function sortRankings(
  stats: import('../types/pickleball').PlayerStats[]
): import('../types/pickleball').PlayerStats[] {
  return [...stats].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff;
    if (b.scoreFor !== a.scoreFor) return b.scoreFor - a.scoreFor;
    return b.winRate - a.winRate;
  });
}
