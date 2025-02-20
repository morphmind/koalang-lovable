import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedKoalyProps {
  className?: string;
}

export const AnimatedKoaly: React.FC<AnimatedKoalyProps> = ({ className }) => {
  const [mouthState, setMouthState] = useState({
    controlY: 346,
    startY: 316,
    endY: 316
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // Ağzın açıklığını rastgele değiştir (15-35 arası)
      const openness = Math.random() * 20 + 15;
      
      // Kontrol noktasını ve bitiş noktalarını ayarla
      setMouthState({
        controlY: 316 + openness,
        startY: 316 - openness/3,
        endY: 316 - openness/3
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Arka plan daire */}
      <circle cx="256" cy="256" r="256" fill="#E5E7EB"/>
      
      {/* Koala yüzü */}
      <circle cx="256" cy="256" r="200" fill="#4B5563"/>
      
      {/* Kulaklar */}
      <circle cx="156" cy="156" r="50" fill="#374151"/>
      <circle cx="356" cy="156" r="50" fill="#374151"/>
      
      {/* Gözler */}
      <circle cx="206" cy="236" r="30" fill="white"/>
      <circle cx="306" cy="236" r="30" fill="white"/>
      <circle cx="206" cy="236" r="15" fill="#111827"/>
      <circle cx="306" cy="236" r="15" fill="#111827"/>
      
      {/* Burun */}
      <circle cx="256" cy="286" r="25" fill="#374151"/>
      
      {/* Animasyonlu Ağız */}
      <motion.path
        d={`M216 ${mouthState.startY} Q256 ${mouthState.controlY} 296 ${mouthState.endY}`}
        stroke="#374151"
        strokeWidth="8"
        fill="#1F2937"
        animate={{ 
          d: `M216 ${mouthState.startY} Q256 ${mouthState.controlY} 296 ${mouthState.endY}` 
        }}
        transition={{ duration: 0.15 }}
      />
      
      {/* Yanaklar */}
      <circle cx="186" cy="286" r="20" fill="#F87171" fillOpacity="0.5"/>
      <circle cx="326" cy="286" r="20" fill="#F87171" fillOpacity="0.5"/>
    </svg>
  );
};
