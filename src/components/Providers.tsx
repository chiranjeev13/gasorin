'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { 
  mainnet, 
  polygon, 
  optimism, 
  arbitrum, 
  base, 
  avalanche,
  sepolia,
  polygonMumbai,
  optimismSepolia,
  arbitrumSepolia,
  baseSepolia,
  avalancheFuji
} from 'wagmi/chains';

const queryClient = new QueryClient();

type ProvidersProps = {
  children: ReactNode;
  walletConnectProjectId: string;
};

const Providers = ({ children, walletConnectProjectId }: ProvidersProps) => {
  const config = getDefaultConfig({
    appName: 'Circles USDC Paymaster App',
    projectId: walletConnectProjectId,
    chains: [
      // Mainnet chains
      mainnet,
      polygon,
      optimism,
      arbitrum,
      base,
      avalanche,
      // Testnet chains
      sepolia,
      polygonMumbai,
      optimismSepolia,
      arbitrumSepolia,
      baseSepolia,
      avalancheFuji
    ],
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
