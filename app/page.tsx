'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Carattere } from 'next/font/google';
import { useRef, useState } from 'react';
import { TokenPicker } from '@/app/TokenPicker';
import { TokenInfo } from '@/app/solana';

const carattere = Carattere({ subsets: ['latin'], weight: '400' });

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(true);
  const [showTokenPicker, setShowTokenPicker] = useState(false);
  const [lastThrow, setLastThrow] = useState<{ token: TokenInfo; amount: number } | null>(null);

  const { publicKey, disconnect, connected } = useWallet();
  const { setVisible } = useWalletModal();

  const toggleSound = () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;
    const nextMuted = !muted;
    video.muted = nextMuted;
    if (video.paused) video.play();
    if (audio) {
      audio.muted = nextMuted;
      if (!nextMuted) {
        audio.loop = true;
        audio.play();
      } else {
        audio.pause();
      }
    }
    setMuted(nextMuted);
  };

  const handleWalletClick = () => {
    if (connected) {
      disconnect();
    } else {
      setVisible(true);
    }
  };

  const handleThrowClick = () => {
    if (!connected) {
      setVisible(true);
    } else {
      setShowTokenPicker(true);
    }
  };

  const handleThrowSuccess = (token: TokenInfo, amount: number) => {
    setLastThrow({ token, amount });
    // TODO: Play splash animation/sound
    // TODO: Show success message
    setTimeout(() => setLastThrow(null), 5000);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start px-8 pb-36 sm:pb-12 pt-24 sm:pt-28 relative overflow-hidden">
      {/* Top controls */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-8 flex items-center gap-6 z-30">
        <button
          onClick={toggleSound}
          className="text-lg text-black underline decoration-1 decoration-black hover:opacity-70 transition"
          aria-label={muted ? 'Unmute fountain' : 'Mute fountain'}
          type="button"
        >
          {muted ? 'Sound off' : 'Sound on'}
        </button>

        <button
          onClick={handleWalletClick}
          className="text-lg text-black underline decoration-1 decoration-black hover:opacity-70 transition font-normal"
          aria-label={connected ? 'Disconnect wallet' : 'Connect wallet'}
        >
          {connected && publicKey
            ? truncateAddress(publicKey.toString())
            : 'Connect wallet'}
        </button>
      </div>

      {/* Cherub - desktop */}
      <div className="hidden sm:block sm:fixed sm:bottom-0 sm:right-0 pointer-events-none">
        <img src="/cherub.png" alt="" className="w-24 h-auto" />
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center gap-5 z-10">

        {/* Title */}
        <h1 className={`${carattere.className} text-5xl sm:text-6xl italic text-gray-800 text-center whitespace-nowrap`}>
          Shitcoin Fountain
        </h1>

        {/* Fountain */}
        <div className="my-4 flex flex-col items-center gap-3">
          <video
            ref={videoRef}
            src="/fountain.webm"
            className="w-64 h-auto rounded-lg relative z-10"
            autoPlay
            loop
            muted={muted}
            playsInline
          />
          <audio
            ref={audioRef}
            src="/fountain.mp3"
            muted={muted}
            loop
            aria-hidden="true"
          />
        </div>

        {/* Tagline */}
        <p className="text-center text-gray-700 text-lg max-w-md">
          Throw a shitcoin.<br />
          Make a wish.
        </p>

        {/* Success message */}
        {lastThrow && (
          <div className="text-center text-green-600 text-sm animate-pulse">
            🌟 You threw {lastThrow.amount.toLocaleString()} {lastThrow.token.symbol} into the fountain!
          </div>
        )}

        {/* Throw button */}
        <button
          type="button"
          onClick={handleThrowClick}
          className="relative w-45 hover:scale-105 transition"
          aria-label="Throw a Shitcoin"
        >
          <img
            src="/button.png"
            alt=""
            className="block w-full h-auto"
          />
          <span className="absolute inset-0 flex items-center justify-center text-black font-semibold drop-shadow">
            Throw a Shitcoin
          </span>
        </button>

        {/* Mobile garnish row */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 px-6 pointer-events-none">
          <div className="flex items-end justify-between">
            <img src="/flowers.png" alt="" className="w-24 h-24" />
            <img src="/cherub.png" alt="" className="w-20 h-auto" />
          </div>
        </div>

      </div>

      {/* Flowers - desktop */}
      <div className="hidden sm:block sm:fixed sm:bottom-0 sm:left-0 pointer-events-none">
        <img src="/flowers.png" alt="" className="w-32 h-32" />
      </div>

      {/* Token Picker Modal */}
      <TokenPicker
        isOpen={showTokenPicker}
        onClose={() => setShowTokenPicker(false)}
        onSuccess={handleThrowSuccess}
      />
    </div>
  );
}