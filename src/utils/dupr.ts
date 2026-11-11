import { Player, MatchTeam } from '../types/pickleball';

export interface DuprPlayerImpact {
  playerId: string;
  before: number;
  delta: number;
  after: number;
}

export interface DuprMatchImpact {
  teamARatingBefore: number;
  teamBRatingBefore: number;
  expectedA: number; // 0..1 (Tỷ lệ thắng kỳ vọng của Đội A)
  expectedB: number; // 0..1 (Tỷ lệ thắng kỳ vọng của Đội B)
  pointShareA: number; // Tỷ lệ điểm ghi được của Đội A
  pointShareB: number; // Tỷ lệ điểm ghi được của Đội B
  deltaTeamA: number; // Biến động điểm DUPR Đội A (+ hoặc -)
  deltaTeamB: number; // Biến động điểm DUPR Đội B (+ hoặc -)
  playerDeltas: Record<string, DuprPlayerImpact>;
}

/**
 * Chuyển đổi điểm rating DUPR sang số thực (mặc định 3.500)
 */
export function parseDupr(rating?: string | number): number {
  if (rating === undefined || rating === null) return 3.5;
  const num = typeof rating === 'number' ? rating : parseFloat(rating);
  return isNaN(num) ? 3.5 : num;
}

/**
 * Định dạng điểm DUPR theo chuẩn 3 chữ số thập phân (VD: 3.542, 4.120)
 */
export function formatDupr(val: number): string {
  return val.toFixed(3);
}

/**
 * Thuật toán tính toán biến động điểm DUPR chính thức (Dynamic Universal Pickleball Rating)
 * 1. Dựa trên chênh lệch trình độ (Rating gap) giữa 2 đội để tính tỷ lệ thắng kỳ vọng (Expected Win Rate).
 * 2. Thắng đội có DUPR cao hơn (Upset) được CỘNG RẤT NHIỀU ĐIỂM (lên đến +0.120).
 * 3. Thua đội có DUPR thấp hơn bị TRỪ RẤT NHIỀU ĐIỂM.
 * 4. Tính toán cả cách biệt điểm số ván đấu (Margin of Victory / Point Share): thắng áp đảo 11-2 được cộng nhiều hơn 11-9.
 * 5. Luôn đảm bảo: Đội thắng ĐƯỢC TĂNG ĐIỂM, Đội thua BỊ TRỪ ĐIỂM.
 */
export function calculateMatchDupr(
  teamA: MatchTeam,
  teamB: MatchTeam,
  scoreA: number,
  scoreB: number,
  players: Player[]
): DuprMatchImpact {
  const playerMap = new Map<string, Player>(players.map((p) => [p.id, p]));

  const rA1 = parseDupr(playerMap.get(teamA.player1Id)?.rating);
  const rA2 = parseDupr(playerMap.get(teamA.player2Id)?.rating);
  const rB1 = parseDupr(playerMap.get(teamB.player1Id)?.rating);
  const rB2 = parseDupr(playerMap.get(teamB.player2Id)?.rating);

  const teamARatingBefore = Number(((rA1 + rA2) / 2).toFixed(3));
  const teamBRatingBefore = Number(((rB1 + rB2) / 2).toFixed(3));

  // Tỷ lệ thắng kỳ vọng theo phân phối Logistic Elo chuẩn DUPR (hệ số scale 0.8 cho thang điểm Pickleball)
  const ratingDiff = teamBRatingBefore - teamARatingBefore;
  const expectedA = 1 / (1 + Math.pow(10, ratingDiff / 0.8));
  const expectedB = 1 - expectedA;

  // Tính tỷ lệ điểm ghi được (Point Share)
  const totalScore = scoreA + scoreB;
  let pointShareA = 0.5;
  if (totalScore > 0) {
    pointShareA = (scoreA + 1) / (totalScore + 2); // Laplace smoothing
  }
  const pointShareB = 1 - pointShareA;

  // Kết quả thực tế ván đấu: 65% là Thắng/Thua, 35% là tỷ số cách biệt
  const isAWinner = scoreA > scoreB;
  const isBWinner = scoreB > scoreA;
  const actualOutcomeA = isAWinner ? 1.0 : isBWinner ? 0.0 : 0.5;

  const performanceA = 0.65 * actualOutcomeA + 0.35 * pointShareA;

  // Hệ số dao động K-factor DUPR
  const K = 0.125;
  let deltaA = K * (performanceA - expectedA);

  // Áp dụng quy tắc cốt lõi:
  // - Nếu Đội A thắng: bắt buộc deltaA > 0.
  //   Nếu Đội A thắng đội mạnh hơn (teamBRatingBefore > teamARatingBefore): khuếch đại thưởng điểm.
  // - Nếu Đội A thua: bắt buộc deltaA < 0.
  //   Nếu Đội A thua đội yếu hơn: tăng mức phạt trừ điểm.
  if (isAWinner) {
    if (deltaA <= 0) deltaA = 0.02; // Bảo đảm thắng luôn tăng điểm
    if (teamBRatingBefore > teamARatingBefore) {
      // Upset bonus: Thắng người DUPR cao hơn
      const gap = teamBRatingBefore - teamARatingBefore;
      deltaA = deltaA * (1 + gap * 0.5);
    }
    // Giới hạn trong khoảng hợp lý cho mỗi trận: tối thiểu +0.015, tối đa +0.135
    deltaA = Math.max(0.018, Math.min(0.135, deltaA));
  } else if (isBWinner) {
    if (deltaA >= 0) deltaA = -0.02; // Bảo đảm thua luôn bị trừ điểm
    if (teamARatingBefore > teamBRatingBefore) {
      // Upset penalty: Thua người DUPR thấp hơn
      const gap = teamARatingBefore - teamBRatingBefore;
      deltaA = deltaA * (1 + gap * 0.5);
    }
    // Giới hạn trong khoảng hợp lý: tối thiểu -0.135, tối đa -0.018
    deltaA = Math.min(-0.018, Math.max(-0.135, deltaA));
  } else {
    // Hòa điểm (rất hiếm trong Pickleball)
    deltaA = Number((K * (0.5 - expectedA)).toFixed(3));
  }

  deltaA = Number(deltaA.toFixed(3));
  const deltaB = Number((-deltaA).toFixed(3));

  // Phân bổ biến động cho từng cá nhân (giới hạn từ 2.000 đến 6.500)
  const calcNewRating = (oldR: number, delta: number) => {
    const raw = oldR + delta;
    return Number(Math.min(6.5, Math.max(2.0, raw)).toFixed(3));
  };

  const playerDeltas: Record<string, DuprPlayerImpact> = {
    [teamA.player1Id]: {
      playerId: teamA.player1Id,
      before: rA1,
      delta: deltaA,
      after: calcNewRating(rA1, deltaA),
    },
    [teamA.player2Id]: {
      playerId: teamA.player2Id,
      before: rA2,
      delta: deltaA,
      after: calcNewRating(rA2, deltaA),
    },
    [teamB.player1Id]: {
      playerId: teamB.player1Id,
      before: rB1,
      delta: deltaB,
      after: calcNewRating(rB1, deltaB),
    },
    [teamB.player2Id]: {
      playerId: teamB.player2Id,
      before: rB2,
      delta: deltaB,
      after: calcNewRating(rB2, deltaB),
    },
  };

  return {
    teamARatingBefore,
    teamBRatingBefore,
    expectedA: Number(expectedA.toFixed(2)),
    expectedB: Number(expectedB.toFixed(2)),
    pointShareA: Number(pointShareA.toFixed(2)),
    pointShareB: Number(pointShareB.toFixed(2)),
    deltaTeamA: deltaA,
    deltaTeamB: deltaB,
    playerDeltas,
  };
}
