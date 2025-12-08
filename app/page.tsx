'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Carattere } from 'next/font/google';
import { useRef, useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TokenPicker } from '@/app/TokenPicker';
import { CelebrationScreen } from '@/app/CelebrationScreen';
import { TokenInfo } from '@/app/solana';

const carattere = Carattere({ subsets: ['latin'], weight: '400' });

function HomeContent() {
  const searchParams = useSearchParams();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(true);
  const [showTokenPicker, setShowTokenPicker] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastThrow, setLastThrow] = useState<{ token: TokenInfo; amount: number } | null>(null);

  const { publicKey, disconnect, connected } = useWallet();
  const { setVisible } = useWalletModal();

  // Development mode: URL query params for testing UI states
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const showCelebrationParam = searchParams.get('celebration');
    const showSuccessParam = searchParams.get('success');

    if (showCelebrationParam === 'true') {
      setShowCelebration(true);
    }

    if (showSuccessParam === 'true') {
      const tokenSymbol = searchParams.get('token') || 'BONK';
      const tokenAmount = parseInt(searchParams.get('amount') || '1000');

      setLastThrow({
        token: {
          mint: 'mock-mint-address',
          symbol: tokenSymbol,
          name: tokenSymbol,
          image: '',
          balance: tokenAmount,
          decimals: 6,
          usdValue: undefined
        },
        amount: tokenAmount
      });
    }
  }, [searchParams]);

  const toggleSound = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextMuted = !muted;
    audio.muted = nextMuted;
    setMuted(nextMuted);

    if (!nextMuted) {
      audio.currentTime = 0;
      audio.play();

      // Replay every 6.8 seconds for seamless loop
      const interval = setInterval(() => {
        const audio = audioRef.current;
        if (audio && !audio.muted) {
          audio.currentTime = 0;
          audio.play();
        } else {
          clearInterval(interval);
        }
      }, 6800);
    } else {
      audio.pause();
    }
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
    setShowCelebration(true);
    setLastThrow({ token, amount });
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    // Success message stays visible (lastThrow is not cleared)
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
        <div className="flex flex-col items-center gap-3">
          <img
            src="/fountain.gif"
            alt="Fountain animation"
            className="w-64 h-auto rounded-lg relative z-10"
          />
          <audio
            ref={audioRef}
            src="/fountain.mp3"
            muted={muted}
            aria-hidden="true"
          />
        </div>

        {/* Tagline - only show if no celebration or success message */}
        {!showCelebration && !lastThrow && (
          <p className="text-center text-gray-700 text-lg max-w-md">
            Throw a shitcoin.<br />
            Make a wish.
          </p>
        )}

        {/* Success message */}
        {lastThrow && !showCelebration && (
          <div className="text-center text-green-600 text-sm animate-pulse">
            🌟 You threw {lastThrow.amount.toLocaleString()} {lastThrow.token.symbol} into the fountain!
          </div>
        )}

        {/* Throw button - only show if no celebration or success message */}
        {!showCelebration && !lastThrow && (
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
        )}

        {/* Do it again button - show after success message */}
        {lastThrow && !showCelebration && (
          <button
            type="button"
            onClick={handleThrowClick}
            className="relative w-45 hover:scale-105 transition"
            aria-label="Do it again!"
          >
            <img
              src="/button.png"
              alt=""
              className="block w-full h-auto"
            />
            <span className="absolute inset-0 flex items-center justify-center text-black font-semibold drop-shadow">
              Do it again!
            </span>
          </button>
        )}

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

      {/* Celebration Screen */}
      <CelebrationScreen
        isVisible={showCelebration}
        onComplete={handleCelebrationComplete}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <HomeContent />
    </Suspense>
  );
}