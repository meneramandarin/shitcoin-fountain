import { Connection, PublicKey, Transaction, ComputeBudgetProgram } from '@solana/web3.js';
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getMint,
} from '@solana/spl-token';

// ============================================
// FOUNTAIN WALLET - All thrown shitcoins go here!
// ============================================

export const FOUNTAIN_ADDRESS = new PublicKey('9vAVbfw53JNkiCdbK7ZURUweXFqApKK7w8ezAp3bJX1y');

const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;

export interface TokenInfo {
  mint: string;
  symbol: string;
  name: string;
  image: string;
  balance: number;
  decimals: number;
  usdValue?: number;
}

/**
 * Fetch all fungible tokens for a wallet using Helius
 */
export async function fetchWalletTokens(walletAddress: string): Promise<TokenInfo[]> {
  const response = await fetch(
    `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'shitcoin-fountain',
        method: 'searchAssets',
        params: {
          ownerAddress: walletAddress,
          tokenType: 'fungible',
          displayOptions: {
            showNativeBalance: false,
          },
        },
      }),
    }
  );

  const data = await response.json();
  
  if (data.error) {
    console.error('Helius error:', data.error);
    throw new Error(data.error.message || 'Failed to fetch tokens');
  }

  const items = data.result?.items || [];
  
  // Map to our TokenInfo format
  const tokens: TokenInfo[] = items
    .filter((item: any) => {
      // Filter out tokens with zero balance
      const balance = item.token_info?.balance || 0;
      return balance > 0;
    })
    .map((item: any) => {
      const decimals = item.token_info?.decimals || 0;
      const rawBalance = item.token_info?.balance || 0;
      const balance = rawBalance / Math.pow(10, decimals);
      
      return {
        mint: item.id,
        symbol: item.token_info?.symbol || item.content?.metadata?.symbol || '???',
        name: item.content?.metadata?.name || 'Unknown Token',
        image: item.content?.links?.image || item.content?.files?.[0]?.uri || '',
        balance,
        decimals,
        usdValue: item.token_info?.price_info?.total_price || undefined,
      };
    })
    // Sort by USD value ascending (shittiest first!) or by balance if no price
    .sort((a: TokenInfo, b: TokenInfo) => {
      if (a.usdValue !== undefined && b.usdValue !== undefined) {
        return a.usdValue - b.usdValue; // Lowest value first
      }
      if (a.usdValue !== undefined) return 1;
      if (b.usdValue !== undefined) return -1;
      return 0;
    });

  return tokens;
}

/**
 * Build a transaction to throw a token into the fountain
 *
 * SECURITY NOTE: This transaction may require creating an Associated Token Account (ATA)
 * for the fountain if it doesn't already have one for the token being sent.
 * This is SAFE and costs ~0.002 SOL. Wallet security warnings are normal for this operation.
 *
 * The transaction includes:
 * 1. Priority fees to avoid transaction drops during network congestion
 * 2. Compute budget limits to optimize costs
 * 3. Optional ATA creation if needed (fountain doesn't have token account yet)
 * 4. Token transfer from sender to fountain
 */
export async function buildThrowTransaction(
  connection: Connection,
  senderWallet: PublicKey,
  tokenMint: PublicKey,
  amount: number,
  decimals: number
): Promise<Transaction> {
  const transaction = new Transaction();

  // Add priority fee to avoid transaction drops during congestion
  // Set compute unit price to 100,000 micro-lamports (0.0001 SOL per compute unit)
  const priorityFeeIx = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 100000,
  });
  transaction.add(priorityFeeIx);

  // Set compute unit limit to avoid over-paying
  const computeLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
    units: 200000, // Enough for token transfer + potential ATA creation
  });
  transaction.add(computeLimitIx);

  // Detect if this is a Token-2022 token or classic SPL token
  // Try Token-2022 first, fall back to classic SPL
  let tokenProgramId = TOKEN_PROGRAM_ID;
  try {
    const mintInfo = await getMint(connection, tokenMint, 'confirmed', TOKEN_2022_PROGRAM_ID);
    tokenProgramId = TOKEN_2022_PROGRAM_ID;
  } catch {
    // Not Token-2022, use classic SPL
    tokenProgramId = TOKEN_PROGRAM_ID;
  }

  // Get sender's token account
  const senderTokenAccount = await getAssociatedTokenAddress(
    tokenMint,
    senderWallet,
    false,
    tokenProgramId
  );

  // Get or create fountain's token account
  const fountainTokenAccount = await getAssociatedTokenAddress(
    tokenMint,
    FOUNTAIN_ADDRESS,
    false,
    tokenProgramId
  );

  // Check if fountain token account exists
  let fountainAccountExists = false;
  try {
    await getAccount(connection, fountainTokenAccount, 'confirmed', tokenProgramId);
    fountainAccountExists = true;
  } catch {
    fountainAccountExists = false;
  }

  // If fountain doesn't have a token account for this mint, create it
  // The sender pays for this (it's like ~0.002 SOL)
  if (!fountainAccountExists) {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        senderWallet,        // payer
        fountainTokenAccount, // new account
        FOUNTAIN_ADDRESS,     // owner
        tokenMint,            // mint
        tokenProgramId       // token program (SPL or Token-2022)
      )
    );
  }

  // Add transfer instruction
  const rawAmount = BigInt(Math.floor(amount * Math.pow(10, decimals)));

  transaction.add(
    createTransferInstruction(
      senderTokenAccount,
      fountainTokenAccount,
      senderWallet,
      rawAmount,
      [],                  // no multisig signers
      tokenProgramId       // use the correct token program
    )
  );

  // Get recent blockhash with commitment level
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = senderWallet;
  transaction.lastValidBlockHeight = lastValidBlockHeight;

  return transaction;
}