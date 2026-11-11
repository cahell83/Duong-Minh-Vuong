import { Player, ClubSession } from '../types/pickleball';
import { generateSmartSchedule } from '../utils/scheduler';

const RAW_PLAYERS: Player[] = [
  {
    id: 'p-1',
    name: 'Nguyễn Tuấn',
    gender: 'male',
    role: 'admin',
    rating: '4.0',
    phone: '0903 123 456',
    avatarColor: 'from-amber-500 to-orange-600',
    active: true,
    joinDate: '2026-01-10',
  },
  {
    id: 'p-2',
    name: 'Trần Hoàng',
    gender: 'male',
    role: 'sub_admin',
    rating: '3.8',
    phone: '0908 234 567',
    avatarColor: 'from-blue-500 to-cyan-600',
    active: true,
    joinDate: '2026-01-15',
  },
  {
    id: 'p-3',
    name: 'Lê Phương Thảo',
    gender: 'female',
    role: 'member',
    rating: '3.5',
    phone: '0912 345 678',
    avatarColor: 'from-pink-500 to-rose-600',
    active: true,
    joinDate: '2026-02-01',
  },
  {
    id: 'p-4',
    name: 'Phạm Minh Đức',
    gender: 'male',
    role: 'member',
    rating: '3.7',
    phone: '0933 456 789',
    avatarColor: 'from-emerald-500 to-teal-600',
    active: true,
    joinDate: '2026-02-10',
  },
  {
    id: 'p-5',
    name: 'Đỗ Thị Mai Hương',
    gender: 'female',
    role: 'member',
    rating: '3.5',
    phone: '0977 567 890',
    avatarColor: 'from-purple-500 to-indigo-600',
    active: true,
    joinDate: '2026-02-15',
  },
  {
    id: 'p-6',
    name: 'Vũ Quốc Bảo',
    gender: 'male',
    role: 'member',
    rating: '4.2',
    phone: '0988 678 901',
    avatarColor: 'from-red-500 to-pink-600',
    active: true,
    joinDate: '2026-01-20',
  },
  {
    id: 'p-7',
    name: 'Hoàng Bảo Ngọc',
    gender: 'female',
    role: 'member',
    rating: '3.2',
    phone: '0901 789 012',
    avatarColor: 'from-fuchsia-500 to-pink-600',
    active: true,
    joinDate: '2026-03-01',
  },
  {
    id: 'p-8',
    name: 'Đặng Hải Đăng',
    gender: 'male',
    role: 'member',
    rating: '3.6',
    phone: '0909 890 123',
    avatarColor: 'from-sky-500 to-blue-600',
    active: true,
    joinDate: '2026-03-05',
  },
  {
    id: 'p-9',
    name: 'Bùi Kim Ngân',
    gender: 'female',
    role: 'member',
    rating: '3.8',
    phone: '0918 901 234',
    avatarColor: 'from-violet-500 to-purple-600',
    active: true,
    joinDate: '2026-03-10',
  },
  {
    id: 'p-10',
    name: 'Ngô Thanh Tùng',
    gender: 'male',
    role: 'member',
    rating: '3.4',
    phone: '0922 012 345',
    avatarColor: 'from-teal-500 to-emerald-600',
    active: true,
    joinDate: '2026-03-12',
  },
  {
    id: 'p-11',
    name: 'Trịnh Thúy Vy',
    gender: 'female',
    role: 'member',
    rating: '3.3',
    phone: '0938 123 789',
    avatarColor: 'from-amber-400 to-pink-500',
    active: true,
    joinDate: '2026-04-01',
  },
  {
    id: 'p-12',
    name: 'Lý Trọng Nhân',
    gender: 'male',
    role: 'member',
    rating: '3.9',
    phone: '0944 234 890',
    avatarColor: 'from-lime-500 to-green-600',
    active: true,
    joinDate: '2026-04-05',
  },
  {
    id: 'p-13',
    name: 'Phan Thu Hà',
    gender: 'female',
    role: 'member',
    rating: '3.6',
    phone: '0966 345 901',
    avatarColor: 'from-rose-500 to-red-600',
    active: true,
    joinDate: '2026-04-12',
  },
  {
    id: 'p-14',
    name: 'Dương Văn Long',
    gender: 'male',
    role: 'member',
    rating: '3.5',
    phone: '0978 456 012',
    avatarColor: 'from-cyan-500 to-blue-600',
    active: true,
    joinDate: '2026-04-20',
  },
  {
    id: 'p-15',
    name: 'Nguyễn Thị Ánh Tuyết',
    gender: 'female',
    role: 'member',
    rating: '3.4',
    phone: '0982 567 123',
    avatarColor: 'from-orange-400 to-rose-500',
    active: true,
    joinDate: '2026-05-01',
  },
  {
    id: 'p-16',
    name: 'Võ Minh Khang',
    gender: 'male',
    role: 'member',
    rating: '3.6',
    phone: '0919 678 234',
    avatarColor: 'from-indigo-500 to-blue-600',
    active: true,
    joinDate: '2026-05-15',
  },
  {
    id: 'p-17',
    name: 'Trần Thị Mỹ Linh',
    gender: 'female',
    role: 'member',
    rating: '3.7',
    phone: '0904 789 345',
    avatarColor: 'from-emerald-400 to-teal-500',
    active: true,
    joinDate: '2026-06-01',
  },
  {
    id: 'p-18',
    name: 'Hồ Quang Huy',
    gender: 'male',
    role: 'member',
    rating: '3.8',
    phone: '0937 890 456',
    avatarColor: 'from-blue-600 to-indigo-700',
    active: true,
    joinDate: '2026-06-10',
  },
];

export const INITIAL_PLAYERS: Player[] = RAW_PLAYERS.map((p) => {
  const formattedRating = (parseFloat(p.rating || '3.500')).toFixed(3);
  return {
    ...p,
    rating: formattedRating,
    initialRating: formattedRating,
    password: p.password || '123456',
  };
});

// 16 players for the main active session (8 males, 8 females)
const SESSION_1_PLAYERS = INITIAL_PLAYERS.slice(0, 16);

// Pre-generate matches for current session
const generatedForLive = generateSmartSchedule({
  sessionId: 'session-live',
  players: SESSION_1_PLAYERS,
  courtCount: 2,
  targetMatchesPerPlayer: 7,
  strictAlternatingRest: true,
  allowedTypes: ['men_doubles', 'women_doubles', 'mixed_doubles'],
});

// Seed some completed and in-progress scores for realism
const seededLiveMatches = generatedForLive.matches.map((m) => {
  if (m.roundIndex === 1) {
    return {
      ...m,
      status: 'completed' as const,
      teamA: { ...m.teamA, score: 11 },
      teamB: { ...m.teamB, score: 8 },
      winner: 'teamA' as const,
      completedAt: '2026-11-06T18:25:00',
    };
  }
  if (m.roundIndex === 2) {
    return {
      ...m,
      status: 'completed' as const,
      teamA: { ...m.teamA, score: 9 },
      teamB: { ...m.teamB, score: 11 },
      winner: 'teamB' as const,
      completedAt: '2026-11-06T18:50:00',
    };
  }
  if (m.roundIndex === 3) {
    return {
      ...m,
      status: 'playing' as const,
      teamA: { ...m.teamA, score: 7 },
      teamB: { ...m.teamB, score: 5 },
      startedAt: '2026-11-06T18:55:00',
    };
  }
  return m;
});

// Completed past session (Last Week - Nov 1, 2026)
const generatedPastWeek = generateSmartSchedule({
  sessionId: 'session-week-44',
  players: SESSION_1_PLAYERS,
  courtCount: 2,
  targetMatchesPerPlayer: 7,
  strictAlternatingRest: true,
  allowedTypes: ['men_doubles', 'women_doubles', 'mixed_doubles'],
});
const completedPastWeekMatches = generatedPastWeek.matches.map((m, idx) => {
  const isTeamAWinner = (idx % 2 === 0 && idx % 3 !== 0) || idx % 5 === 0;
  const scoreA = isTeamAWinner ? 11 : Math.floor(Math.random() * 5) + 6;
  const scoreB = isTeamAWinner ? Math.floor(Math.random() * 5) + 6 : 11;
  return {
    ...m,
    status: 'completed' as const,
    teamA: { ...m.teamA, score: scoreA },
    teamB: { ...m.teamB, score: scoreB },
    winner: (isTeamAWinner ? 'teamA' : 'teamB') as 'teamA' | 'teamB',
    completedAt: '2026-11-01T20:30:00',
  };
});

// Completed October session (Oct 25, 2026)
const generatedPastOct = generateSmartSchedule({
  sessionId: 'session-october-2026',
  players: INITIAL_PLAYERS.slice(0, 16),
  courtCount: 2,
  targetMatchesPerPlayer: 7,
  strictAlternatingRest: true,
  allowedTypes: ['men_doubles', 'women_doubles', 'mixed_doubles'],
});
const completedPastOctMatches = generatedPastOct.matches.map((m, idx) => {
  const isTeamAWinner = idx % 2 === 1;
  const scoreA = isTeamAWinner ? 11 : 7;
  const scoreB = isTeamAWinner ? 8 : 11;
  return {
    ...m,
    status: 'completed' as const,
    teamA: { ...m.teamA, score: scoreA },
    teamB: { ...m.teamB, score: scoreB },
    winner: (isTeamAWinner ? 'teamA' : 'teamB') as 'teamA' | 'teamB',
    completedAt: '2026-10-25T21:00:00',
  };
});

// Completed September session (Sep 20, 2026)
const generatedPastSep = generateSmartSchedule({
  sessionId: 'session-september-2026',
  players: INITIAL_PLAYERS.slice(0, 16),
  courtCount: 2,
  targetMatchesPerPlayer: 6,
  strictAlternatingRest: true,
  allowedTypes: ['men_doubles', 'women_doubles', 'mixed_doubles'],
});
const completedPastSepMatches = generatedPastSep.matches.map((m, idx) => {
  const isTeamAWinner = idx % 3 !== 0;
  const scoreA = isTeamAWinner ? 11 : 9;
  const scoreB = isTeamAWinner ? 5 : 11;
  return {
    ...m,
    status: 'completed' as const,
    teamA: { ...m.teamA, score: scoreA },
    teamB: { ...m.teamB, score: scoreB },
    winner: (isTeamAWinner ? 'teamA' : 'teamB') as 'teamA' | 'teamB',
    completedAt: '2026-09-20T21:00:00',
  };
});

export const INITIAL_SESSIONS: ClubSession[] = [
  {
    id: 'session-live',
    name: 'Buổi Giao Lưu Hôm Nay - Sân D-Pickleball Thảo Điền',
    date: '2026-11-06',
    time: '18:00 - 21:00',
    location: 'Sân D-Pickleball Center, TP. Thủ Đức',
    courtCount: 2,
    targetMatchesPerPlayer: 7,
    strictAlternatingRest: true,
    status: 'in_progress',
    registeredPlayerIds: SESSION_1_PLAYERS.map((p) => p.id),
    matches: seededLiveMatches,
    allowedTypes: ['men_doubles', 'women_doubles', 'mixed_doubles'],
  },
  {
    id: 'session-upcoming-sunday',
    name: 'Giao Lưu Sáng Chủ Nhật Tuần Này',
    date: '2026-11-08',
    time: '07:30 - 10:30',
    location: 'Sân Pickleball Sky Club, Q.7',
    courtCount: 2,
    targetMatchesPerPlayer: 7,
    strictAlternatingRest: true,
    status: 'open_registration',
    registeredPlayerIds: [
      'p-1',
      'p-2',
      'p-3',
      'p-4',
      'p-5',
      'p-6',
      'p-7',
      'p-8',
      'p-9',
      'p-10',
    ],
    matches: [],
    allowedTypes: ['men_doubles', 'women_doubles', 'mixed_doubles'],
  },
  {
    id: 'session-upcoming-next-week',
    name: 'Lịch Đấu Tối Thứ Ba Tuần Tới',
    date: '2026-11-10',
    time: '18:00 - 21:00',
    location: 'Sân D-Pickleball Center, TP. Thủ Đức',
    courtCount: 2,
    targetMatchesPerPlayer: 7,
    strictAlternatingRest: true,
    status: 'open_registration',
    registeredPlayerIds: ['p-1', 'p-3', 'p-5', 'p-7', 'p-12', 'p-13'],
    matches: [],
    allowedTypes: ['men_doubles', 'women_doubles', 'mixed_doubles'],
  },
  {
    id: 'session-week-44',
    name: 'Giải Đấu Nội Bộ Tuần 44 (Chủ Nhật 01/11)',
    date: '2026-11-01',
    time: '18:00 - 21:30',
    location: 'Sân D-Pickleball Center',
    courtCount: 2,
    targetMatchesPerPlayer: 7,
    strictAlternatingRest: true,
    status: 'completed',
    registeredPlayerIds: SESSION_1_PLAYERS.map((p) => p.id),
    matches: completedPastWeekMatches,
    allowedTypes: ['men_doubles', 'women_doubles', 'mixed_doubles'],
  },
  {
    id: 'session-october-2026',
    name: 'Giải Mùa Thu Tháng 10/2026',
    date: '2026-10-25',
    time: '17:30 - 21:30',
    location: 'Sân D-Pickleball Center',
    courtCount: 2,
    targetMatchesPerPlayer: 7,
    strictAlternatingRest: true,
    status: 'completed',
    registeredPlayerIds: SESSION_1_PLAYERS.map((p) => p.id),
    matches: completedPastOctMatches,
    allowedTypes: ['men_doubles', 'women_doubles', 'mixed_doubles'],
  },
  {
    id: 'session-september-2026',
    name: 'Giải Giao Hữu Mở Rộng Tháng 09/2026',
    date: '2026-09-20',
    time: '18:00 - 21:00',
    location: 'Sân Pickleball Thảo Điền',
    courtCount: 2,
    targetMatchesPerPlayer: 6,
    strictAlternatingRest: true,
    status: 'completed',
    registeredPlayerIds: SESSION_1_PLAYERS.map((p) => p.id),
    matches: completedPastSepMatches,
    allowedTypes: ['men_doubles', 'women_doubles', 'mixed_doubles'],
  },
];
