'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Confetti() {
  const [pieces, setPieces] = useState<{ id: number; x: number; y: number; color: string; rotate: number }[]>([]);

  useEffect(() => {
    const colors = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];
    const newPieces = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -20,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: Math.random() * 360,
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: `${p.x}vw`, y: '-10vh', rotate: p.rotate }}
          animate={{
            y: '110vh',
            rotate: p.rotate + 720,
            x: `${p.x + (Math.random() * 20 - 10)}vw`,
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            ease: [0.23, 0.82, 0.43, 0.95],
          }}
          className="absolute w-2 h-2 rounded-sm"
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}
