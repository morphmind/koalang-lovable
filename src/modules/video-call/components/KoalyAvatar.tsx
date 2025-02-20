import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface KoalyAvatarProps {
  state: 'idle' | 'talking' | 'listening' | 'happy' | 'thinking';
  isVideoOn: boolean;
}

export const KoalyAvatar: React.FC<KoalyAvatarProps> = ({ state, isVideoOn }) => {
  // Avatar durumuna göre animasyon varyantları
  const variants = {
    idle: {
      scale: 1,
      rotate: 0
    },
    talking: {
      scale: [1, 1.05, 1],
      rotate: [-1, 1, -1],
      transition: {
        repeat: Infinity,
        duration: 0.5
      }
    },
    listening: {
      scale: 1.02,
      rotate: 0,
      transition: {
        repeat: Infinity,
        duration: 1
      }
    },
    happy: {
      scale: [1, 1.2, 1],
      rotate: [-5, 5, -5],
      transition: {
        duration: 0.5
      }
    },
    thinking: {
      scale: 1,
      rotate: [0, -5, 0],
      transition: {
        repeat: Infinity,
        duration: 2
      }
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <AnimatePresence>
        {!isVideoOn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-bs-navy/90"
          />
        )}
      </AnimatePresence>

      <motion.div
        className="relative z-10 w-64 h-64"
        variants={variants}
        animate={state}
      >
        {/* Koaly'nin avatarı */}
        <div className="w-full h-full rounded-full bg-bs-primary flex items-center justify-center">
          <img
            src="/koaly-avatar.png"
            alt="Koaly"
            className="w-48 h-48 object-contain"
          />
        </div>

        {/* Durum göstergesi */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-4 py-2 shadow-lg">
          <span className="text-sm font-medium text-bs-navy">
            {state === 'idle' && 'Bekleniyor...'}
            {state === 'talking' && 'Konuşuyor'}
            {state === 'listening' && 'Dinliyor'}
            {state === 'happy' && '😊'}
            {state === 'thinking' && 'Düşünüyor...'}
          </span>
        </div>
      </motion.div>
    </div>
  );
};
