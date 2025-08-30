"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CircleWalletConnect } from "@/lib/walletconnect";
import { formatJsonRpcResult, formatJsonRpcError } from '@walletconnect/jsonrpc-utils';
import { CircleAccountDeployment } from "@/lib/circle-deployment";
import CustomConnectButton from "@/components/custom-connect-wallet";
import { useAccount, useWalletClient } from 'wagmi';
import { Account } from "viem";

interface TransactionResult {
  userOperationHash: string;
  transactionHash: string;
}

export default function HomePage() {
  const { address, isConnected, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";
  const [uri, setUri] = useState<string>("");
  const [status, setStatus] = useState<string>("Idle");
  const [initialized, setInitialized] = useState<boolean>(false);
  const [circleAccountAddress, setCircleAccountAddress] = useState<string>("");
  const [isTestnet, setIsTestnet] = useState<boolean>(false);
  const [circleDeployment, setCircleDeployment] = useState<CircleAccountDeployment | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<string>("");
  const [transactionResult, setTransactionResult] = useState<TransactionResult | null>(null);
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [transactionAmount, setTransactionAmount] = useState<string>("");
  const [transactionType, setTransactionType] = useState<"eth" | "usdc">("eth");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const logRef = useRef<HTMLTextAreaElement | null>(null);
  const walletRef = useRef<CircleWalletConnect | null>(null);

  // Auto-detect if current chain is testnet
  useEffect(() => {
    if (chainId) {
      const testnetChainIds = ['11155111', '80001', '11155420', '421614', '84532', '43113'];
      const isCurrentChainTestnet = testnetChainIds.includes(chainId.toString());
      setIsTestnet(isCurrentChainTestnet);
    }
  }, [chainId]);

  // Auto-create Circle deployment when wallet connects
  useEffect(() => {
    const createDeployment = async () => {
      if (!isConnected || !address || !walletClient || !chainId || circleDeployment) {
        return;
      }

      try {
        setStatus("Creating Circle deployment...");
        
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
        
        // Create Circle deployment instance using current chain
        const deployment = new CircleAccountDeployment(ownerAccount, chainId.toString(), isTestnet);
        await deployment.initializeAccount();
        
        setCircleDeployment(deployment);
        
        // Get the Circle client interface
        const circleClient = deployment.getCircleClient();
        
        // Get the account address and set it automatically
        const accountAddress = circleClient.getAccountAddress();
        if (accountAddress) {
          setCircleAccountAddress(accountAddress);
          
          // Update WalletConnect wallet if it exists
          if (walletRef.current) {
            walletRef.current.setCircleDeployment(circleClient);
            walletRef.current.setCircleAccountAddress(accountAddress);
            walletRef.current.setChainId(chainId.toString());
            walletRef.current.setNetworkType(isTestnet);
          }

          // Check USDC balance
          try {
            const balance = await deployment.checkUSDCBalance();
            setUsdcBalance(balance.toString());
          } catch (balanceError) {
            console.warn("Could not check USDC balance:", balanceError);
            setUsdcBalance("Unable to fetch");
          }
        }

        setStatus("Circle deployment created and configured automatically!");
        
        if (logRef.current) {
          logRef.current.value += `\n${new Date().toISOString()} | Circle deployment created: ${accountAddress} on chain ${chainId} (${isTestnet ? 'testnet' : 'mainnet'})`;
          logRef.current.value += `\n${new Date().toISOString()} | Circle account automatically set and configured`;
          logRef.current.scrollTop = logRef.current.scrollHeight;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setError(`Failed to create Circle deployment: ${errorMessage}`);
        setStatus("Failed to create Circle deployment");
        if (logRef.current) {
          logRef.current.value += `\n${new Date().toISOString()} | ERROR: Failed to create Circle deployment: ${errorMessage}`;
          logRef.current.scrollTop = logRef.current.scrollHeight;
        }
      }
    };

    createDeployment();
  }, [isConnected, address, walletClient, chainId, isTestnet, circleDeployment]);

  // Initialize WalletConnect
  useEffect(() => {
    if (!initialized && projectId) {
      setStatus("Initializing Wallet...");
      const wallet = new CircleWalletConnect(projectId);
      walletRef.current = wallet;

      wallet.init()
        .then(() => {
          setInitialized(true);
          setStatus("Ready");

          // If Circle deployment already exists, configure the wallet immediately
          if (circleDeployment && circleAccountAddress) {
            const circleClient = circleDeployment.getCircleClient();
            wallet.setCircleDeployment(circleClient);
            wallet.setCircleAccountAddress(circleAccountAddress);
            wallet.setChainId(chainId?.toString() || "1");
            wallet.setNetworkType(isTestnet);
            
            if (logRef.current) {
              logRef.current.value += `\n${new Date().toISOString()} | WalletConnect configured with existing Circle deployment`;
              logRef.current.scrollTop = logRef.current.scrollHeight;
            }
          }

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
            // Verify session topic exists before processing
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
            // Handle read-only RPC methods
            if (wcTx?.method === 'eth_blockNumber' || 
                wcTx?.method === 'eth_chainId' || 
                wcTx?.method === 'eth_getBalance' ||
                wcTx?.method === 'eth_getCode' ||
                wcTx?.method === 'eth_getTransactionCount' ||
                wcTx?.method === 'eth_getTransactionReceipt' ||
                wcTx?.method === 'eth_estimateGas' ||
                wcTx?.method === 'eth_call' ||
                wcTx?.method === 'eth_getLogs' ||
                wcTx?.method === 'eth_getBlockByNumber' ||
                wcTx?.method === 'eth_getBlockByHash' ||
                wcTx?.method === 'eth_getTransactionByHash' ||
                wcTx?.method === 'eth_getTransactionByBlockHashAndIndex' ||
                wcTx?.method === 'eth_getTransactionByBlockNumberAndIndex' ||
                wcTx?.method === 'eth_getUncleByBlockHashAndIndex' ||
                wcTx?.method === 'eth_getUncleByBlockNumberAndIndex' ||
                wcTx?.method === 'eth_getUncleCountByBlockHash' ||
                wcTx?.method === 'eth_getUncleCountByBlockNumber' ||
                wcTx?.method === 'eth_getStorageAt' ||
                wcTx?.method === 'eth_protocolVersion' ||
                wcTx?.method === 'eth_syncing' ||
                wcTx?.method === 'eth_coinbase' ||
                wcTx?.method === 'eth_mining' ||
                wcTx?.method === 'eth_hashrate' ||
                wcTx?.method === 'eth_gasPrice' ||
                wcTx?.method === 'eth_accounts' ||
                wcTx?.method === 'eth_blockNumber' ||
                wcTx?.method === 'eth_getBlockTransactionCountByHash' ||
                wcTx?.method === 'eth_getBlockTransactionCountByNumber' ||
                wcTx?.method === 'eth_newFilter' ||
                wcTx?.method === 'eth_newBlockFilter' ||
                wcTx?.method === 'eth_newPendingTransactionFilter' ||
                wcTx?.method === 'eth_uninstallFilter' ||
                wcTx?.method === 'eth_getFilterChanges' ||
                wcTx?.method === 'eth_getFilterLogs' ||
                wcTx?.method === 'eth_subscribe' ||
                wcTx?.method === 'eth_unsubscribe') {
              
              try {
                const result = await wallet.makeRpcCall(wcTx.method, wcTx.params || []);
                const response = formatJsonRpcResult(Number(event.id), result);
                await wallet.sendSessionResponse(event.topic, response);
                return;
              } catch (error) {
                console.error(`RPC call failed for ${wcTx.method}:`, error);
                const errorResponse = formatJsonRpcError(Number(event.id), {
                  code: -32603,
                  message: `Internal error: ${error instanceof Error ? error.message : String(error)}`
                });
                await wallet.sendSessionResponse(event.topic, errorResponse);
                return;
              }
            }

            // EIP-712 support
            if (wcTx?.method === 'eth_signTypedData' || wcTx?.method === 'eth_signTypedData_v4') {
              const errorResponse = formatJsonRpcError(Number(event.id), {
                code: -32601,
                message: "Method not implemented: EIP-712 signing not yet supported"
              });
              await wallet.sendSessionResponse(event.topic, errorResponse);
              return;
            }

            if(wcTx?.method === 'eth_sendTransaction') {
              try {
                const result = await wallet.sendTransaction(wcTx.params);
                const response = formatJsonRpcResult(Number(event.id), result);
                await wallet.sendSessionResponse(event.topic, response);
                return;
              } catch (error) {
                console.error(`Transaction failed:`, error);
                const errorResponse = formatJsonRpcError(Number(event.id), {
                  code: -32603,
                  message: `Transaction failed: ${error instanceof Error ? error.message : String(error)}`
                });
                await wallet.sendSessionResponse(event.topic, errorResponse);
                return;
              }
            }

            // Handle eth_sign and personal_sign
            if (wcTx?.method === 'eth_sign' || wcTx?.method === 'personal_sign') {
              const errorResponse = formatJsonRpcError(Number(event.id), {
                code: -32601,
                message: "Method not implemented: Signing not yet supported"
              });
              await wallet.sendSessionResponse(event.topic, errorResponse);
              return;
            }

            // Fallback: return method not found for unhandled methods
            const errorResponse = formatJsonRpcError(Number(event.id), {
              code: -32601,
              message: `Method not found: ${wcTx?.method || 'unknown'}`
            });
            await wallet.sendSessionResponse(event.topic, errorResponse);
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
  }, [initialized, projectId, circleDeployment, circleAccountAddress, chainId, isTestnet]);

  // Update WalletConnect wallet when Circle deployment changes
  useEffect(() => {
    if (walletRef.current && circleDeployment && circleAccountAddress) {
      const circleClient = circleDeployment.getCircleClient();
      walletRef.current.setCircleDeployment(circleClient);
      walletRef.current.setCircleAccountAddress(circleAccountAddress);
      walletRef.current.setChainId(chainId?.toString() || "1");
      walletRef.current.setNetworkType(isTestnet);
      
      if (logRef.current) {
        logRef.current.value += `\n${new Date().toISOString()} | WalletConnect updated with Circle deployment`;
        logRef.current.scrollTop = logRef.current.scrollHeight;
      }
    }
  }, [circleDeployment, circleAccountAddress, chainId, isTestnet]);

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

  const sendTransaction = useCallback(async () => {
    if (!circleDeployment || !recipientAddress || !transactionAmount) {
      setError("Missing recipient address or transaction amount");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setStatus("Sending transaction...");
      
      const amount = BigInt(transactionAmount);
      let result;

      if (transactionType === "eth") {
        // Send ETH transaction
        result = await circleDeployment.sendTransaction(recipientAddress, amount);
      } else {
        // Send USDC transaction (this would need to be implemented in CircleDeployment)
        setError("USDC transactions not yet implemented");
        setLoading(false);
        return;
      }

      setTransactionResult(result);
      setStatus("Transaction sent successfully!");
      
      if (logRef.current) {
        logRef.current.value += `\n${new Date().toISOString()} | Transaction sent: ${result.transactionHash}`;
        logRef.current.scrollTop = logRef.current.scrollHeight;
      }
    } catch (err: any) {
      setError(`Failed to send transaction: ${err.message}`);
      setStatus("Transaction failed");
    } finally {
      setLoading(false);
    }
  }, [circleDeployment, recipientAddress, transactionAmount, transactionType]);

  // Get chain name from chainId
  const getChainName = (chainId: number) => {
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
    <main className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header with WalletConnect and Connect Button */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-blue-400 mb-2 uppercase tracking-wider">Circle Smart Account</h1>
            <p className="text-xl text-gray-300 font-mono">Send transactions with USDC gas payments</p>
          </div>
          
          {/* WalletConnect Input and Connect Button */}
          <div className="flex items-center space-x-4">
  <div className="relative flex-1 min-w-80">
    <input
      value={uri}
      onChange={(e) => setUri(e.target.value.trim())}
      placeholder="wc:..."
      className="w-full px-4 py-3 pr-32 bg-gray-800 border border-blue-500 text-gray-300 font-mono focus:outline-none focus:border-blue-400"
    />
    <button
      onClick={handleConnect}
      disabled={!canConnect}
      className="absolute right-1 top-1 bottom-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 font-mono disabled:cursor-not-allowed transition-colors rounded-sm"
    >
      Link
    </button>
  </div>
  <CustomConnectButton />
</div>
        </div>

        {/* Status Bar */}
        <div className="bg-gray-800 border border-blue-500 p-4 mb-8">
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

        {/* Main Transaction Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Account Info */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 border border-blue-500 p-6">
              <h2 className="text-xl font-bold mb-4 text-blue-400 uppercase tracking-wider">Account Information</h2>
              
              {isConnected && chainId && (
                <div className="space-y-4">
                  <div className="bg-gray-900 border border-blue-500 p-4">
                    <div className="text-blue-300 text-sm uppercase tracking-wider mb-2">Network</div>
                    <div className="font-mono text-gray-300">{getChainName(chainId)} ({chainId})</div>
                    <div className="text-sm text-gray-400">{isTestnet ? 'Testnet' : 'Mainnet'}</div>
                  </div>

                  {circleAccountAddress && (
                    <div className="bg-gray-900 border border-blue-500 p-4">
                      <div className="text-blue-300 text-sm uppercase tracking-wider mb-2">Circle Smart Account</div>
                      <div className="font-mono text-gray-300 text-sm break-all">{circleAccountAddress}</div>
                    </div>
                  )}

                  <div className="bg-gray-900 border border-blue-500 p-4">
                    <div className="text-blue-300 text-sm uppercase tracking-wider mb-2">USDC Balance</div>
                    <div className="font-mono text-gray-300">{usdcBalance || "Loading..."}</div>
                    <div className="text-sm text-gray-400">For gas payments</div>
                  </div>
                </div>
              )}

              {!isConnected && (
                <div className="p-4 border border-yellow-500 bg-yellow-900">
                  <p className="text-yellow-200 font-mono">
                    Please connect your wallet to start sending transactions.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Transaction Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 border border-blue-500 p-6">
              <h2 className="text-xl font-bold mb-6 text-blue-400 uppercase tracking-wider">Send Transaction</h2>
              
              {isConnected && circleDeployment ? (
                <div className="space-y-6">
                  {/* Transaction Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-blue-300 mb-3 uppercase tracking-wider">
                      Transaction Type
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={transactionType === "eth"}
                          onChange={() => setTransactionType("eth")}
                          className="mr-3 accent-blue-500"
                        />
                        <span className="text-gray-300 font-mono">ETH</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={transactionType === "usdc"}
                          onChange={() => setTransactionType("usdc")}
                          className="mr-3 accent-blue-500"
                        />
                        <span className="text-gray-300 font-mono">USDC</span>
                      </label>
                    </div>
                  </div>

                  {/* Recipient Address */}
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

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-blue-300 mb-3 uppercase tracking-wider">
                      Amount ({transactionType === "eth" ? "wei" : "USDC"})
                    </label>
                    <input
                      type="text"
                      value={transactionAmount}
                      onChange={(e) => setTransactionAmount(e.target.value)}
                      placeholder={transactionType === "eth" ? "1000000000000000000" : "1000000"}
                      className="w-full px-4 py-3 bg-gray-900 border border-blue-500 text-gray-300 font-mono focus:outline-none focus:border-blue-400"
                    />
                    <div className="text-sm text-gray-400 mt-1">
                      {transactionType === "eth" ? "1 ETH = 1000000000000000000 wei" : "1 USDC = 1000000 (6 decimals)"}
                    </div>
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={sendTransaction}
                    disabled={loading || !recipientAddress || !transactionAmount}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-4 px-6 font-mono uppercase tracking-wider border border-blue-500 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? "Sending..." : `Send ${transactionType.toUpperCase()}`}
                  </button>

                  {/* Transaction Result */}
                  {transactionResult && (
                    <div className="bg-green-900 border border-green-500 p-4">
                      <h4 className="font-bold text-green-400 mb-3 uppercase tracking-wider">
                        Transaction Successful
                      </h4>
                      <div className="space-y-2">
                        <div className="bg-gray-900 border border-green-500 p-3">
                          <div className="text-green-300 text-sm uppercase tracking-wider mb-1">User Operation Hash</div>
                          <div className="font-mono text-gray-300 text-sm break-all">{transactionResult.userOperationHash}</div>
                        </div>
                        <div className="bg-gray-900 border border-green-500 p-3">
                          <div className="text-green-300 text-sm uppercase tracking-wider mb-1">Transaction Hash</div>
                          <div className="font-mono text-gray-300 text-sm break-all">{transactionResult.transactionHash}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-900 border border-red-500 p-4">
                      <h4 className="font-bold text-red-400 mb-2 uppercase tracking-wider">
                        Error
                      </h4>
                      <p className="text-red-300 font-mono">{error}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 border border-yellow-500 bg-yellow-900">
                  <p className="text-yellow-200 font-mono">
                    Please connect your wallet and wait for Circle deployment to be ready.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Event Log */}
        <div className="mt-8">
          <div className="bg-gray-800 border border-blue-500 p-6">
            <h3 className="text-lg font-bold mb-4 text-blue-400 uppercase tracking-wider">Event Log</h3>
            <textarea
              ref={logRef}
              rows={8}
              className="w-full px-4 py-3 bg-gray-900 border border-blue-500 text-gray-300 font-mono text-sm focus:outline-none focus:border-blue-400"
              readOnly
            />
          </div>
        </div>
      </div>
    </main>
  );
}



