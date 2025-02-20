import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TalkingKoalyProps {
  isTalking?: boolean;
}

export const TalkingKoaly: React.FC<TalkingKoalyProps> = ({ isTalking = true }) => {
  const [mouthHeight, setMouthHeight] = useState(10);

  useEffect(() => {
    if (isTalking) {
      const interval = setInterval(() => {
        setMouthHeight(Math.random() * 15 + 5); // 5-20 arası rastgele değer
      }, 150); // Her 150ms'de bir güncelle

      return () => clearInterval(interval);
    }
  }, [isTalking]);

  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Yüz */}
      <circle cx="100" cy="100" r="90" fill="#4B5563" />
      
      {/* Gözler */}
      <circle cx="70" cy="80" r="15" fill="white" />
      <circle cx="130" cy="80" r="15" fill="white" />
      
      {/* Yanaklar */}
      <circle cx="60" cy="110" r="10" fill="#F87171" opacity="0.6" />
      <circle cx="140" cy="110" r="10" fill="#F87171" opacity="0.6" />
      
      {/* Animasyonlu Ağız */}
      <motion.path
        d={`M 70,120 Q 100,${120 + mouthHeight} 130,120`}
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        animate={{ d: `M 70,120 Q 100,${120 + mouthHeight} 130,120` }}
        transition={{ duration: 0.15 }}
      />
    </svg>
  );
};
