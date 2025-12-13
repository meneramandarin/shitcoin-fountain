'use client';

import { useAccount, useDisconnect, useConnect } from 'wagmi';
import { useConnectors } from 'wagmi';
import { Carattere, IBM_Plex_Mono } from 'next/font/google';
import { useRef, useState, useEffect } from 'react';
import { TokenPicker, TokenImage } from './TokenPicker';
import { CelebrationScreen } from '@/app/CelebrationScreen';
import { TokenInfo, fetchWalletTokens, FOUNTAIN_ADDRESS } from './evm';
import { BaseProviders } from './providers';
import sdk from '@farcaster/miniapp-sdk';

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

// Helper function to format large numbers with K, M, B, T suffixes
const formatNumber = (num: number): string => {
  if (num >= 1_000_000_000_000) {
    return (num / 1_000_000_000_000).toFixed(2).replace(/\.00$/, '') + 'T';
  }
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2).replace(/\.00$/, '') + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(2).replace(/\.00$/, '') + 'K';
  }
  return num.toFixed(2).replace(/\.00$/, '');
};

// Stats tracking
interface TokenStats {
  symbol: string;
  name: string;
  image: string;
  imageFallbacks: string[];
  amount: number;
}

const updateUserStats = (token: TokenInfo, amount: number) => {
  const stats = JSON.parse(localStorage.getItem('userStatsBase') || '{}');
  const existing = stats[token.symbol];

  if (existing) {
    if (typeof existing === 'number') {
      stats[token.symbol] = {
        symbol: token.symbol,
        name: token.name,
        image: token.image,
        imageFallbacks: token.imageFallbacks,
        amount: existing + amount,
      };
    } else {
      existing.amount += amount;
      // Update image URLs in case they changed
      existing.image = token.image;
      existing.imageFallbacks = token.imageFallbacks;
    }
  } else {
    stats[token.symbol] = {
      symbol: token.symbol,
      name: token.name,
      image: token.image,
      imageFallbacks: token.imageFallbacks,
      amount: amount,
    };
  }
  localStorage.setItem('userStatsBase', JSON.stringify(stats));
};

const getUserTopTokens = (): TokenStats[] => {
  const stats = JSON.parse(localStorage.getItem('userStatsBase') || '{}');
  return Object.values(stats)
    .filter((token: any) => typeof token === 'object' && token.amount !== undefined)
    .map((token: any) => ({
      ...token,
      // Ensure imageFallbacks exists for older localStorage entries
      imageFallbacks: token.imageFallbacks || [token.image].filter(Boolean),
    }))
    .sort((a: any, b: any) => b.amount - a.amount)
    .slice(0, 3) as TokenStats[];
};

const getUserTotalThrown = (): number => {
  const stats = JSON.parse(localStorage.getItem('userStatsBase') || '{}');
  return Object.values(stats).reduce((sum: number, token: any) => {
    const amount = typeof token === 'number' ? token : token.amount || 0;
    return sum + amount;
  }, 0);
};

function BasePage() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const screenshotRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);
  const [showTokenPicker, setShowTokenPicker] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastThrow, setLastThrow] = useState<{
    token: TokenInfo;
    amount: number;
    fortune: string;
  } | null>(null);
  const [hasReceivedFullPortFortune, setHasReceivedFullPortFortune] = useState(false);
  const [fountainTokens, setFountainTokens] = useState<TokenInfo[]>([]);

  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect } = useConnect();
  const connectors = useConnectors();
  const [mounted, setMounted] = useState(false);

  // Handle client-side mounting to prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // Signal ready to Farcaster mini app SDK
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  // Fetch fountain tokens on mount
  useEffect(() => {
    if (FOUNTAIN_ADDRESS !== '0x0000000000000000000000000000000000000000') {
      fetchWalletTokens(FOUNTAIN_ADDRESS)
        .then((tokens) => {
          const sortedTokens = [...tokens].sort((a, b) => b.balance - a.balance);
          setFountainTokens(sortedTokens);
        })
        .catch((err) => console.error('Failed to fetch fountain tokens:', err));
    }
  }, []);

  const toggleSound = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextMuted = !muted;
    audio.muted = nextMuted;
    setMuted(nextMuted);

    if (!nextMuted) {
      audio.currentTime = 0;
      audio.play();

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
    if (isConnected) {
      disconnect();
    } else {
      // Connect with first available connector
      const connector = connectors[0];
      if (connector) {
        connect({ connector });
      }
    }
  };

  const handleThrowClick = () => {
    if (!isConnected) {
      const connector = connectors[0];
      if (connector) {
        connect({ connector });
      }
    } else {
      setShowTokenPicker(true);
    }
  };

  const handleThrowSuccess = (token: TokenInfo, amount: number, isFullPort: boolean) => {
    setShowCelebration(true);
    const shouldGiveFullPortFortune = isFullPort && !hasReceivedFullPortFortune;
    setLastThrow({ token, amount, fortune: getRandomFortune(shouldGiveFullPortFortune) });
    if (shouldGiveFullPortFortune) {
      setHasReceivedFullPortFortune(true);
    }
    updateUserStats(token, amount);
    // Refetch fountain tokens after a delay
    setTimeout(() => {
      if (FOUNTAIN_ADDRESS !== '0x0000000000000000000000000000000000000000') {
        fetchWalletTokens(FOUNTAIN_ADDRESS)
          .then((tokens) => {
            const sortedTokens = [...tokens].sort((a, b) => b.balance - a.balance);
            setFountainTokens(sortedTokens);
          })
          .catch((err) => console.error('Failed to fetch fountain tokens:', err));
      }
    }, 3000);
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleShareOnX = async () => {
    if (!lastThrow || !screenshotRef.current) {
      console.error('No throw data or screenshot ref available');
      return;
    }

    try {
      console.log('Starting template-based share image generation...');

      let html2canvas;
      try {
        const module = await import('html2canvas');
        html2canvas = module.default || module;
      } catch (importErr) {
        console.error('Failed to import html2canvas:', importErr);
        throw new Error('Failed to load screenshot library');
      }

      const statsBox = screenshotRef.current.querySelector('[data-stats-box]') as HTMLElement;

      if (!statsBox) {
        throw new Error('Stats box not found in DOM');
      }

      const statsCanvas = await html2canvas(statsBox, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        onclone: (clonedDoc) => {
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            const computedStyle = window.getComputedStyle(el);

            if (computedStyle.color.includes('lab(')) {
              htmlEl.style.color = 'rgb(0, 0, 0)';
            }

            if (computedStyle.backgroundColor.includes('lab(')) {
              htmlEl.style.backgroundColor = 'rgb(255, 255, 255)';
            }

            if (computedStyle.borderColor.includes('lab(')) {
              htmlEl.style.borderColor = 'rgb(209, 213, 219)';
            }
          });

          const clonedElement = clonedDoc.querySelector('[data-stats-box]');
          if (clonedElement) {
            const gray500Elements = clonedElement.querySelectorAll('.text-gray-500');
            gray500Elements.forEach((el) => {
              (el as HTMLElement).style.color = 'rgb(107, 114, 128)';
            });

            const gray600Elements = clonedElement.querySelectorAll('.text-gray-600');
            gray600Elements.forEach((el) => {
              (el as HTMLElement).style.color = 'rgb(75, 85, 99)';
            });

            const gray700Elements = clonedElement.querySelectorAll('.text-gray-700');
            gray700Elements.forEach((el) => {
              (el as HTMLElement).style.color = 'rgb(55, 65, 81)';
            });

            const gray800Elements = clonedElement.querySelectorAll('.text-gray-800');
            gray800Elements.forEach((el) => {
              (el as HTMLElement).style.color = 'rgb(31, 41, 55)';
            });

            const borderGray200Elements = clonedElement.querySelectorAll('.border-gray-200');
            borderGray200Elements.forEach((el) => {
              (el as HTMLElement).style.borderColor = 'rgb(229, 231, 235)';
            });

            const borderGray300Elements = clonedElement.querySelectorAll('.border-gray-300');
            borderGray300Elements.forEach((el) => {
              (el as HTMLElement).style.borderColor = 'rgb(209, 213, 219)';
            });

            const bgWhiteElements = clonedElement.querySelectorAll('.bg-white');
            bgWhiteElements.forEach((el) => {
              (el as HTMLElement).style.backgroundColor = 'rgb(255, 255, 255)';
            });

            const bgGray200Elements = clonedElement.querySelectorAll('.bg-gray-200');
            bgGray200Elements.forEach((el) => {
              (el as HTMLElement).style.backgroundColor = 'rgb(229, 231, 235)';
            });

            const bgGray300Elements = clonedElement.querySelectorAll('.bg-gray-300');
            bgGray300Elements.forEach((el) => {
              (el as HTMLElement).style.backgroundColor = 'rgb(209, 213, 219)';
            });
          }
        },
      });

      const templateImg = new Image();
      templateImg.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        templateImg.onload = () => {
          console.log('Template image loaded successfully');
          resolve(null);
        };
        templateImg.onerror = (err) => {
          console.error('Template image failed to load:', err);
          reject(
            new Error(
              'Failed to load template image. Please check if /ShareButton.png exists in public folder.'
            )
          );
        };
        console.log('Attempting to load template image from: /ShareButton.png');
        templateImg.src = '/ShareButton.png';
      });

      const canvas = document.createElement('canvas');
      canvas.width = templateImg.width;
      canvas.height = templateImg.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Failed to get canvas context');

      ctx.drawImage(templateImg, 0, 0);

      ctx.fillStyle = '#000000';
      ctx.font = 'italic 35px Georgia, serif';
      ctx.textAlign = 'left';

      const quoteX = canvas.width * 0.08;
      const quoteStartY = canvas.height * 0.27;
      const maxWidth = canvas.width * 0.28;
      const lineHeight = 43;
      const words = lastThrow.fortune.split(' ');
      let line = '';

      const lines: string[] = [];
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
          lines.push(line);
          line = words[i] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      lines.forEach((textLine, index) => {
        let textToDraw = textLine.trim();
        if (index === 0) textToDraw = '"' + textToDraw;
        if (index === lines.length - 1) textToDraw = textToDraw + '"';
        ctx.fillText(textToDraw, quoteX, quoteStartY + index * lineHeight);
      });

      const statsBoxWidth = statsCanvas.width;
      const statsBoxHeight = statsCanvas.height;
      const statsBoxX = (canvas.width - statsBoxWidth) / 2;
      const statsBoxY = canvas.height * (2 / 3) + (canvas.height / 3 - statsBoxHeight) / 2;

      ctx.drawImage(statsCanvas, statsBoxX, statsBoxY);

      console.log('Template image generated with overlay');

      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error('Failed to create blob from canvas');
          alert('Failed to create image. Please try again.');
          return;
        }

        console.log('Blob created:', blob.size, 'bytes');

        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob,
            }),
          ]);

          console.log('Image copied to clipboard!');

          const tweetText = encodeURIComponent(
            'I threw my shitcoins into a fountain ✨🪙\n\nshitcoinfountain.fun/base'
          );
          window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
        } catch (clipboardErr) {
          console.error('Clipboard error:', clipboardErr);
          alert('Failed to copy image to clipboard. Please try again.');
        }
      }, 'image/png');
    } catch (err) {
      console.error('Share image generation error:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error details:', {
        message: errorMessage,
        stack: err instanceof Error ? err.stack : undefined,
      });
      alert(`Failed to generate share image: ${errorMessage}`);
    }
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
          aria-label={isConnected ? 'Disconnect wallet' : 'Connect wallet'}
        >
          {mounted && isConnected && address ? truncateAddress(address) : 'Connect wallet'}
        </button>
      </div>

      {/* Cherub - desktop */}
      <div className="hidden sm:block sm:fixed sm:bottom-0 sm:right-0 pointer-events-none">
        <img src="/cherub.png" alt="" className="w-24 h-auto" />
      </div>

      {/* Main content */}
      <div
        ref={screenshotRef}
        data-screenshot
        className="flex flex-col items-center gap-8 z-10 bg-white px-12 py-10"
      >
        {/* Title */}
        <h1
          className={`${carattere.className} text-5xl sm:text-6xl italic text-gray-800 text-center whitespace-nowrap`}
        >
          Shitcoin Fountain
        </h1>

        {/* Fountain */}
        <div className="flex flex-col items-center gap-3">
          <img
            src="/fountain.gif"
            alt="Fountain animation"
            className="w-64 h-auto rounded-lg relative z-10"
          />
          <audio ref={audioRef} src="/fountain.mp3" muted={muted} aria-hidden="true" />
        </div>

        {/* Tagline */}
        {!showCelebration && !lastThrow && (
          <p className="text-center text-gray-700 text-lg max-w-md">
            Throw a shitcoin.
            <br />
            Make a wish.
          </p>
        )}

        {/* Success message with stats */}
        {lastThrow && !showCelebration && (
          <div className="w-full max-w-4xl space-y-6">
            {/* Fortune */}
            <div className="max-w-md mx-auto space-y-3">
              <p className="text-gray-500 text-sm text-center">
                You threw{' '}
                <span className={`${ibmPlexMono.className} text-xs`}>
                  {lastThrow.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}{' '}
                  {lastThrow.token.symbol}
                </span>{' '}
                into the fountain! The fountain accepts your offering and glimpses into your future:
              </p>
              <div className="border-2 border-gray-300 rounded-lg p-5 bg-white shadow-sm">
                <p className="text-gray-700 text-lg text-center">"{lastThrow.fortune}"</p>
              </div>
            </div>

            {/* Stats side by side in one box */}
            <div
              data-stats-box
              className="border-2 border-gray-300 rounded-lg p-5 bg-white shadow-sm"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {/* User Stats */}
                <div>
                  <h3 className="text-gray-800 font-semibold text-sm mb-3">Your Offerings</h3>
                  <div className="space-y-2">
                    {getUserTopTokens().map((token, index) => (
                      <div key={token.symbol} className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">#{index + 1}</span>
                        <TokenImage token={token} className="w-5 h-5 rounded-full bg-gray-200" />
                        <span className="text-gray-700 flex-1">{token.symbol}</span>
                        <span className={`${ibmPlexMono.className} text-xs text-gray-700`}>
                          {formatNumber(token.amount)}
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-semibold">
                      <span className="text-gray-700">Total Thrown</span>
                      <span className={`${ibmPlexMono.className} text-xs text-gray-800`}>
                        {formatNumber(getUserTotalThrown())}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Global Stats */}
                <div>
                  <h3 className="text-gray-800 font-semibold text-sm mb-3">
                    The Fountain's Treasury
                  </h3>
                  <div className="space-y-2">
                    {fountainTokens.slice(0, 3).map((token, index) => (
                      <div key={token.address} className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">#{index + 1}</span>
                        <TokenImage token={token} className="w-5 h-5 rounded-full bg-gray-200" />
                        <span className="text-gray-700 flex-1">{token.symbol}</span>
                        <span className={`${ibmPlexMono.className} text-xs text-gray-700`}>
                          {formatNumber(token.balance)}
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-semibold">
                      <span className="text-gray-700">Total Tokens</span>
                      <span className={`${ibmPlexMono.className} text-xs text-gray-800`}>
                        {formatNumber(
                          fountainTokens.reduce((sum, token) => sum + token.balance, 0)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Throw button */}
        {!showCelebration && !lastThrow && (
          <button
            type="button"
            onClick={handleThrowClick}
            className="relative w-45 hover:scale-105 transition"
            aria-label="Throw a Shitcoin"
          >
            <img src="/button.png" alt="" className="block w-full h-auto" />
            <span className="absolute inset-0 flex items-center justify-center text-black font-semibold drop-shadow">
              Throw a Shitcoin
            </span>
          </button>
        )}
      </div>

      {/* Share on X button */}
      {lastThrow && !showCelebration && (
        <div className="hidden sm:flex justify-end max-w-md w-full z-10 -mt-5">
          <button
            onClick={handleShareOnX}
            className="text-xs text-gray-600 hover:text-black underline transition"
            type="button"
          >
            Copy image & share on X
          </button>
        </div>
      )}

      {/* Do it again button */}
      {lastThrow && !showCelebration && (
        <button
          type="button"
          onClick={handleThrowClick}
          className="relative w-45 hover:scale-105 transition z-10 mt-3"
          aria-label="Do it again!"
        >
          <img src="/button.png" alt="" className="block w-full h-auto" />
          <span className="absolute inset-0 flex items-center justify-center text-black font-semibold drop-shadow">
            Do it again!
          </span>
        </button>
      )}

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
      <CelebrationScreen isVisible={showCelebration} onComplete={handleCelebrationComplete} />
    </div>
  );
}

export default function BasePageWrapper() {
  return (
    <BaseProviders>
      <BasePage />
    </BaseProviders>
  );
}
