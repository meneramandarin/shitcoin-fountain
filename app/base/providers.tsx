'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';
import { injected, coinbaseWallet, walletConnect } from '@wagmi/connectors';

export function BaseProviders({ children }: { children: React.ReactNode }) {
  const config = useMemo(() => {
    return createConfig({
      chains: [base],
      connectors: [
        injected({
          target: 'metaMask',
        }),
        coinbaseWallet({
          appName: 'Shitcoin Fountain',
          appLogoUrl: 'https://shitcoinfountain.fun/fountain.png',
        }),
        // Generic injected wallet (for Phantom, Brave, etc.)
        injected({
          target() {
            return {
              id: 'injected',
              name: 'Browser Wallet',
              provider: typeof window !== 'undefined' ? (window as any).ethereum : undefined,
            };
          },
        }),
        // WalletConnect requires a project ID from cloud.walletconnect.com
        // Uncomment and add your project ID if you want WalletConnect support:
        // walletConnect({
        //   projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
        // }),
      ],
      transports: {
        [base.id]: http(),
      },
    });
  }, []);

  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
