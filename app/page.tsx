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
      
      {/* Cherub - bottom right */}
      <div className="fixed bottom-0 right-0">
        <img src="/cherub.png" alt="" className="w-24 h-auto" />
      </div>

      {/* Sound toggle - top right */}
      <button
        onClick={toggleSound}
        className="absolute top-8 right-8 hover:scale-105 transition"
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

      {/* Main content */}
      <div className="flex flex-col items-center gap-5 z-10">
        
        {/* Title */}
        <h1 className={`${carattere.className} text-6xl italic text-gray-800`}>
          Shitcoin Fountain
        </h1>

        {/* Fountain */}
        <div className="my-4 flex flex-col items-center gap-3">
          <video
            ref={videoRef}
            src="/fountain.webm"
            className="w-64 h-auto rounded-lg"
            autoPlay
            loop
            muted={muted}
            playsInline
          />
        </div>

        {/* Flowers - offset left between fountain and copy */}
        <div className="self-start -ml-4 -mt-20">
          <img src="/flowers.png" alt="" className="w-32 h-32" />
        </div>

        {/* Tagline */}
        <p className="text-center text-gray-700 text-lg max-w-md">
          Rid yourself of dust.<br />
          Throw it in the wishing well.
        </p>

        {/* Connect Wallet Button */}
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
    </div>
  );
}
