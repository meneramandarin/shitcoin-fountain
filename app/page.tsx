'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Carattere } from 'next/font/google';
import { useRef, useState } from 'react';

const carattere = Carattere({ subsets: ['latin'], weight: '400' });

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !muted;
    video.muted = nextMuted;
    if (video.paused) video.play();
    setMuted(nextMuted);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Top controls */}
      <div className="hidden sm:flex absolute top-8 right-8 items-center gap-4 z-20">
        <button
          onClick={toggleSound}
          className="relative hover:scale-105 transition"
          aria-label={muted ? 'Unmute fountain' : 'Mute fountain'}
          type="button"
        >
          <img
            src="/unmute.png"
            alt=""
            className={`w-10 h-10 ${muted ? 'opacity-60' : 'opacity-100'}`}
          />
          {muted && (
            <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="block w-12 h-1 bg-red-500 rotate-45 rounded-full" />
            </span>
          )}
        </button>

        <ConnectButton.Custom>
          {({
            account,
            chain,
            mounted,
            openAccountModal,
            openChainModal,
            openConnectModal,
          }) => {
            const ready = mounted;
            const connected = ready && account && chain && !chain.unsupported;

            const handleClick = () => {
              if (!ready) return;
              if (chain && chain.unsupported) return openChainModal();
              if (connected) return openAccountModal();
              return openConnectModal();
            };

            return (
              <button
                onClick={handleClick}
                className="relative w-45 hover:scale-105 transition"
                aria-label="Connect wallet"
              >
                <img
                  src="/button.png"
                  alt=""
                  className="block w-full h-auto"
                />
                <span className="absolute inset-0 flex items-center justify-center text-black font-semibold drop-shadow">
                  {connected ? account.displayName : 'Connect Wallet'}
                </span>
              </button>
            );
          }}
        </ConnectButton.Custom>
      </div>

      {/* Cherub - desktop */}
      <div className="hidden sm:block sm:fixed sm:bottom-0 sm:right-0 pointer-events-none">
        <img src="/cherub.png" alt="" className="w-24 h-auto" />
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center gap-5 z-10">
        
        {/* Mobile controls */}
        <div className="sm:hidden w-full flex items-center justify-center gap-4 mt-2">
          <button
            onClick={toggleSound}
            className="relative hover:scale-105 transition"
            aria-label={muted ? 'Unmute fountain' : 'Mute fountain'}
            type="button"
          >
            <img
              src="/unmute.png"
              alt=""
              className={`w-10 h-10 ${muted ? 'opacity-60' : 'opacity-100'}`}
            />
            {muted && (
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="block w-12 h-1 bg-red-500 rotate-45 rounded-full" />
              </span>
            )}
          </button>

          <ConnectButton.Custom>
            {({
              account,
              chain,
              mounted,
              openAccountModal,
              openChainModal,
              openConnectModal,
            }) => {
              const ready = mounted;
              const connected = ready && account && chain && !chain.unsupported;

              const handleClick = () => {
                if (!ready) return;
                if (chain && chain.unsupported) return openChainModal();
                if (connected) return openAccountModal();
                return openConnectModal();
              };

              return (
                <button
                  onClick={handleClick}
                  className="relative w-45 hover:scale-105 transition"
                  aria-label="Connect wallet"
                >
                  <img
                    src="/button.png"
                    alt=""
                    className="block w-full h-auto"
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-black font-semibold drop-shadow">
                    {connected ? account.displayName : 'Connect Wallet'}
                  </span>
                </button>
              );
            }}
          </ConnectButton.Custom>
        </div>

        {/* Title */}
        <h1 className={`${carattere.className} text-6xl italic text-gray-800 text-center`}>
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
        </div>

        {/* Tagline */}
        <p className="text-center text-gray-700 text-lg max-w-md">
          Rid yourself of dust.<br />
          Throw it in the wishing well.
        </p>

        {/* Throw button */}
        <button
          type="button"
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
        <div className="w-full max-w-md px-6 sm:hidden pointer-events-none">
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
    </div>
  );
}
