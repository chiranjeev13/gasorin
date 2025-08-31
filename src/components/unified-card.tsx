"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { GlassBackground } from './glass-background';
import { GlassCard } from './glass-card';
import CustomConnectButton from "./custom-connect-wallet";
import { CircleStatus } from "./circle-status";
import { CircleAccountDeployment } from "@/lib/circle-deployment";

interface UnifiedCardProps {
  // State props
  isConnected: boolean;
  isDappConnected: boolean;
  connectionStatus: 'idle' | 'connecting' | 'connected' | 'error';
  
  // Wallet props
  address?: string;
  chainId?: number;
  isTestnet: boolean;
  
  // Circle props
  circleDeployment: CircleAccountDeployment | null;
  circleAccountAddress: string;
  usdcBalance: string;
  ethBalance: string;
  
  // DApp props
  dappName?: string;
  dappIcon?: string;
  
  // WalletConnect props
  uri: string;
  setUri: (uri: string) => void;
  canConnect: boolean;
  
  // Callbacks
  onConnect: () => void;
  onDisconnect: () => void;
  onRefreshBalance: () => void;
  getChainInfo: (chainId: number) => { name: string; icon: string; color: string };
  
  // Status
  status: string;
  error: string;
}

export function UnifiedCard({
  isConnected,
  isDappConnected,
  connectionStatus,
  address,
  chainId,
  isTestnet,
  circleDeployment,
  circleAccountAddress,
  usdcBalance,
  ethBalance,
  dappName,
  dappIcon,
  uri,
  setUri,
  canConnect,
  onConnect,
  onDisconnect,
  onRefreshBalance,
  getChainInfo,
  status,
  error,
}: UnifiedCardProps) {
  
  const chainInfo = chainId ? getChainInfo(chainId) : null;
  
  // Determine card state and content
  const getCardState = () => {
    if (isDappConnected) return 'dapp-connected';
    if (isConnected && circleDeployment) return 'dashboard';
    return 'landing';
  };
  
  const cardState = getCardState();
  
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4 relative">
      <GlassBackground />
      <div className="max-w-2xl w-full relative z-10">
        {/* Main Card */}
        <motion.div 
          className="elegant-card relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="p-6 pb-4">
            {/* Top Left Logo */}
            <div className="absolute top-4 left-4">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-400 via-orange-400 to-blue-500 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Top Right Status */}
            <div className="absolute top-4 right-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-600'
              }`}>
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6 pt-8">
              <h1 className="text-3xl font-bold elegant-heading mb-2">CIRCLE SMART ACCOUNT</h1>
              <p className="elegant-text-secondary text-sm">
                {cardState === 'dapp-connected' ? 'Connected to dApp' :
                 cardState === 'dashboard' ? 'Wallet Dashboard' :
                 'Connect Your Wallet'}
              </p>
            </div>
          </div>

          {/* Dynamic Content Based on State */}
          <div className="px-6 pb-6">
            
            {/* Landing State */}
            {cardState === 'landing' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
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
              </motion.div>
            )}

            {/* Dashboard State */}
            {cardState === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {/* WalletConnect URI Section */}
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-pink-400 via-orange-400 to-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                    <span className="elegant-text font-semibold">CONNECT TO DAPPS VIA WALLETCONNECT URI</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <input
                        value={uri}
                        onChange={(e) => setUri(e.target.value.trim())}
                        placeholder="Paste WalletConnect URI here"
                        className="elegant-input w-full"
                      />
                    </div>
                    <button
                      onClick={onConnect}
                      disabled={!canConnect}
                      className="elegant-button px-6 py-2"
                    >
                      CONNECT
                    </button>
                  </div>
                </div>

                {/* Connection Status */}
                <div className="mb-6">
                  <div className="glass-effect rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center`}>
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <span className="elegant-text font-medium">
                          {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                      {address && (
                        <div className="text-right">
                          <div className="elegant-text font-mono text-sm">
                            {address.slice(0, 6)}...{address.slice(-4)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Circle Smart Account Status */}
                {circleDeployment && (
                  <div className="mb-6">
                    <CircleStatus
                      circleDeployment={circleDeployment}
                      circleAccountAddress={circleAccountAddress}
                      isTestnet={isTestnet}
                      chainId={chainId}
                      onRefreshBalance={onRefreshBalance}
                      usdcBalance={usdcBalance}
                      ethBalance={ethBalance}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* DApp Connected State */}
            {cardState === 'dapp-connected' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {/* Connected DApp Section */}
                <div className="mb-6">
                  <h2 className="elegant-heading text-lg text-center mb-4">CONNECTED DAPP</h2>
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
                      <span className="elegant-text text-xl font-bold">{dappName}</span>
                    </div>
                  </GlassCard>
                </div>

                {/* Smart Account Address */}
                <div className="mb-6 text-right">
                  <div className="elegant-text-secondary text-sm mb-1">Smart Account Address</div>
                  <div className="elegant-text font-mono text-sm break-all">
                    {circleAccountAddress}
                  </div>
                  <div className="elegant-text text-sm mt-2">
                    {chainInfo?.name} ({chainId})
                  </div>
                </div>

                {/* Account Balances */}
                <div className="mb-6">
                  <h3 className="elegant-heading text-lg text-center mb-4">ACCOUNT BALANCES</h3>
                  
                  {/* ETH Balance */}
                  <GlassCard className="rounded-xl p-4 mb-3" delay={0.4}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <img src="/eth-logo.svg" alt="ETH" className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="elegant-text font-semibold">ETH Balance</div>
                          <div className="elegant-text-secondary text-xs">Native token for network fees</div>
                        </div>
                      </div>
                      <span className="elegant-text font-mono font-bold text-lg">{ethBalance || "0"}</span>
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
                          <div className="elegant-text font-semibold">USDC Balance</div>
                          <div className="elegant-text-secondary text-xs">Available for gas payments via Circle Paymaster</div>
                        </div>
                      </div>
                      <span className="elegant-text font-mono font-bold text-lg">{usdcBalance || "0"}</span>
                    </div>
                  </GlassCard>
                </div>
              </motion.div>
            )}

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

            {/* Disconnect Button */}
            <div className="flex justify-center">
              <button
                onClick={onDisconnect}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-8 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                {cardState === 'dapp-connected' ? 'Disconnect from dApp' : 'Disconnect'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
