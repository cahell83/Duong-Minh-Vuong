export type Gender = 'male' | 'female';

export type UserRole = 'admin' | 'sub_admin' | 'member';

export type MatchType = 'men_doubles' | 'women_doubles' | 'mixed_doubles';

export type MatchStatus = 'upcoming' | 'playing' | 'completed';

export interface Player {
  id: string;
  name: string;
  gender: Gender;
  role: UserRole;
  phone?: string;
  age?: number; // Tuổi
  rating?: string; // DUPR rating e.g. "3.500", "4.125"
  initialRating?: string; // Điểm DUPR ban đầu trước khi tính điểm
  password?: string; // Mật khẩu đăng nhập thành viên
  avatarColor?: string;
  avatarUrl?: string; // Ảnh đại diện
  active: boolean;
  joinDate?: string;
}

export interface MatchTeam {
  player1Id: string;
  player2Id: string;
  score?: number;
}

export interface Match {
  id: string;
  sessionId: string;
  roundIndex: number; // 1-based (Vòng 1, Vòng 2...)
  courtNumber: number; // Sân 1, Sân 2...
  type: MatchType;
  teamA: MatchTeam;
  teamB: MatchTeam;
  winner?: 'teamA' | 'teamB';
  status: MatchStatus;
  startedAt?: string;
  completedAt?: string;
  duprDeltas?: Record<string, number>; // playerId -> delta (vd: { "p-1": 0.055, "p-3": -0.055 })
  duprDetails?: {
    teamARating: number;
    teamBRating: number;
    deltaA: number;
    deltaB: number;
  };
}

export interface ClubSession {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // "18:00 - 21:00"
  location: string;
  courtCount: number;
  targetMatchesPerPlayer: number;
  strictAlternatingRest: boolean; // Bắt buộc 1 trận đánh - 1 trận nghỉ
  status: 'open_registration' | 'in_progress' | 'completed';
  registeredPlayerIds: string[];
  matches: Match[];
  allowedTypes: MatchType[];
  autoScheduleWhenFull?: boolean; // Tự động chia lịch khi đủ người đăng ký
  requiredPlayerCount?: number; // Số người cần để tự động kích hoạt chia lịch (VD: 16, 12, 8)
}

export interface PlayerStats {
  playerId: string;
  name: string;
  gender: Gender;
  role: UserRole;
  avatarColor?: string;
  avatarUrl?: string;
  age?: number;
  rating?: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  points: number; // Thắng 1đ, Thua 0đ
  scoreFor: number;
  scoreAgainst: number;
  pointDiff: number;
  winRate: number; // %
  streak: number;
  duprChange?: number; // Biến động điểm DUPR (tăng/giảm) trong giai đoạn
}

export interface HonorPodium {
  periodType: 'week' | 'month' | 'year';
  periodLabel: string;
  top1: PlayerStats;
  top2?: PlayerStats;
  top3?: PlayerStats;
  allTop: PlayerStats[];
}
