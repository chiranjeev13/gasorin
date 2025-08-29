"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CircleWalletConnect } from "@/lib/walletconnect";
import CircleDeployment from "@/components/CircleDeployment";
import { formatJsonRpcResult } from '@walletconnect/jsonrpc-utils';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"walletconnect" | "deployment">("walletconnect");
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";
  const [uri, setUri] = useState<string>("");
  const [status, setStatus] = useState<string>("Idle");
  const [initialized, setInitialized] = useState<boolean>(false);
  const [circleAccountAddress, setCircleAccountAddress] = useState<string>("");
  const [chainId, setChainId] = useState<string>("1");
  const [isTestnet, setIsTestnet] = useState<boolean>(false);
  const logRef = useRef<HTMLTextAreaElement | null>(null);
  const walletRef = useRef<CircleWalletConnect | null>(null);

  useEffect(() => {
    if (!initialized && projectId && activeTab === "walletconnect") {
      setStatus("Initializing Wallet...");
      const wallet = new CircleWalletConnect(projectId);
      walletRef.current = wallet;

      wallet.init()
        .then(() => {
          setInitialized(true);
          setStatus("Ready");

          // Set up event listeners
          wallet.onSessionProposal((proposal) => {
            if (logRef.current) {
              logRef.current.value += `\n${new Date().toISOString()} | session_proposal from ${proposal.params.proposer.metadata.name}`;
              logRef.current.scrollTop = logRef.current.scrollHeight;
            }

                      // Check if wallet is properly configured before approving
          const configStatus = wallet.getConfigurationStatus();
          if (!configStatus.isConfigured) {
            if (logRef.current) {
              logRef.current.value += `\n${new Date().toISOString()} | WARNING: No Circle account configured. Session will be approved with placeholder account.`;
              logRef.current.scrollTop = logRef.current.scrollHeight;
            }
          }

          wallet.approveSession(proposal)
            .then(() => {
              if (logRef.current) {
                logRef.current.value += `\n${new Date().toISOString()} | session approved successfully`;
                logRef.current.scrollTop = logRef.current.scrollHeight;
              }
              setStatus("Session approved! Check the dapp.");
            })
            .catch((err: unknown) => {
              if (logRef.current) {
                logRef.current.value += `\n${new Date().toISOString()} | approve error: ${String(err instanceof Error ? err.message : err)}`;
                logRef.current.scrollTop = logRef.current.scrollHeight;
              }
              setStatus(`Session approval failed: ${String(err instanceof Error ? err.message : err)}`);
            });
          });

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          wallet.onRequest(async (event: { id: string; topic: string; params: { request: any } }) => {
            console.debug('[WalletConnect] Incoming request:', event);
            if (logRef.current) {
              try {
                const method = event?.params?.request?.method;
                logRef.current.value += `\n${new Date().toISOString()} | [WalletConnect] Incoming request: ${method || 'unknown'} (topic: ${event.topic})`;
                logRef.current.scrollTop = logRef.current.scrollHeight;
              } catch {}
            }
            // Route all requests here
            const wcTx = event.params.request;
            // Verify session topic exists before processing (see Reown expected errors docs)
            const activeTopics = new Set(
              (wallet.getActiveSessions() as Array<{ topic?: string }>).map((s) => s.topic).filter(Boolean) as string[]
            );
            if (!activeTopics.has(event.topic)) {
              if (logRef.current) {
                logRef.current.value += `\n${new Date().toISOString()} | WARNING: Ignoring request for unknown topic ${event.topic}. Active: ${Array.from(activeTopics).join(',') || 'none'}`;
                logRef.current.scrollTop = logRef.current.scrollHeight;
              }
              return;
            }
            // EIP-712 support
            if (wcTx?.method === 'eth_signTypedData' || wcTx?.method === 'eth_signTypedData_v4') {
              // For threshold 1, sign the EIP-712 typed data
              // Use ethers.js signer for EIP-712
              let signature: string;

              // setIsSigning(false);
              // Respond to dapp with signature
              // @ts-expect-error - event.id is not typed
              const response = formatJsonRpcResult(event.id, signature);
              await wallet.sendSessionResponse(event.topic, response);
              return;
            }
            // Fallback: setWcRequest for modal UI for other requests
            // setWcRequest(event);
          });

          wallet.onSessionDelete(() => {
            if (logRef.current) {
              logRef.current.value += `\n${new Date().toISOString()} | session deleted`;
              logRef.current.scrollTop = logRef.current.scrollHeight;
            }
          });

          wallet.onProposalExpire(() => {
            if (logRef.current) {
              logRef.current.value += `\n${new Date().toISOString()} | proposal expired`;
              logRef.current.scrollTop = logRef.current.scrollHeight;
            }
          });
        })
        .catch((err) => {
          console.error(err);
          setStatus(`Init error: ${String(err instanceof Error ? err.message : err)}`);
        });
    }
  }, [initialized, projectId, activeTab]);

  const canConnect = useMemo(() => Boolean(initialized && uri.startsWith("wc:")), [initialized, uri]);

  const handleConnect = useCallback(async () => {
    if (!walletRef.current) return;

    setStatus("Pairing...");
    try {
      await walletRef.current.connect(uri);
      setStatus("Paired. Awaiting proposal/requests...");
    } catch (err: unknown) {
      setStatus(`Pair error: ${String(err instanceof Error ? err.message : err)}`);
    }
  }, [uri]);

  const handleSetCircleAccount = useCallback(() => {
    if (!walletRef.current) return;

    walletRef.current.setCircleAccountAddress(circleAccountAddress);
    walletRef.current.setChainId(chainId);
    walletRef.current.setNetworkType(isTestnet);

    if (logRef.current) {
      logRef.current.value += `\n${new Date().toISOString()} | Circle account set: ${circleAccountAddress} on chain ${chainId} (${isTestnet ? 'testnet' : 'mainnet'})`;
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [circleAccountAddress, chainId, isTestnet]);

  const paymasterInfo = walletRef.current?.getPaymasterInfo();
  const networkConfig = walletRef.current?.getNetworkConfig();
  const allSupportedChains = walletRef.current?.getAllSupportedChains();
  const configStatus = walletRef.current?.getConfigurationStatus();

  // Get available chains based on network type
  const availableChains = useMemo(() => {
    if (!allSupportedChains) return {};
    return isTestnet ? allSupportedChains.testnet : allSupportedChains.mainnet;
  }, [allSupportedChains, isTestnet]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Circle Smart Account Platform</h1>
          <p className="text-xl text-gray-600">Deploy and connect Circle Smart Accounts with USDC gas payments</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-sm p-1">
            <button
              onClick={() => setActiveTab("deployment")}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === "deployment"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Account Deployment
            </button>
            <button
              onClick={() => setActiveTab("walletconnect")}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === "walletconnect"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              WalletConnect
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "deployment" ? (
          <CircleDeployment />
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Circle Smart Account WalletConnect</h2>
              <p className="text-gray-600 mb-6">Connect dapps to your Circle Smart Account with USDC gas payments.</p>

              {!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID && (
                <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-lg mb-6">
                  <strong>Warning:</strong> Set <code>NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID</code> in your env.
                </div>
              )}

              {paymasterInfo && (
                <div className="p-4 border border-green-300 bg-green-50 rounded-lg mb-6">
                  <strong>Circle Paymaster Info:</strong>
                  <ul className="mt-2 space-y-1">
                    <li>Network: {paymasterInfo.networkType}</li>
                    <li>Description: {paymasterInfo.description}</li>
                    <li>Pricing: {paymasterInfo.pricing}</li>
                    <li>Token: {paymasterInfo.token}</li>
                    <li>Standard: {paymasterInfo.standard}</li>
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Circle Smart Account Address
                  </label>
                  <input
                    value={circleAccountAddress}
                    onChange={(e) => setCircleAccountAddress(e.target.value.trim())}
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
                        checked={!isTestnet}
                        onChange={() => setIsTestnet(false)}
                        className="mr-2"
                      />
                      Mainnet
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={isTestnet}
                        onChange={() => setIsTestnet(true)}
                        className="mr-2"
                      />
                      Testnet
                    </label>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chain ID
                </label>
                <select
                  value={chainId}
                  onChange={(e) => setChainId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(availableChains || {}).map(([chainId, chainName]) => (
                    <option key={chainId} value={chainId.replace('eip155:', '')}>
                      {String(chainName)} ({chainId.replace('eip155:', '')})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSetCircleAccount}
                disabled={!circleAccountAddress}
                className="w-full md:w-auto bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed mb-6"
              >
                Set Circle Account
              </button>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WalletConnect URI
                </label>
                <input
                  value={uri}
                  onChange={(e) => setUri(e.target.value.trim())}
                  placeholder="wc:..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleConnect}
                disabled={!canConnect}
                className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed mb-6"
              >
                Connect
              </button>

              <div className="flex items-center gap-2 mb-6">
                <span className="text-sm font-medium">Status:</span>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">{status}</code>
              </div>

              {networkConfig && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-800 mb-2">Current Network Configuration</h4>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>Chain ID: {networkConfig.chainId}</li>
                    <li>Network: {networkConfig.isTestnet ? 'Testnet' : 'Mainnet'}</li>
                    <li>Account: {networkConfig.circleAccountAddress || 'Not set'}</li>
                    <li>Supported Chains: {networkConfig.supportedChains ? Object.keys(networkConfig.supportedChains).length : 0}</li>
                  </ul>
                </div>
              )}

              {configStatus && (
                <div className={`border rounded-lg p-4 mb-6 ${
                  configStatus.isConfigured 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <h4 className={`font-semibold mb-2 ${
                    configStatus.isConfigured ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    Configuration Status
                  </h4>
                  <ul className={`text-sm space-y-1 ${
                    configStatus.isConfigured ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    <li>Status: {configStatus.isConfigured ? '✅ Configured' : '⚠️ Not Configured'}</li>
                    <li>Circle Account: {configStatus.hasCircleAccount ? '✅ Set' : '❌ Not Set'}</li>
                    <li>Chain ID: {configStatus.chainId}</li>
                    <li>Network: {configStatus.isTestnet ? 'Testnet' : 'Mainnet'}</li>
                  </ul>
                  {!configStatus.isConfigured && (
                    <p className="text-yellow-700 text-sm mt-2">
                      ⚠️ Set your Circle Smart Account address before connecting to dapps for the best experience.
                    </p>
                  )}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Log
                </label>
                <textarea
                  ref={logRef}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  readOnly
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm">
                  This wallet connects to Circle Smart Accounts and supports USDC gas payments via Circle Paymaster.
                  Set your Circle Smart Account address, network type, and chain ID before connecting to dapps.
                  Testnet connections are free and perfect for development and testing.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}



