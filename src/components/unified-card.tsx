"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { GlassBackground } from './glass-background';
import { GlassCard } from './glass-card';
import CustomConnectButton from "./custom-connect-wallet";
import { CircleStatus } from "./circle-status";
import { CircleAccountDeployment } from "@/lib/circle-deployment";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

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
      <div className="max-w-2xl w-full relative z-10">
        {/* Main Card */}
        <motion.div 
          className="bg-black border border-white relative"
          style={{ fontFamily: "var(--font-departure-mono), monospace" }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="p-6 pb-4">
            {/* Top Left Logo */}
            <div className="absolute top-4 left-4">
              <div className="w-8 h-8 bg-white border border-black flex items-center justify-center">
                <div className="w-4 h-4 bg-black"></div>
              </div>
            </div>

            {/* Top Right Status */}
            <div className="absolute top-4 right-4">
              <div className={`w-6 h-6 border flex items-center justify-center ${
                connectionStatus === 'connected' ? 'bg-green-500 border-green-500' : 
                connectionStatus === 'error' ? 'bg-red-500 border-red-500' : 'bg-gray-600 border-gray-600'
              }`}>
                <div className="w-2 h-2 bg-black"></div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6 pt-8">
              <h1 className="text-3xl font-bold text-white tracking-wider mb-2">CIRCLE SMART ACCOUNT</h1>
              <p className="text-gray-400 text-sm">
                {cardState === 'dapp-connected' ? '> CONNECTED TO DAPP' :
                 cardState === 'dashboard' ? '> WALLET DASHBOARD' :
                 '> USDC GAS SUPPORTED BY CIRCLE PAYMASTER'}
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
                {/* <GlassCard className="rounded-lg p-3 mb-6" delay={0.2}>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-pink-400 via-orange-400 to-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                    <span className="elegant-text font-medium">Wallet and Chain ID Managed by Rainbow Kit</span>
                  </div>
                </GlassCard> */}

                {/* Connect Wallet Section */}
                <div className="mb-6 flex justify-center">
                  <div className="mb-4">
                    <CustomConnectButton />
                  </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 border-l-4 border-green-500 bg-gray-900">
                    <div className="text-green-400 text-lg mb-1">⚡</div>
                    <div className="text-white font-medium text-xs">USDC GAS</div>
                  </div>
                  
                  <div className="p-3 border-l-4 border-blue-500 bg-gray-900">
                    <div className="text-blue-400 text-lg mb-1">🔐</div>
                    <div className="text-white font-medium text-xs">SECURE</div>
                  </div>
                  
                  <div className="p-3 border-l-4 border-purple-500 bg-gray-900">
                    <div className="text-purple-400 text-lg mb-1">🌐</div>
                    <div className="text-white font-medium text-xs">MULTI-CHAIN</div>
                  </div>
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
                    <div className="w-6 h-6 bg-white border border-black flex items-center justify-center">
                      <div className="w-2 h-2 bg-black"></div>
                    </div>
                    <span className="text-white font-medium">CONNECT TO DAPPS VIA WALLETCONNECT URI</span>
                  </div>
                  <div className="relative">
                    <Input
                      value={uri}
                      onChange={(e) => setUri(e.target.value.trim())}
                      placeholder="PASTE WALLETCONNECT URI HERE"
                      className="bg-black border border-white text-white placeholder-gray-400 w-full pr-20 h-12 px-4"
                    />
                    <Button
                      onClick={onConnect}
                      disabled={!canConnect}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-white text-black font-bold px-4 py-1 text-sm border border-black hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400"
                    >
                      LINK
                    </Button>
                  </div>
                </div>

                {/* Connection Status */}
                <div className="mb-6 flex items-center justify-between p-4 border-l-4 border-green-500 bg-gray-900">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <span className="text-white font-medium">
                      {chainId && chainInfo && `CONNECTED TO ${chainInfo.name.toUpperCase()} (${isTestnet ? 'TESTNET' : 'MAINNET'})`}
                    </span>
                  </div>
                  {address && (
                                            <div className="text-white text-sm">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </div>
                  )}
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
                <div className="mb-6 p-4 border-l-4 border-blue-500 bg-gray-900">
                  <div className="flex items-center space-x-4">
                    {dappIcon ? (
                      <div className="w-12 h-12 bg-white flex items-center justify-center overflow-hidden">
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
                        <svg className="w-6 h-6 text-black hidden" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-white flex items-center justify-center">
                        <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                    )}
                    <div>
                      <div className="text-white text-xl font-bold">{dappName}</div>
                      <div className="text-gray-400 text-sm">CONNECTED DAPP</div>
                    </div>
                  </div>
                </div>

                {/* Smart Account Address */}
                <div className="mb-6 p-3 border-l-4 border-gray-500 bg-gray-900">
                  <div className="text-gray-400 text-xs mb-1 uppercase">SMART ACCOUNT</div>
                  <div className="text-white text-sm break-all">
                    {circleAccountAddress}
                  </div>
                </div>

                {/* Account Balances */}
                <div className="mb-6 grid grid-cols-2 gap-4">
                  {/* ETH Balance */}
                  <div className="p-4 border-l-4 border-yellow-500 bg-gray-900">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-green-500 flex items-center justify-center">
                        <img src="/eth-logo.svg" alt="ETH" className="w-4 h-4" />
                      </div>
                      <span className="text-white font-medium">ETH</span>
                    </div>
                    <div className="text-white text-lg font-bold">{ethBalance || "0"}</div>
                    <div className="text-gray-400 text-xs">NO ETH NEEDED</div>
                  </div>
                  
                  {/* USDC Balance */}
                  <div className="p-4 border-l-4 border-green-500 bg-gray-900">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-white flex items-center justify-center">
                        <img src="/usdc-logo.svg" alt="USDC" className="w-5 h-5" />
                      </div>
                      <span className="text-white font-medium">USDC</span>
                    </div>
                    <div className="text-white text-lg font-bold">{usdcBalance || "0"}</div>
                    <div className="text-green-400 text-xs flex items-center space-x-1">
                      <div className="usdc-gas-indicator">⚡</div>
                      <span>GAS FEES</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}



            {/* Error Display */}
            {error && (
              <div className="p-3 mb-4 border-l-4 border-red-500 bg-gray-900">
                <div className="flex items-center space-x-2">
                  <span className="text-red-500">⚠️</span>
                  <span className="text-red-300 text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Disconnect Button - Only show when wallet is connected */}
            {isConnected && (
              <div className="flex justify-center">
                <button
                  onClick={onDisconnect}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-3 border border-red-500 hover:border-red-600 transition-all duration-200 transform hover:scale-105"
                >
                  {cardState === 'dapp-connected' ? 'DISCONNECT FROM DAPP' : 'DISCONNECT'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}


