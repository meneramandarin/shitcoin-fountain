import { Address, parseUnits, formatUnits } from 'viem';

// ============================================
// FOUNTAIN WALLET - All thrown shitcoins go here!
// ============================================

export const FOUNTAIN_ADDRESS: Address = '0xfB00716f4F2715051d8833A1e8A87bed0934dC14';

export interface TokenInfo {
  address: Address;
  symbol: string;
  name: string;
  image: string;
  balance: number;
  decimals: number;
  usdValue?: number;
}

/**
 * Fetch all ERC-20 tokens for a wallet using Alchemy API
 */
export async function fetchWalletTokens(walletAddress: Address): Promise<TokenInfo[]> {
  const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

  if (!alchemyApiKey) {
    console.error('Missing NEXT_PUBLIC_ALCHEMY_API_KEY');
    return [];
  }

  try {
    const response = await fetch(
      `https://base-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'alchemy_getTokenBalances',
          params: [walletAddress, 'erc20'],
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error('Alchemy error:', data.error);
      return [];
    }

    const tokenBalances = data.result?.tokenBalances || [];

    // Filter out tokens with zero balance and fetch metadata
    const tokensWithBalance = tokenBalances.filter(
      (token: any) => token.tokenBalance !== '0x0'
    );

    // Fetch metadata for each token
    const tokens: TokenInfo[] = await Promise.all(
      tokensWithBalance.map(async (token: any) => {
        try {
          const metadataResponse = await fetch(
            `https://base-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'alchemy_getTokenMetadata',
                params: [token.contractAddress],
              }),
            }
          );

          const metadataData = await metadataResponse.json();
          const metadata = metadataData.result || {};

          const decimals = metadata.decimals || 18;
          const rawBalance = BigInt(token.tokenBalance);
          const balance = Number(formatUnits(rawBalance, decimals));

          return {
            address: token.contractAddress as Address,
            symbol: metadata.symbol || '???',
            name: metadata.name || 'Unknown Token',
            image: metadata.logo || '',
            balance,
            decimals,
            // Note: Alchemy doesn't provide price data in token metadata
            // You'd need to integrate with a price API separately if needed
            usdValue: undefined,
          };
        } catch (err) {
          console.error('Failed to fetch token metadata:', err);
          return null;
        }
      })
    );

    // Filter out failed fetches and sort by balance descending
    return tokens
      .filter((token): token is TokenInfo => token !== null)
      .sort((a, b) => {
        // Sort by USD value if available, otherwise by balance
        if (a.usdValue !== undefined && b.usdValue !== undefined) {
          return a.usdValue - b.usdValue; // Lowest value first (shittiest!)
        }
        if (a.usdValue !== undefined) return 1;
        if (b.usdValue !== undefined) return -1;
        return b.balance - a.balance;
      });
  } catch (error) {
    console.error('Failed to fetch wallet tokens:', error);
    return [];
  }
}

/**
 * Standard ERC-20 transfer ABI
 */
export const ERC20_ABI = [
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
] as const;
