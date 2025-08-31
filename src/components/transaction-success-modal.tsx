"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { CheckCircle, ExternalLink, X } from 'lucide-react';

interface TransactionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionHash: string;
  userOperationHash: string;
  dappName?: string;
  dappIcon?: string;
  amount?: string;
  recipient?: string;
}

export function TransactionSuccessModal({
  isOpen,
  onClose,
  transactionHash,
  userOperationHash,
  dappName,
  dappIcon,
  amount,
  recipient,
}: TransactionSuccessModalProps) {
  const getExplorerUrl = (hash: string) => {
    // Base Sepolia explorer
    return `https://sepolia.basescan.org/tx/${hash}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="bg-black border-2 border-white p-6 max-w-md"
        style={{ fontFamily: "var(--font-departure-mono), monospace" }}
      >
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-500 border-2 border-green-400 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-black" />
            </div>
          </div>
          <DialogTitle className="text-white text-xl font-bold uppercase tracking-wider">
            TRANSACTION SUCCESSFUL
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* DApp Info */}
          {dappName && (
            <div className="p-4  border-blue-500 bg-gray-900">
              <div className="flex items-center space-x-3">
                {dappIcon ? (
                  <div className="w-8 h-8 bg-white flex items-center justify-center overflow-hidden">
                    <img 
                      src={dappIcon} 
                      alt={`${dappName} logo`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-white flex items-center justify-center">
                    <span className="text-black text-sm font-bold">🌐</span>
                  </div>
                )}
                <div>
                  <div className="text-white font-medium uppercase text-sm">{dappName}</div>
                  <div className="text-gray-400 text-xs">CONNECTED DAPP</div>
                </div>
              </div>
            </div>
          )}

          {/* Transaction Details */}
          {amount && recipient && (
            <div className="p-4  border-green-500 bg-gray-900">
              <div className="text-white font-medium uppercase text-sm mb-2">TRANSACTION DETAILS</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">AMOUNT:</span>
                  <span className="text-white">{amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">TO:</span>
                  <span className="text-white font-mono">
                    {recipient.slice(0, 6)}...{recipient.slice(-4)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Transaction Hash */}
          <div className="p-4  border-yellow-500 bg-gray-900">
            <div className="text-white font-medium uppercase text-sm mb-2">TRANSACTION HASH</div>
            <div className="flex items-center justify-between">
              <div className="text-white font-mono text-xs break-all flex-1 mr-2">
                {transactionHash}
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => copyToClipboard(transactionHash)}
                  className="bg-white text-black text-xs font-bold px-2 py-1 hover:bg-gray-200"
                  size="sm"
                >
                  COPY
                </Button>
                <Button
                  onClick={() => window.open(getExplorerUrl(transactionHash), '_blank')}
                  className="bg-white text-black text-xs font-bold px-2 py-1 hover:bg-gray-200"
                  size="sm"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* User Operation Hash */}
          <div className="p-4  border-purple-500 bg-gray-900">
            <div className="text-white font-medium uppercase text-sm mb-2">USER OPERATION HASH</div>
            <div className="flex items-center justify-between">
              <div className="text-white font-mono text-xs break-all flex-1 mr-2">
                {userOperationHash}
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => copyToClipboard(userOperationHash)}
                  className="bg-white text-black text-xs font-bold px-2 py-1 hover:bg-gray-200"
                  size="sm"
                >
                  COPY
                </Button>
                <Button
                  onClick={() => window.open(`https://base-sepolia.blockscout.com/op/${userOperationHash}`, '_blank')}
                  className="bg-white text-black text-xs font-bold px-2 py-1 hover:bg-gray-200"
                  size="sm"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* USDC Gas Indicator */}
          <div className="p-3  border-green-500 bg-gray-900">
            <div className="flex items-center space-x-2">
              <div className="usdc-gas-indicator">⚡ GAS</div>
              <span className="text-green-400 text-xs">PAID WITH USDC VIA CIRCLE PAYMASTER</span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-center mt-6">
          <Button
            onClick={onClose}
            className="bg-white text-black font-bold px-8 py-3 border border-white hover:bg-gray-200 transition-all duration-200"
          >
            CLOSE
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
