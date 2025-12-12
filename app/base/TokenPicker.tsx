'use client';

import { useState, useEffect } from 'react';
import { Buenard, IBM_Plex_Mono } from 'next/font/google';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, Address } from 'viem';
import { TokenInfo, fetchWalletTokens, FOUNTAIN_ADDRESS, ERC20_ABI } from './evm';

const buenard = Buenard({ subsets: ['latin'], weight: ['400', '700'] });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'] });

interface TokenPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: TokenInfo, amount: number, isFullPort: boolean) => void;
}

export function TokenPicker({ isOpen, onClose, onSuccess }: TokenPickerProps) {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [amount, setAmount] = useState<string>('');

  // Track the current throw for success callback
  const [currentThrow, setCurrentThrow] = useState<{
    token: TokenInfo;
    amount: number;
    isFullPort: boolean;
  } | null>(null);

  // Fetch tokens when modal opens
  useEffect(() => {
    if (isOpen && address) {
      setLoading(true);
      setError(null);
      fetchWalletTokens(address as Address)
        .then(setTokens)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [isOpen, address]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedToken(null);
      setAmount('');
      setError(null);
      setCurrentThrow(null);
    }
  }, [isOpen]);

  // Handle successful transaction confirmation
  useEffect(() => {
    if (isConfirmed && currentThrow) {
      onSuccess(currentThrow.token, currentThrow.amount, currentThrow.isFullPort);
      onClose();
      setCurrentThrow(null);
    }
  }, [isConfirmed, currentThrow, onSuccess, onClose]);

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      console.error('Transaction error:', writeError);
      let errorMessage = 'Transaction failed';

      if (writeError.message?.includes('User rejected')) {
        errorMessage = 'You cancelled the transaction';
      } else if (writeError.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH for gas fee';
      } else if (writeError.message) {
        errorMessage = writeError.message;
      }

      setError(errorMessage);
    }
  }, [writeError]);

  const handleThrow = async () => {
    if (!selectedToken || !address || !amount) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || numAmount > selectedToken.balance) {
      setError('Invalid amount');
      return;
    }

    setError(null);
    const isFullPort = numAmount === selectedToken.balance;

    // Store throw info for success callback
    setCurrentThrow({
      token: selectedToken,
      amount: numAmount,
      isFullPort,
    });

    try {
      // Convert amount to raw units using token decimals
      const rawAmount = parseUnits(amount, selectedToken.decimals);

      // Execute ERC-20 transfer
      writeContract({
        address: selectedToken.address,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [FOUNTAIN_ADDRESS, rawAmount],
      });
    } catch (err: any) {
      console.error('Throw failed:', err);
      setError(err.message || 'Failed to initiate transaction');
      setCurrentThrow(null);
    }
  };

  const sending = isPending || isConfirming;

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${buenard.className}`}>
      <div className="relative flex items-center justify-center w-[380px] h-[500px]">
        {/* Frame image - fixed size, independent of content */}
        <img
          src="/frame.png"
          alt=""
          className="absolute pointer-events-none w-full h-full"
        />

        {/* Content - positioned over the frame */}
        <div
          className="relative max-h-[400px] max-w-[350px] overflow-hidden flex flex-col"
          style={{
            background: 'transparent',
          }}
        >
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-blue-900/20 flex justify-between items-center shrink-0">
              <h2 className={`text-xl font-bold text-black`}>
                {selectedToken ? 'How much?' : 'Choose your Offering'}
              </h2>
              <button
                onClick={onClose}
                className="text-black hover:text-gray-800 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading && (
                <div className="text-center py-8 text-gray-500">
                  Loading your bags...
                </div>
              )}

              {error && (
                <div className="text-red-500 text-center py-4 text-sm">
                  {error}
                </div>
              )}

              {!loading && !selectedToken && tokens.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No tokens found. Buy some shitcoins first!
                </div>
              )}

              {/* Token List */}
              {!loading && !selectedToken && tokens.length > 0 && (
                <div className="space-y-3">
                  {tokens.map((token) => (
                    <button
                      key={token.address}
                      onClick={() => setSelectedToken(token)}
                      className="w-full flex items-center gap-3 p-2 hover:bg-blue-100/50 transition text-left border-b border-blue-900/10"
                    >
                      {token.image ? (
                        <img
                          src={token.image}
                          alt={token.symbol}
                          className="w-10 h-10 rounded-full bg-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                          ?
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 truncate">
                          {token.symbol}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {token.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm text-gray-800 ${ibmPlexMono.className}`}>
                          {token.balance.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                            minimumFractionDigits: 2,
                          })}
                        </div>
                        {token.usdValue !== undefined && token.usdValue > 0 ? (
                          <div className={`text-xs text-gray-500 ${ibmPlexMono.className}`}>
                            {token.usdValue >= 0.01
                              ? `$${token.usdValue.toFixed(2)}`
                              : token.usdValue >= 0.001
                              ? `$${token.usdValue.toFixed(3)}`
                              : `$${token.usdValue.toFixed(4)}`
                            }
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500 italic">
                            literally worthless
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Amount Input */}
              {selectedToken && (
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedToken(null)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← Back to token list
                  </button>

                  <div className="flex items-center gap-3 p-3">
                    {selectedToken.image ? (
                      <img
                        src={selectedToken.image}
                        alt={selectedToken.symbol}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
                        ?
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-black">{selectedToken.symbol}</div>
                      <div className="text-sm text-gray-700">
                        Balance:{' '}
                        <span className={ibmPlexMono.className}>
                          {selectedToken.balance.toLocaleString(undefined, {
                            maximumFractionDigits: 4,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Offering Amount
                    </label>
                    <div className="flex gap-2 items-end">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className={`flex-1 px-2 py-1 border border-blue-900/30 bg-white/80 focus:outline-none focus:border-blue-900 text-black text-base ${ibmPlexMono.className}`}
                        max={selectedToken.balance}
                        step="any"
                      />
                      <button
                        onClick={() => {
                          if (amount === selectedToken.balance.toString()) {
                            setAmount('');
                          } else {
                            setAmount(selectedToken.balance.toString());
                          }
                        }}
                        className="px-1 pb-0.5 text-xs font-medium text-black underline hover:opacity-70 whitespace-nowrap"
                      >
                        Full Port
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {selectedToken && (
              <div className="p-4 border-t border-blue-900/20 shrink-0 text-center">
                <button
                  onClick={handleThrow}
                  disabled={sending || !amount || parseFloat(amount) <= 0}
                  className="text-black font-medium hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed transition text-xl underline"
                >
                  {sending ? 'Throwing...' : 'Throw into the Fountain'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
