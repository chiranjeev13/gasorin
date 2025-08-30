'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';

const queryClient = new QueryClient();

type ProvidersProps = {
  children: ReactNode;
  walletConnectProjectId: string;
};

const Providers = ({ children, walletConnectProjectId }: ProvidersProps) => {
  const config = getDefaultConfig({
    appName: 'Circles USDC Paymaster App',
    projectId: walletConnectProjectId,
    chains: [baseSepolia],
    ssr: true,
  });
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export { Providers };
