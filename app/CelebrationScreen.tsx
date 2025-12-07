'use client';

import { useEffect, useRef, useState } from 'react';

interface CelebrationScreenProps {
  isVisible: boolean;
  onComplete: () => void;
}

export function CelebrationScreen({ isVisible, onComplete }: CelebrationScreenProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isVisible) {
      // Play both the animation and sound
      const audio = audioRef.current;
      const video = videoRef.current;

      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(err => console.error('Audio play failed:', err));
      }

      if (video) {
        video.currentTime = 0;
        video.play().catch(err => console.error('Video play failed:', err));
      }

      // Wait for the animation to complete before calling onComplete
      // Adjust timeout based on your toss.gif duration
      const timer = setTimeout(() => {
        onComplete();
      }, 3000); // Adjust this duration to match your gif length

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center">
      {/* Full-screen video */}
      <video
        ref={videoRef}
        src={isMobile ? "/mobile-toss.mp4" : "/toss.mp4"}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted={false}
      />

      {/* Audio element */}
      <audio
        ref={audioRef}
        src="/splash.mp3"
        preload="auto"
      />
    </div>
  );
}
