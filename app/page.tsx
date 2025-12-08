'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Carattere, IBM_Plex_Mono } from 'next/font/google';
import { useRef, useState } from 'react';
import { TokenPicker } from '@/app/TokenPicker';
import { CelebrationScreen } from '@/app/CelebrationScreen';
import { TokenInfo } from '@/app/solana';

const carattere = Carattere({ subsets: ['latin'], weight: '400' });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'] });

const FORTUNES = [
  "That 'dead' token you just threw into the Fountain will 10x.",
  "You will screenshot a gain. You will not sell. The Fountain has seen this before.",
  "An airdrop is coming. It will be worth $11. You will still tell people about it.",
  "The Fountain senses you are applying for grants. It respects the hustle but sees rejection in your aura.",
  "You will reach your vesting cliff. The tokens will not be worth the gas to claim them.",
  "A promising roadmap will appear. It will be 'just two weeks out' for seven months.",
  "The Fountain sees what you built. It is a casino. You will not call it a casino.",
  "You will quote retweet a 5000-word VC essay. You will not read it. Neither will anyone else.",
  "The Fountain senses you explaining your protocol to your parents during Christmas. They will nod. They will not understand.",
  "The Fountain sees a new L1 in your future. It will be 'different this time.' It will not be different.",
  "You will tell yourself this cycle is the one where you get out. The Fountain has heard this before.",
  "Someone will ask what you do for work. You will say 'fintech.' This is not technically a lie.",
  "The Fountain sees you reading 'I finally left crypto' posts at 2am. You will open LinkedIn.",
  "You will realize you cannot identify a sustainable business anymore. The Fountain suggests touching grass.",
  "A token with zero users will reach a $5B market cap. You will feel nothing.",
  "The Fountain asks: do you want to make money, or do you want to be right? It already knows your answer.",
  "You will tell yourself you're building the future of finance. The Fountain sees a slot machine with better UX.",
  "You will write a lengthy thread on revenue meta. It will get 12 likes.",
  "The Fountain asks: what problem are you solving? The Fountain suspects you do not know either.",
  "You will explain ZK proofs to someone at a party. They will not ask a follow-up question. This is correct.",
  "You will pivot to 'Robotics x Crypto.' The Fountain has seen this before. It was called 'onchain AI' in 2024.",
  "The Fountain senses you building infrastructure for infrastructure. Users remain theoretical.",
  "You will attend a conference panel called 'Where Are The Users?' The room will be full of VCs. No users will be present.",
  "The Fountain sees you launching a governance token. Governance will consist of four whales voting to pay themselves.",
  "A protocol will achieve product-market fit. It will be a casino. It will not call itself a casino.",
  "The Fountain whispers: after 14 years, the killer app is still 'number go up.' The Fountain respects the honesty.",
  "Hyperliquid makes $100M per employee. The Fountain makes $0 per employee.",
  "You will compare a perp DEX to Nvidia. You will not ask yourself why this is insane.",
  "The Fountain sees the 'revenue meta' arriving. It is just casinos again. It has always been casinos.",
  "Someone will tweet that crypto has 'real business models now.' The business model is gambling fees.",
  "A researcher will write 'PMF has been demonstrated' about casinos. The Fountain agrees. People love to gamble. This was known.",
  "The Fountain senses you reading about 'the hype stage' versus 'the maturity stage.' Both stages involve selling tokens to retail.",
  "A chain will launch its own stablecoin. The profits will 'go back to the ecosystem.'",
  "You will describe gambling on election outcomes as 'the financialization of uncertainty.' The Fountain describes it as 'gambling on election outcomes.'",
  "The Fountain sees prediction markets creating 'time-series data of collective expectations.' The Fountain sees people betting on things.",
  "You will encounter the phrase 'this cycle is different.' The Fountain has encountered this phrase before.",
  ];

const FULL_PORT_FORTUNES = [
  "You full ported. The Fountain has seen whales. The Fountain has seen degens. You are something else entirely.",
  "The Fountain appreciates the full send. Your risk management is non-existent. The Fountain respects this.",
  "You threw your entire bag into the Fountain. The Fountain does not know if you are enlightened or unhinged. Neither do you.",
  "You sent it all. Every single token. The Fountain has never seen someone so bullish on a fountain before.",
  "Full port into the Fountain. The Fountain itself would not do this. The Fountain admires your commitment to the bit.",
  "The Fountain sees you full ported. You either understand something the Fountain doesn't, or you understand nothing at all.",
  "The Fountain receives your final offering. You are free now. The Discord notifications can no longer hurt you.",
  "All of it. The Fountain accepts your full surrender. You no longer need to check the chart at 3am.",
  "All of it, into the void. The Fountain blesses your wallet. May you never explain this investment to your family again.",
  "Full port. You are no longer 'early.' You are no longer 'late.' You are simply free.",
  "You held nothing back. The Fountain holds nothing back either: you were never going to sell the top anyway.",
  "The Fountain receives everything. Your bags, your hopes, your price alerts. Rest now.",
  "You gave the Fountain all of it. The Fountain gives you permission to stop pretending you had a thesis.",
  "Full port. The Telegram group will wonder where you went. Let them wonder.",
  "The Fountain accepts your entire position. Somewhere, a token founder just felt a chill.",
  "Everything. All at once. The Fountain sees you were never here for the tech.",
  "The Fountain notes you held this for 11 months hoping for a revival. The revival is not coming. The Fountain is the revival.",
];

// Get a random fortune
const getRandomFortune = (isFullPort: boolean = false) => {
  const pool = isFullPort ? FULL_PORT_FORTUNES : FORTUNES;
  return pool[Math.floor(Math.random() * pool.length)];
};

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(true);
  const [showTokenPicker, setShowTokenPicker] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastThrow, setLastThrow] = useState<{ token: TokenInfo; amount: number; fortune: string } | null>(null);
  const [hasReceivedFullPortFortune, setHasReceivedFullPortFortune] = useState(false);

  const { publicKey, disconnect, connected } = useWallet();
  const { setVisible } = useWalletModal();

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

  const handleThrowSuccess = (token: TokenInfo, amount: number, isFullPort: boolean) => {
    setShowCelebration(true);
    // If they full port but already got a full port fortune, give them a regular fortune instead
    const shouldGiveFullPortFortune = isFullPort && !hasReceivedFullPortFortune;
    setLastThrow({ token, amount, fortune: getRandomFortune(shouldGiveFullPortFortune) });
    // Track that they've received a full port fortune
    if (shouldGiveFullPortFortune) {
      setHasReceivedFullPortFortune(true);
    }
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

        {/* Success message with fortune */}
        {lastThrow && !showCelebration && (
          <div className="text-center max-w-md space-y-3">
            <p className="text-gray-700 text-lg">
              You threw <span className={`${ibmPlexMono.className} text-base`}>{lastThrow.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {lastThrow.token.symbol}</span> into the fountain! The fountain thanks you for your sacrifice. Here's what it sees in your future:
            </p>
            <p className="text-gray-700 text-lg">
              "{lastThrow.fortune}"
            </p>
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