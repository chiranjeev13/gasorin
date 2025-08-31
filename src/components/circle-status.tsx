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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-mono text-xl font-bold tracking-wider uppercase">CIRCLE SMART ACCOUNT</h2>
        <div className="usdc-gas-indicator">
          GAS: USDC
        </div>
      </div>
      
      {circleDeployment && chainId ? (
        <div className="space-y-6">
          {/* Smart Account Address */}
          {circleAccountAddress && (
            <div className="p-4 border-l-4 border-green-500 bg-gray-900">
              <div className="text-white font-mono text-sm mb-2 uppercase tracking-wider">SMART ACCOUNT ADDRESS</div>
              <div className="text-white font-mono text-sm break-all">
                {circleAccountAddress}
              </div>
              <div className="text-gray-400 font-mono text-xs mt-2 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500"></div>
                <span>SECURED BY CIRCLE PAYMASTER</span>
              </div>
            </div>
          )}

          {/* Balance Information */}
          <div className="grid grid-cols-2 gap-4">
            {/* ETH Balance */}
            <div className="p-4 border-l-4 border-yellow-500 bg-gray-900">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-5 h-5 bg-green-500 flex items-center justify-center">
                  <img src="/eth-logo.svg" alt="ETH" className="w-3 h-3" />
                </div>
                <span className="text-white font-mono font-semibold uppercase">ETH</span>
              </div>
              <div className="text-white font-mono text-lg font-bold">
                {ethBalance || "LOADING..."}
              </div>
              <div className="text-gray-400 font-mono text-xs mt-1">
                NO ETH NEEDED FOR GAS
              </div>
            </div>

            {/* USDC Balance */}
            <div className="p-4 border-l-4 border-green-500 bg-gray-900">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-white flex items-center justify-center">
                    <img src="/usdc-logo.svg" alt="USDC" className="w-4 h-4" />
                  </div>
                  <span className="text-white font-mono font-semibold uppercase">USDC</span>
                </div>
                <button
                  onClick={onRefreshBalance}
                  className="bg-white text-black font-mono text-xs font-bold uppercase px-2 py-1 hover:bg-gray-200"
                >
                  ↻
                </button>
              </div>
              <div className="text-white font-mono text-lg font-bold">
                {usdcBalance || "LOADING..."}
              </div>
              <div className="text-green-400 font-mono text-xs mt-1 flex items-center space-x-1">
                <div className="usdc-gas-indicator">⚡</div>
                <span>GAS FEES</span>
              </div>
            </div>
          </div>

          {/* Circle Configuration Info */}
          {/* <div className="glass-effect rounded-lg p-4">
            <div className="elegant-heading text-sm mb-3">Circle Configuration</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="elegant-text-secondary">Paymaster:</span>
                <span className="elegant-text font-mono text-xs">
                  {circleDeployment.getChainInfo().paymasterAddress.slice(0, 8)}...
                </span>
              </div>
            </div>
          </div> */}
        </div>
      ) : (
        <div className="p-6 text-center border-l-4 border-gray-500 bg-gray-900">
          <div className="text-4xl mb-4">🔗</div>
          <p className="text-white font-mono font-bold mb-2 uppercase tracking-wider">
            CONNECT YOUR WALLET
          </p>
          <p className="text-gray-400 font-mono text-sm">
            CONNECT YOUR WALLET TO INITIALIZE CIRCLE SMART ACCOUNT
          </p>
        </div>
      )}
    </div>
  );
}
