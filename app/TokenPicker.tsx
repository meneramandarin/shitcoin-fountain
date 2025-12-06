'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useState, useEffect } from 'react';
import { TokenInfo, fetchWalletTokens, buildThrowTransaction } from './solana';

interface TokenPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: TokenInfo, amount: number) => void;
}

export function TokenPicker({ isOpen, onClose, onSuccess }: TokenPickerProps) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [sending, setSending] = useState(false);

  // Fetch tokens when modal opens
  useEffect(() => {
    if (isOpen && publicKey) {
      setLoading(true);
      setError(null);
      fetchWalletTokens(publicKey.toString())
        .then(setTokens)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [isOpen, publicKey]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedToken(null);
      setAmount('');
      setError(null);
    }
  }, [isOpen]);

  const handleThrow = async () => {
    if (!selectedToken || !publicKey || !amount) return;
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || numAmount > selectedToken.balance) {
      setError('Invalid amount');
      return;
    }

    setSending(true);
    setError(null);

    try {
      const transaction = await buildThrowTransaction(
        connection,
        publicKey,
        new PublicKey(selectedToken.mint),
        numAmount,
        selectedToken.decimals
      );

      const signature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      onSuccess(selectedToken, numAmount);
      onClose();
    } catch (err: any) {
      console.error('Throw failed:', err);
      setError(err.message || 'Transaction failed');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-sm w-full max-h-[80vh]">
        {/* Frame wrapper - scales to container */}
        <div
          className="absolute inset-[-110px] sm:inset-[-170px] pointer-events-none"
          style={{
            backgroundImage: 'url(/frame.png)',
            backgroundSize: '80% 100%',
            backgroundPosition: 'center',
            imageRendering: 'pixelated',
          }}
        />

        {/* Content */}
        <div
          className="relative max-h-[400px] max-w-[280px] mx-auto overflow-hidden flex flex-col"
          style={{
            background: 'transparent',
          }}
        >
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-blue-900/20 flex justify-between items-center shrink-0">
            <h2 className={`text-xl font-bold text-blue-900`}>
              {selectedToken ? 'How much?' : 'Pick your shitter'}
            </h2>
            <button
              onClick={onClose}
              className="text-blue-800 hover:text-blue-900 text-2xl leading-none"
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
                  key={token.mint}
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
                    <div className="text-sm text-gray-800">
                      {token.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </div>
                    {token.usdValue !== undefined ? (
                      <div className="text-xs text-gray-500">
                        ${token.usdValue.toFixed(2)}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">
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
              
              <div className="flex items-center gap-3 p-3 bg-blue-50/50 border border-blue-900/20">
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
                  <div className="font-medium text-blue-900">{selectedToken.symbol}</div>
                  <div className="text-sm text-blue-800/70">
                    Balance: {selectedToken.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1">
                  Amount to throw
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 px-3 py-2 border border-blue-900/30 bg-white/80 focus:outline-none focus:border-blue-900 text-black"
                    max={selectedToken.balance}
                    step="any"
                  />
                  <button
                    onClick={() => setAmount(selectedToken.balance.toString())}
                    className="px-3 py-2 bg-blue-100 hover:bg-blue-200 border border-blue-900/30 text-sm font-medium text-blue-900"
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
            <div className="p-4 border-t border-blue-900/20 shrink-0">
              <button
                onClick={handleThrow}
                disabled={sending || !amount || parseFloat(amount) <= 0}
                className="w-full py-3 bg-blue-900 text-blue-50 font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition border border-blue-950"
              >
                {sending ? 'Throwing...' : `Throw ${amount || '0'} ${selectedToken.symbol}`}
              </button>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}