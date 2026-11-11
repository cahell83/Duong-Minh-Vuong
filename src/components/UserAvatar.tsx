import React from 'react';
import { Player } from '../types/pickleball';

interface UserAvatarProps {
  player?: Pick<Player, 'name' | 'avatarUrl' | 'avatarColor' | 'gender'>;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-3xl',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  player,
  size = 'md',
  className = '',
}) => {
  if (!player) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-slate-800 flex items-center justify-center text-slate-500 font-bold shrink-0 ${className}`}
      >
        ?
      </div>
    );
  }

  const defaultGradient =
    player.avatarColor ||
    (player.gender === 'female'
      ? 'from-pink-500 to-rose-600'
      : 'from-lime-400 to-emerald-600');

  if (player.avatarUrl) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden shrink-0 border border-slate-700/80 shadow-md bg-slate-800 ${className}`}
      >
        <img
          src={player.avatarUrl}
          alt={player.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // fallback if image fails to load
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr ${defaultGradient} flex items-center justify-center font-black text-white shrink-0 shadow-md ${className}`}
    >
      {player.name ? player.name.charAt(0).toUpperCase() : 'P'}
    </div>
  );
};
