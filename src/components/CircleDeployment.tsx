"use client";

import { useState, useCallback, useEffect } from "react";
import { CircleAccountDeployment } from "@/lib/circle-deployment";
import { useAccount, useWalletClient } from 'wagmi';
import { Account } from "viem";

interface DeploymentResult {
  accountAddress: string;
  userOperationHash: string;
  transactionHash: string;
}

interface TransactionResult {
  userOperationHash: string;
  transactionHash: string;
}

export default function CircleDeployment() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const [chainId, setChainId] = useState<string>("421614"); // Default to Arbitrum Sepolia
  const [isTestnet, setIsTestnet] = useState<boolean>(true);
  const [deployment, setDeployment] = useState<CircleAccountDeployment | null>(null);
  const [accountAddress, setAccountAddress] = useState<string>("");
  const [usdcBalance, setUsdcBalance] = useState<string>("");
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [transactionResult, setTransactionResult] = useState<TransactionResult | null>(null);
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [transactionAmount, setTransactionAmount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  // Auto-compute Circle address when wallet is connected
  useEffect(() => {
    if (isConnected && address && walletClient && !deployment) {
      handleAutoInitialize();
    }
  }, [isConnected, address, walletClient, chainId, isTestnet]);

  const handleAutoInitialize = useCallback(async () => {
    if (!isConnected || !address || !walletClient) {
      setStatus("Please connect your wallet first");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setStatus("Initializing Circle Smart Account...");
      
      // Create a proper account object that supports the required signing methods
      const ownerAccount = {
        address: address as `0x${string}`,
        type: 'json-rpc' as const,
        async signMessage({ message }: { message: string }) {
          return await walletClient.signMessage({ message });
        },
        async signTypedData(typedData: unknown) {
          return await walletClient.request({
            method: 'eth_signTypedData_v4',
            params: [address, JSON.stringify(typedData)],
          });
        },
      } as unknown as Account;
      
      // Create Circle deployment instance
      const deploymentInstance = new CircleAccountDeployment(ownerAccount, chainId, isTestnet);
      await deploymentInstance.initializeAccount();
      
      setDeployment(deploymentInstance);
      const computedAddress = deploymentInstance.getAccountAddress() || "";
      setAccountAddress(computedAddress);
      setStatus("Circle Smart Account ready!");
      
      // Check USDC balance
      try {
        const balance = await deploymentInstance.checkUSDCBalance();
        setUsdcBalance(balance.toString());
      } catch (balanceError) {
        console.warn("Could not check USDC balance:", balanceError);
        setUsdcBalance("Unable to fetch");
      }
      
    } catch (err: any) {
      setError(`Failed to initialize: ${err.message}`);
      setStatus("Initialization failed");
    } finally {
      setLoading(false);
    }
  }, [isConnected, address, walletClient, chainId, isTestnet]);

  const deployAccount = useCallback(async () => {
    if (!deployment) {
      setError("Deployment not initialized");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setStatus("Deploying Smart Account...");
      
      const result = await deployment.deployAccount();
      setDeploymentResult(result);
      setStatus("Smart Account deployed successfully!");
      
    } catch (err: any) {
      setError(`Failed to deploy account: ${err.message}`);
      setStatus("Deployment failed");
    } finally {
      setLoading(false);
    }
  }, [deployment]);

  const sendTransaction = useCallback(async () => {
    if (!deployment || !recipientAddress || !transactionAmount) {
      setError("Missing recipient address or transaction amount");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setStatus("Sending transaction...");
      
      const amount = BigInt(transactionAmount);
      const result = await deployment.sendTransaction(recipientAddress, amount);
      setTransactionResult(result);
      setStatus("Transaction sent successfully!");
      
    } catch (err: any) {
      setError(`Failed to send transaction: ${err.message}`);
      setStatus("Transaction failed");
    } finally {
      setLoading(false);
    }
  }, [deployment, recipientAddress, transactionAmount]);

  const chainInfo = deployment?.getChainInfo();

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-900 border border-blue-500 p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-blue-400 uppercase tracking-wider">
            Connect Wallet Required
          </h2>
          <p className="text-gray-300 mb-6">
            Please connect your wallet to deploy and manage Circle Smart Accounts
          </p>
          <div className="bg-blue-900 border border-blue-500 p-4">
            <p className="text-blue-300 text-sm">
              Circle Smart Accounts enable USDC gas payments via Circle Paymaster
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-gray-900 border border-blue-500 p-8">
        <h2 className="text-3xl font-bold mb-4 text-blue-400 uppercase tracking-wider">
          Circle Smart Account
        </h2>
        <p className="text-gray-300 mb-8 font-mono">
          Deploy and manage smart accounts with USDC gas payments
        </p>

        {/* Status Bar */}
        <div className="bg-gray-800 border border-blue-500 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
              <span className="text-blue-300 font-mono uppercase text-sm">
                {status || (loading ? "Processing..." : "Ready")}
              </span>
            </div>
            <div className="text-gray-400 font-mono text-sm">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not Connected"}
            </div>
          </div>
        </div>

        {/* Network Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-blue-300 mb-3 uppercase tracking-wider">
              Network Type
            </label>
            <div className="flex space-x-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!isTestnet}
                  onChange={() => setIsTestnet(false)}
                  className="mr-3 accent-blue-500"
                />
                <span className="text-gray-300 font-mono">Mainnet</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={isTestnet}
                  onChange={() => setIsTestnet(true)}
                  className="mr-3 accent-blue-500"
                />
                <span className="text-gray-300 font-mono">Testnet</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-300 mb-3 uppercase tracking-wider">
              Chain
            </label>
            <select
              value={chainId}
              onChange={(e) => setChainId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-blue-500 text-gray-300 font-mono focus:outline-none focus:border-blue-400"
            >
              {isTestnet ? (
                <>
                  <option value="421614">Arbitrum Sepolia (421614)</option>
                  <option value="84532">Base Sepolia (84532)</option>
                  <option value="11155111">Sepolia (11155111)</option>
                  <option value="80001">Mumbai (80001)</option>
                  <option value="11155420">Optimism Sepolia (11155420)</option>
                  <option value="43113">Fuji (43113)</option>
                </>
              ) : (
                <>
                  <option value="1">Ethereum (1)</option>
                  <option value="137">Polygon (137)</option>
                  <option value="10">Optimism (10)</option>
                  <option value="42161">Arbitrum (42161)</option>
                  <option value="8453">Base (8453)</option>
                  <option value="43114">Avalanche (43114)</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Account Information */}
        {accountAddress && (
          <div className="bg-gray-800 border border-blue-500 p-6 mb-8">
            <h3 className="text-xl font-bold mb-4 text-blue-400 uppercase tracking-wider">
              Smart Account
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-900 border border-blue-500 p-4">
                <div className="text-blue-300 text-sm uppercase tracking-wider mb-2">Address</div>
                <div className="font-mono text-gray-300 break-all">{accountAddress}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-900 border border-blue-500 p-4">
                  <div className="text-blue-300 text-sm uppercase tracking-wider mb-2">USDC Balance</div>
                  <div className="font-mono text-gray-300">{usdcBalance || "Loading..."}</div>
                </div>
                <div className="bg-gray-900 border border-blue-500 p-4">
                  <div className="text-blue-300 text-sm uppercase tracking-wider mb-2">Chain</div>
                  <div className="font-mono text-gray-300">
                    {chainInfo ? `${chainInfo.chainName} (${chainInfo.chainId})` : "Loading..."}
                  </div>
                </div>
                <div className="bg-gray-900 border border-blue-500 p-4">
                  <div className="text-blue-300 text-sm uppercase tracking-wider mb-2">Status</div>
                  <div className="font-mono text-green-400">Active</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deployment Section */}
        {deployment && !deploymentResult && (
          <div className="bg-gray-800 border border-blue-500 p-6 mb-8">
            <h3 className="text-xl font-bold mb-4 text-blue-400 uppercase tracking-wider">
              Deploy Smart Account
            </h3>
            <p className="text-gray-300 mb-6 font-mono">
              Deploy your smart account to start using USDC for gas payments
            </p>
            <button
              onClick={deployAccount}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-4 px-6 font-mono uppercase tracking-wider border border-blue-500 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Deploying..." : "Deploy Smart Account"}
            </button>
          </div>
        )}

        {/* Deployment Success */}
        {deploymentResult && (
          <div className="bg-green-900 border border-green-500 p-6 mb-8">
            <h4 className="font-bold text-green-400 mb-4 uppercase tracking-wider">
              Deployment Successful
            </h4>
            <div className="space-y-3">
              <div className="bg-gray-900 border border-green-500 p-3">
                <div className="text-green-300 text-sm uppercase tracking-wider mb-1">User Operation Hash</div>
                <div className="font-mono text-gray-300 text-sm break-all">{deploymentResult.userOperationHash}</div>
              </div>
              <div className="bg-gray-900 border border-green-500 p-3">
                <div className="text-green-300 text-sm uppercase tracking-wider mb-1">Transaction Hash</div>
                <div className="font-mono text-gray-300 text-sm break-all">{deploymentResult.transactionHash}</div>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Section */}
        {deployment && (
          <div className="bg-gray-800 border border-blue-500 p-6 mb-8">
            <h3 className="text-xl font-bold mb-4 text-blue-400 uppercase tracking-wider">
              Send Transaction
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-blue-300 mb-3 uppercase tracking-wider">
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 bg-gray-900 border border-blue-500 text-gray-300 font-mono focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-300 mb-3 uppercase tracking-wider">
                  Amount (wei)
                </label>
                <input
                  type="text"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(e.target.value)}
                  placeholder="1000000000000000000"
                  className="w-full px-4 py-3 bg-gray-900 border border-blue-500 text-gray-300 font-mono focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>
            <button
              onClick={sendTransaction}
              disabled={loading || !recipientAddress || !transactionAmount}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-4 px-6 font-mono uppercase tracking-wider border border-purple-500 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Sending..." : "Send Transaction"}
            </button>

            {transactionResult && (
              <div className="bg-purple-900 border border-purple-500 p-6 mt-6">
                <h4 className="font-bold text-purple-400 mb-4 uppercase tracking-wider">
                  Transaction Successful
                </h4>
                <div className="space-y-3">
                  <div className="bg-gray-900 border border-purple-500 p-3">
                    <div className="text-purple-300 text-sm uppercase tracking-wider mb-1">User Operation Hash</div>
                    <div className="font-mono text-gray-300 text-sm break-all">{transactionResult.userOperationHash}</div>
                  </div>
                  <div className="bg-gray-900 border border-purple-500 p-3">
                    <div className="text-purple-300 text-sm uppercase tracking-wider mb-1">Transaction Hash</div>
                    <div className="font-mono text-gray-300 text-sm break-all">{transactionResult.transactionHash}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-900 border border-red-500 p-6">
            <h4 className="font-bold text-red-400 mb-4 uppercase tracking-wider">
              Error
            </h4>
            <p className="text-red-300 font-mono">{error}</p>
          </div>
        )}

        {/* Information Section */}
        <div className="bg-blue-900 border border-blue-500 p-6">
          <h4 className="font-bold text-blue-400 mb-4 uppercase tracking-wider">
            Circle Smart Account Features
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-300 text-sm font-mono">
            <div>• USDC gas payments via Circle Paymaster</div>
            <div>• No native token required for transactions</div>
            <div>• Automatic account address computation</div>
            <div>• Secure wallet-based signing</div>
            <div>• Multi-chain support</div>
            <div>• ERC-4337 Account Abstraction</div>
          </div>
        </div>
      </div>
    </div>
  );
}
