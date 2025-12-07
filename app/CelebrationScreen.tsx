'use client';

import { useEffect } from 'react';

interface CelebrationScreenProps {
  isVisible: boolean;
  onComplete: () => void;
}

export function CelebrationScreen({ isVisible, onComplete }: CelebrationScreenProps) {
  useEffect(() => {
    if (isVisible) {
      // Hide the celebration screen just before the GIF loops back
      // Adjust this duration to match your GIF length exactly (slightly less to avoid the loop)
      const timer = setTimeout(() => {
        onComplete();
      }, 2900); // Reduced slightly to hide before the loop starts

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      {/* GIF Overlay */}
      <img
        src="/toss.gif"
        alt="Celebration"
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
}
