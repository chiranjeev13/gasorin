"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CircleStatus } from "./circle-status";
import { GlassCard } from './glass-card';
import { GlassBackground } from './glass-background';
import { CircleAccountDeployment } from "@/lib/circle-deployment";

interface TransactionResult {
  userOperationHash: string;
  transactionHash: string;
}

interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  address?: string;
  icon: string;
}

interface DashboardProps {
  address: string | undefined;
  status: string;
  error: string;
  connectionStatus: 'idle' | 'connecting' | 'connected' | 'error';
  chainId: number | undefined;
  isTestnet: boolean;
  circleDeployment: CircleAccountDeployment | null;
  circleAccountAddress: string;
  usdcBalance: string;
  ethBalance: string;
  onRefreshBalance: () => void;
  getChainInfo: (chainId: number) => { name: string; icon: string; color: string };
  uri: string;
  setUri: (uri: string) => void;
  onConnect: () => void;
  canConnect: boolean;
  onDisconnect: () => void;
}

export function Dashboard({
  address,
  status,
  error,
  connectionStatus,
  chainId,
  isTestnet,
  circleDeployment,
  circleAccountAddress,
  usdcBalance,
  ethBalance,
  onRefreshBalance,
  getChainInfo,
  uri,
  setUri,
  onConnect,
  canConnect,
  onDisconnect,
}: DashboardProps) {
  return (
    <main className="min-h-screen bg-black p-4 relative">
      <GlassBackground />
      <div className="max-w-2xl mx-auto relative z-10">
        {/* Main Card */}
        <motion.div 
          className="elegant-card relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Main Content */}
          <div className="p-6">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold elegant-heading mb-2">CIRCLE SMART ACCOUNT</h1>
            </div>

            {/* WalletConnect URI Section */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-6 h-6 bg-gradient-to-br from-pink-400 via-orange-400 to-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
                <span className="elegant-text font-medium">CONNECT TO DAPPS VIA WALLETCONNECT URI</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <input
                    value={uri}
                    onChange={(e) => setUri(e.target.value.trim())}
                    placeholder="URI Yostom"
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
                      <div className="elegant-text text-sm">
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

            {/* Disconnect Button */}
            <div className="flex justify-center">
              <button
                onClick={onDisconnect}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-8 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Disconnect
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
