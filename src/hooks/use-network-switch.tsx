import { useAccount, useSwitchChain } from 'wagmi';
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
} from 'viem/chains';

// Supported chains for Circle Paymaster
const SUPPORTED_CHAINS = [
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
];

export const useNetworkSwitch = () => {
  const { chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const isChainSupported = (chainId: number) => {
    return SUPPORTED_CHAINS.some(chain => chain.id === chainId);
  };

  const getSupportedChainIds = () => {
    return SUPPORTED_CHAINS.map(chain => chain.id);
  };

  const checkAndSwitchNetwork = async (targetChainId?: number) => {
    if (!chainId) {
      throw new Error('No chain detected. Please connect your wallet.');
    }

    // If no target chain specified, use the first supported chain (mainnet)
    const targetChain = targetChainId || SUPPORTED_CHAINS[0].id;

    if (chainId !== targetChain) {
      try {
        await switchChainAsync({
          chainId: targetChain,
        });
      } catch (err) {
        console.error('Error switching network:', err);
        throw new Error(`Failed to switch to network ${targetChain}`);
      }
    }
  };

  return {
    checkAndSwitchNetwork,
    isChainSupported: chainId ? isChainSupported(chainId) : false,
    currentChain: chainId,
    supportedChains: SUPPORTED_CHAINS,
    getSupportedChainIds,
  };
};