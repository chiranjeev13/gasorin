"use client";

import React from 'react';
import { motion } from 'framer-motion';
import CustomConnectButton from "./custom-connect-wallet";
import { GlassCard } from './glass-card';
import { GlassBackground } from './glass-background';

interface LandingPageProps {
  status: string;
  error: string;
  connectionStatus: 'idle' | 'connecting' | 'connected' | 'error';
}

export function LandingPage({ status, error, connectionStatus }: LandingPageProps) {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4 relative">
      <GlassBackground />
      <div className="max-w-md w-full relative z-10">
        {/* Main Card */}
        <motion.div 
          className="elegant-card relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Top Left Logo */}
          <div className="absolute top-4 left-4">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 via-orange-400 to-blue-500 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-full"></div>
            </div>
          </div>

          {/* Top Right Icon */}
          <div className="absolute top-4 right-4">
            <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>

          {/* Main Content */}
          <div className="pt-16 pb-6">
            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold elegant-heading mb-1">Circle Smart Account</h1>
              <h2 className="text-lg font-semibold elegant-text">WalletConnect</h2>
            </div>

            {/* Rainbow Kit Integration */}
            <GlassCard className="rounded-lg p-3 mb-6" delay={0.2}>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gradient-to-br from-pink-400 via-orange-400 to-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
                <span className="elegant-text font-medium">Wallet and Chain ID Managed by Rainbow Kit</span>
              </div>
            </GlassCard>

            {/* Connect Wallet Section */}
            <div className="mb-6">
              <h3 className="elegant-heading text-lg mb-4">Connect Your Wallet</h3>
              <div className="mb-4">
                <CustomConnectButton />
              </div>
            </div>

            {/* Status Display */}
            <GlassCard className="rounded-lg p-3 mb-4" delay={0.4}>
              <div className="flex items-center justify-center space-x-3">
                <div className={`status-indicator ${connectionStatus === 'connected' ? 'ready' : connectionStatus === 'error' ? 'error' : 'loading'}`}></div>
                <span className="elegant-text font-medium">{status}</span>
              </div>
            </GlassCard>

            {/* Error Display */}
            {error && (
              <GlassCard className="rounded-lg p-3 mb-4 border-l-4 border-red-500" delay={0.5}>
                <div className="flex items-center space-x-2">
                  <span className="text-red-400">⚠️</span>
                  <span className="elegant-text text-red-300 text-sm">{error}</span>
                </div>
              </GlassCard>
            )}

            {/* Features */}
            <div className="space-y-3">
              <GlassCard className="rounded-lg p-3" delay={0.6}>
                <div className="flex items-center space-x-3">
                  <img src="/usdc-logo.svg" alt="USDC" className="w-6 h-6" />
                  <div>
                    <div className="elegant-text font-semibold text-sm">USDC Gas Payments</div>
                    <div className="elegant-text-secondary text-xs">Pay gas fees in USDC instead of ETH</div>
                  </div>
                </div>
              </GlassCard>
              
              <GlassCard className="rounded-lg p-3" delay={0.7}>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400 text-xl">🔐</span>
                  <div>
                    <div className="elegant-text font-semibold text-sm">Smart Account Security</div>
                    <div className="elegant-text-secondary text-xs">Enhanced security with Circle Paymaster</div>
                  </div>
                </div>
              </GlassCard>
              
              <GlassCard className="rounded-lg p-3" delay={0.8}>
                <div className="flex items-center space-x-3">
                  <span className="text-purple-400 text-xl">🌐</span>
                  <div>
                    <div className="elegant-text font-semibold text-sm">Multi-Chain Support</div>
                    <div className="elegant-text-secondary text-xs">Works across multiple networks</div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
