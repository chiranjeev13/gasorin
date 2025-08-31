"use client";

import React from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChainInfo {
  name: string;
  icon: string;
  color: string;
  chainId: number;
  isTestnet: boolean;
}

const SUPPORTED_CHAINS: ChainInfo[] = [
  // Mainnet chains
      { name: "Ethereum", icon: "/eth-logo.svg", color: "text-blue-400", chainId: 1, isTestnet: false },
  { name: "Polygon", icon: "🟣", color: "text-purple-400", chainId: 137, isTestnet: false },
  { name: "Optimism", icon: "🔴", color: "text-red-400", chainId: 10, isTestnet: false },
  { name: "Arbitrum", icon: "🔵", color: "text-blue-500", chainId: 42161, isTestnet: false },
  { name: "Base", icon: "🔵", color: "text-blue-600", chainId: 8453, isTestnet: false },
  { name: "Avalanche", icon: "🔴", color: "text-red-500", chainId: 43114, isTestnet: false },
  
  // Testnet chains
      { name: "Sepolia", icon: "/eth-logo.svg", color: "text-blue-400", chainId: 11155111, isTestnet: true },
  { name: "Mumbai", icon: "🟣", color: "text-purple-400", chainId: 80001, isTestnet: true },
  { name: "Optimism Sepolia", icon: "🔴", color: "text-red-400", chainId: 11155420, isTestnet: true },
  { name: "Arbitrum Sepolia", icon: "🔵", color: "text-blue-500", chainId: 421614, isTestnet: true },
  { name: "Base Sepolia", icon: "🔵", color: "text-blue-600", chainId: 84532, isTestnet: true },
  { name: "Fuji", icon: "🔴", color: "text-red-500", chainId: 43113, isTestnet: true },
];

interface ChainSelectorProps {
  onChainChange?: (chainId: number, isTestnet: boolean) => void;
}

export function ChainSelector({ onChainChange }: ChainSelectorProps) {
  const { chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const currentChain = SUPPORTED_CHAINS.find(c => c.chainId === chainId);
  const currentValue = currentChain ? currentChain.chainId.toString() : "";

  const handleChainChange = async (chainIdStr: string) => {
    const chainId = parseInt(chainIdStr);
    const selectedChain = SUPPORTED_CHAINS.find(c => c.chainId === chainId);
    
    if (selectedChain && switchChainAsync) {
      try {
        await switchChainAsync({ chainId });
        onChainChange?.(chainId, selectedChain.isTestnet);
      } catch (error) {
        console.error('Failed to switch chain:', error);
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="block elegant-text font-semibold">
        Network
      </label>
      <Select value={currentValue} onValueChange={handleChainChange}>
        <SelectTrigger className="elegant-input">
          <SelectValue placeholder="Select network" />
        </SelectTrigger>
        <SelectContent className="glass-effect border border-primary max-h-60">
          <div className="px-3 py-2 elegant-text-secondary text-xs font-semibold uppercase tracking-wider">
            Mainnet Networks
          </div>
          {SUPPORTED_CHAINS.filter(c => !c.isTestnet).map((chain) => (
            <SelectItem 
              key={chain.chainId} 
              value={chain.chainId.toString()}
              className="elegant-text focus:bg-primary/10"
            >
              <div className="flex items-center space-x-2">
                <span className={chain.color}>{chain.icon}</span>
                <span>{chain.name}</span>
                <span className="elegant-text-secondary text-xs">({chain.chainId})</span>
              </div>
            </SelectItem>
          ))}
          
          <div className="px-3 py-2 elegant-text-secondary text-xs font-semibold uppercase tracking-wider mt-2">
            Testnet Networks
          </div>
          {SUPPORTED_CHAINS.filter(c => c.isTestnet).map((chain) => (
            <SelectItem 
              key={chain.chainId} 
              value={chain.chainId.toString()}
              className="elegant-text focus:bg-primary/10"
            >
              <div className="flex items-center space-x-2">
                <span className={chain.color}>{chain.icon}</span>
                <span>{chain.name}</span>
                <span className="elegant-text-secondary text-xs">({chain.chainId})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
