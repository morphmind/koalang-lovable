
import React from 'react';
import koalyAvatar from '../assets/images/koaly-avatar.png';

export interface AnimatedKoalyProps {
  isSpeaking: boolean;
}

export const AnimatedKoaly: React.FC<AnimatedKoalyProps> = ({ isSpeaking }) => {
  return (
    <div className={`w-full h-full relative ${isSpeaking ? 'animate-pulse' : ''}`}>
      <img
        src={koalyAvatar}
        alt="Koaly Avatar"
        className="w-full h-full object-contain"
      />
    </div>
  );
};

