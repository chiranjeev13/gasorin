"use client";

import React from 'react';
import { CircleAccountDeployment } from '@/lib/circle-deployment';

interface CircleStatusProps {
  circleDeployment: CircleAccountDeployment | null;
  circleAccountAddress: string;
  isTestnet: boolean;
  chainId?: number;
  onRefreshBalance?: () => void;
  usdcBalance: string;
  ethBalance: string;
}

export function CircleStatus({
  circleDeployment,
  circleAccountAddress,
  isTestnet,
  chainId,
  onRefreshBalance,
  usdcBalance,
  ethBalance,
}: CircleStatusProps) {
  const getChainInfo = (chainId: number) => {
    const chainNames: Record<number, string> = {
      1: 'Ethereum',
      137: 'Polygon',
      10: 'Optimism',
      42161: 'Arbitrum',
      8453: 'Base',
      43114: 'Avalanche',
      11155111: 'Sepolia',
      80001: 'Mumbai',
      11155420: 'Optimism Sepolia',
      421614: 'Arbitrum Sepolia',
      84532: 'Base Sepolia',
      43113: 'Fuji',
    };
    return chainNames[chainId] || `Chain ${chainId}`;
  };

  const getStatusColor = () => {
    if (!circleDeployment) return 'text-yellow-400';
    if (circleAccountAddress) return 'text-green-400';
    return 'text-red-400';
  };

  const getStatusText = () => {
    if (!circleDeployment) return 'Not Initialized';
    if (circleAccountAddress) return 'Ready';
    return 'Error';
  };

  const getStatusIcon = () => {
    if (!circleDeployment) return '⏳';
    if (circleAccountAddress) return '✅';
    return '❌';
  };

  return (
    <div className="elegant-card">
      <h2 className="elegant-heading text-xl mb-6">Circle Smart Account Status</h2>
      
      {circleDeployment && chainId ? (
        <div className="space-y-6">
          {/* Status Overview */}
          <div className="glass-effect rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getStatusIcon()}</span>
                <div>
                  <div className={`elegant-text font-semibold ${getStatusColor()}`}>
                    {getStatusText()}
                  </div>
                  <div className="elegant-text-secondary text-sm">
                    Circle Paymaster Integration
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Network Information */}
          <div className="glass-effect rounded-lg p-4">
            <div className="elegant-heading text-sm mb-3">Network Configuration</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="elegant-text-secondary">Network:</span>
                <span className="elegant-text font-semibold">{getChainInfo(chainId)}</span>
              </div>
              <div className="flex justify-between">
                <span className="elegant-text-secondary">Type:</span>
                <span className="elegant-text font-semibold">
                  {isTestnet ? 'Testnet' : 'Mainnet'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="elegant-text-secondary">Chain ID:</span>
                <span className="elegant-text font-mono">{chainId}</span>
              </div>
            </div>
          </div>

          {/* Smart Account Address */}
          {circleAccountAddress && (
            <div className="glass-effect rounded-lg p-4">
              <div className="elegant-heading text-sm mb-3">Smart Account Address</div>
              <div className="elegant-text text-sm break-all font-mono bg-slate-800 p-3 rounded">
                {circleAccountAddress}
              </div>
              <div className="elegant-text-secondary text-xs mt-2">
                🔐 Secured by Circle Paymaster
              </div>
            </div>
          )}

          {/* Balance Information */}
          <div className="space-y-4">
            <div className="glass-effect rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <img src="/eth-logo.svg" alt="ETH" className="w-5 h-5" />
                  <span className="elegant-text font-semibold">ETH Balance</span>
                </div>
              </div>
              <div className="elegant-text text-lg font-bold">
                {ethBalance || "Loading..."}
              </div>
              <div className="elegant-text-secondary text-xs mt-1">
                💡 No ETH needed for gas fees
              </div>
            </div>

            <div className="glass-effect rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <img src="/usdc-logo.svg" alt="USDC" className="w-5 h-5" />
                  <span className="elegant-text font-semibold">USDC Balance</span>
                </div>
                <button
                  onClick={onRefreshBalance}
                  className="text-primary hover:text-primary/80 text-xs font-semibold uppercase tracking-wider"
                >
                  Refresh
                </button>
              </div>
              <div className="elegant-text text-lg font-bold">
                {usdcBalance || "Loading..."}
              </div>
              <div className="elegant-text-secondary text-xs mt-1">
                ⚡ Gas fees paid in USDC
              </div>
            </div>
          </div>

          {/* Circle Configuration Info */}
          <div className="glass-effect rounded-lg p-4">
            <div className="elegant-heading text-sm mb-3">Circle Configuration</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="elegant-text-secondary">Paymaster:</span>
                <span className="elegant-text font-mono text-xs">
                  {circleDeployment.getChainInfo().paymasterAddress.slice(0, 8)}...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="elegant-text-secondary">USDC Token:</span>
                <span className="elegant-text font-mono text-xs">
                  {circleDeployment.getChainInfo().usdcAddress.slice(0, 8)}...
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-effect rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">🔗</div>
          <p className="elegant-text font-semibold mb-2">
            Connect Your Wallet
          </p>
          <p className="elegant-text-secondary text-sm">
            Connect your wallet to initialize Circle Smart Account
          </p>
        </div>
      )}
    </div>
  );
}
