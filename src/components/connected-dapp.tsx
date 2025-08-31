"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard, AnimatedGlassCard } from './glass-card';
import { GlassBackground } from './glass-background';

interface ConnectedDappProps {
  dappName: string;
  dappIcon?: string;
  smartAccountAddress: string;
  networkName: string;
  chainId: number;
  usdcBalance: string;
  ethBalance: string;
  onDisconnect: () => void;
}

export function ConnectedDapp({
  dappName,
  dappIcon,
  smartAccountAddress,
  networkName,
  chainId,
  usdcBalance,
  ethBalance,
  onDisconnect,
}: ConnectedDappProps) {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4 relative">
      <GlassBackground />
      <div className="max-w-lg w-full relative z-10">
        {/* Main Card with Enhanced Glass Morphism */}
        <motion.div 
          className="relative bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl p-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-white text-2xl font-bold tracking-wider">CIRCLE SMART ACCOUNT</h1>
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">!</span>
            </div>
          </div>

          {/* Connected DApp Section */}
          <div className="mb-8">
            <h2 className="text-white text-lg font-medium text-center mb-4 tracking-wider">CONNECTED DAPP</h2>
            <GlassCard className="rounded-xl p-4" delay={0.2}>
              <div className="flex items-center space-x-4">
                {dappIcon ? (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-pink-400 rounded-full flex items-center justify-center overflow-hidden">
                    <img 
                      src={dappIcon} 
                      alt={`${dappName} logo`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <svg className="w-6 h-6 text-white hidden" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-pink-400 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                )}
                <span className="text-white text-xl font-bold">{dappName}</span>
              </div>
            </GlassCard>
          </div>

          {/* Smart Account Address */}
          <div className="mb-8 text-right">
            <div className="text-white/70 text-sm mb-1">Smart Account Address</div>
            <div className="text-white text-sm break-all">
              {smartAccountAddress}
            </div>
            <div className="text-white text-sm mt-2">
              {networkName} ({chainId})
            </div>
          </div>

          {/* Account Balances */}
          <div className="mb-8">
            <h3 className="text-white text-lg font-medium text-center mb-4 tracking-wider">ACCOUNT BALANCES</h3>
            
            {/* ETH Balance */}
            <GlassCard className="rounded-xl p-4 mb-3" delay={0.4}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <img src="/eth-logo.svg" alt="ETH" className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-white font-medium">ETH Balance</div>
                    <div className="text-white/60 text-xs">Native token for network fees</div>
                  </div>
                </div>
                <span className="text-white font-bold text-lg">{ethBalance || "0"}</span>
              </div>
            </GlassCard>
            
            {/* USDC Balance */}
            <GlassCard className="rounded-xl p-4" delay={0.6}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <img src="/usdc-logo.svg" alt="USDC" className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-white font-medium">USDC Balance</div>
                    <div className="text-white/60 text-xs">Available for gas payments via Circle Paymaster</div>
                  </div>
                </div>
                <span className="text-white font-bold text-lg">{usdcBalance || "0"}</span>
              </div>
            </GlassCard>
          </div>

          {/* Disconnect Button */}
          <div className="flex justify-center">
            <button
              onClick={onDisconnect}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold px-8 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Disconnect
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
