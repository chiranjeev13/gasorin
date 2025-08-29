"use client";

import { useState, useCallback } from "react";
import { CircleAccountDeployment, getSupportedChains, validateChainId } from "@/lib/circle-deployment";

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
  const [privateKey, setPrivateKey] = useState<string>("");
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

  const supportedChains = getSupportedChains();

  const initializeDeployment = useCallback(async () => {
    if (!privateKey || !validateChainId(chainId, isTestnet)) {
      setError("Invalid private key or chain ID");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const deploymentInstance = new CircleAccountDeployment(privateKey, chainId, isTestnet);
      await deploymentInstance.initializeAccount();
      
      setDeployment(deploymentInstance);
      setAccountAddress(deploymentInstance.getAccountAddress() || "");
      
      // Check USDC balance
      try {
        const balance = await deploymentInstance.checkUSDCBalance();
        setUsdcBalance(balance.toString());
      } catch (balanceError) {
        console.warn("Could not check USDC balance:", balanceError);
        setUsdcBalance("Unable to fetch");
      }
      
    } catch (err: any) {
      setError(`Failed to initialize deployment: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [privateKey, chainId, isTestnet]);

  const deployAccount = useCallback(async () => {
    if (!deployment) {
      setError("Deployment not initialized");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const result = await deployment.deployAccount();
      setDeploymentResult(result);
      
    } catch (err: any) {
      setError(`Failed to deploy account: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [deployment]);

  const sendTransaction = useCallback(async () => {
    if (!deployment || !recipientAddress || !transactionAmount) {
      setError("Missing deployment, recipient address, or transaction amount");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const amount = BigInt(transactionAmount);
      const result = await deployment.sendTransaction(recipientAddress, amount);
      setTransactionResult(result);
      
    } catch (err: any) {
      setError(`Failed to send transaction: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [deployment, recipientAddress, transactionAmount]);

  const chainInfo = deployment?.getChainInfo();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Circle Smart Account Deployment</h2>
        <p className="text-gray-600 mb-6">
          Deploy Circle Smart Accounts with USDC gas payments using Circle Paymaster
        </p>

        {/* Configuration Section */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Private Key
              </label>
              <input
                type="password"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Network Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={isTestnet}
                    onChange={() => setIsTestnet(true)}
                    className="mr-2"
                  />
                  Testnet
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!isTestnet}
                    onChange={() => setIsTestnet(false)}
                    className="mr-2"
                  />
                  Mainnet
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chain
            </label>
            <select
              value={chainId}
              onChange={(e) => setChainId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(isTestnet ? supportedChains.testnet : supportedChains.mainnet).map(([id, name]) => (
                <option key={id} value={id}>
                  {name} ({id})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={initializeDeployment}
            disabled={loading || !privateKey}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Initializing..." : "Initialize Deployment"}
          </button>
        </div>

        {/* Account Information */}
        {accountAddress && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-3">Account Information</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Account Address:</span>
                <span className="ml-2 font-mono text-sm break-all">{accountAddress}</span>
              </div>
              <div>
                <span className="font-medium">USDC Balance:</span>
                <span className="ml-2">{usdcBalance}</span>
              </div>
              {chainInfo && (
                <div>
                  <span className="font-medium">Chain:</span>
                  <span className="ml-2">{chainInfo.chainName} ({chainInfo.chainId})</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Deployment Section */}
        {deployment && (
          <div className="space-y-4 mb-6">
            <button
              onClick={deployAccount}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Deploying..." : "Deploy Account"}
            </button>

            {deploymentResult && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Deployment Successful!</h4>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">User Operation Hash:</span>
                    <span className="ml-2 font-mono break-all">{deploymentResult.userOperationHash}</span>
                  </div>
                  <div>
                    <span className="font-medium">Transaction Hash:</span>
                    <span className="ml-2 font-mono break-all">{deploymentResult.transactionHash}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transaction Section */}
        {deployment && (
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold">Send Transaction</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (wei)
                </label>
                <input
                  type="text"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(e.target.value)}
                  placeholder="1000000000000000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={sendTransaction}
              disabled={loading || !recipientAddress || !transactionAmount}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Transaction"}
            </button>

            {transactionResult && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-2">Transaction Successful!</h4>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">User Operation Hash:</span>
                    <span className="ml-2 font-mono break-all">{transactionResult.userOperationHash}</span>
                  </div>
                  <div>
                    <span className="font-medium">Transaction Hash:</span>
                    <span className="ml-2 font-mono break-all">{transactionResult.transactionHash}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-2">Error</h4>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Information Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h4 className="font-semibold text-blue-800 mb-2">Important Notes</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Make sure your account has sufficient USDC for gas payments</li>
            <li>• Testnet accounts can be funded using the Circle faucet</li>
            <li>• Circle Paymaster allows gas payments in USDC instead of native tokens</li>
            <li>• Account deployment requires a small amount of USDC for gas</li>
            <li>• Keep your private key secure and never share it</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
