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
import { useAccount, useWalletClient, useBalance, useDisconnect } from 'wagmi';
import { Account } from "viem";

import { UnifiedCard } from "@/components/unified-card";
import { TransactionSuccessModal } from "@/components/transaction-success-modal";

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

const TOKENS: Record<string, TokenInfo> = {
  eth: {
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    icon: "/eth-logo.svg",
  },
  usdc: {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    icon: "/usdc-logo.svg",
  },
};

const SUPPORTED_CHAINS = {
  mainnet: {
    "1": { name: "Ethereum", icon: "/eth-logo.svg", color: "text-blue-400" },
    "137": { name: "Polygon", icon: "🟣", color: "text-purple-400" },
    "10": { name: "Optimism", icon: "🔴", color: "text-red-400" },
    "42161": { name: "Arbitrum", icon: "🔵", color: "text-blue-500" },
    "8453": { name: "Base", icon: "🔵", color: "text-blue-600" },
    "43114": { name: "Avalanche", icon: "🔴", color: "text-red-500" },
  },
  testnet: {
    "11155111": { name: "Sepolia", icon: "/eth-logo.svg", color: "text-blue-400" },
    "80001": { name: "Mumbai", icon: "🟣", color: "text-purple-400" },
    "11155420": { name: "Optimism Sepolia", icon: "🔴", color: "text-red-400" },
    "421614": { name: "Arbitrum Sepolia", icon: "🔵", color: "text-blue-500" },
    "84532": { name: "Base Sepolia", icon: "🔵", color: "text-blue-600" },
    "43113": { name: "Fuji", icon: "🔴", color: "text-red-500" },
  },
};

export default function HomePage() {
  const { address, isConnected, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { disconnectAsync } = useDisconnect();
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";
  
  // State management
  const [uri, setUri] = useState<string>("");
  const [status, setStatus] = useState<string>("Welcome to Circle Paymaster");
  const [initialized, setInitialized] = useState<boolean>(false);
  const [circleAccountAddress, setCircleAccountAddress] = useState<string>("");
  const [isTestnet, setIsTestnet] = useState<boolean>(false);
  const [circleDeployment, setCircleDeployment] = useState<CircleAccountDeployment | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<string>("");
  const [ethBalance, setEthBalance] = useState<string>("");
  const [transactionResult, setTransactionResult] = useState<TransactionResult | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [transactionAmount, setTransactionAmount] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<string>("eth");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [connectedDapp, setConnectedDapp] = useState<{ name: string; icon?: string } | null>(null);
  
  const walletRef = useRef<CircleWalletConnect | null>(null);

  // Get ETH balance using wagmi
  const { data: ethBalanceData, refetch: refetchEthBalance } = useBalance({
    address: circleAccountAddress as `0x${string}`,
  });

  // Auto-detect if current chain is testnet and update Circle client
  useEffect(() => {
    if (chainId) {
      const testnetChainIds = ['11155111', '80001', '11155420', '421614', '84532', '43113'];
      const isCurrentChainTestnet = testnetChainIds.includes(chainId.toString());
      setIsTestnet(isCurrentChainTestnet);
      
      // Update status
      setStatus(`Connected to ${getChainInfo(chainId).name} (${isCurrentChainTestnet ? 'Testnet' : 'Mainnet'})`);
      setConnectionStatus('connected');
    }
  }, [chainId]);

  // Update ETH balance when balance data changes
  useEffect(() => {
    if (ethBalanceData) {
      setEthBalance(ethBalanceData.formatted);
    }
  }, [ethBalanceData]);

  // Enhanced Circle deployment creation with better error handling
  useEffect(() => {
    const createDeployment = async () => {
      if (!isConnected || !address || !walletClient || !chainId || circleDeployment) {
        return;
      }

      try {
        setStatus("Initializing Circle Smart Account...");
        setLoading(true);
        
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
            setUsdcBalance((BigInt(balance) / BigInt(10 ** 6)).toString());
          } catch (balanceError) {
            console.warn("Could not check USDC balance:", balanceError);
            setUsdcBalance("Unable to fetch");
          }
        }

        setStatus("Circle Smart Account ready!");
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setError(`Failed to create Circle deployment: ${errorMessage}`);
        setStatus("Failed to create Circle deployment");
        setConnectionStatus('error');
      } finally {
        setLoading(false);
      }
    };

    createDeployment();
  }, [isConnected, address, walletClient, chainId, isTestnet, circleDeployment]);

  // Initialize WalletConnect with enhanced configuration
  useEffect(() => {
    if (!initialized && projectId) {
      setStatus("Initializing WalletConnect...");
      const wallet = new CircleWalletConnect(projectId);
      walletRef.current = wallet;

      wallet.init()
        .then(() => {
          setInitialized(true);
          setStatus("WalletConnect ready");

          // If Circle deployment already exists, configure the wallet immediately
          if (circleDeployment && circleAccountAddress) {
            const circleClient = circleDeployment.getCircleClient();
            wallet.setCircleDeployment(circleClient);
            wallet.setCircleAccountAddress(circleAccountAddress);
            wallet.setChainId(chainId?.toString() || "1");
            wallet.setNetworkType(isTestnet);
          }

          // Set up event listeners
          wallet.onSessionProposal((proposal) => {
            console.log("Session proposal received:", proposal.id);
            
            // Check if wallet is properly configured before approving
            const configStatus = wallet.getConfigurationStatus();
            if (!configStatus.isConfigured) {
              setError("No Circle account configured. Session will be approved with placeholder account.");
            }

            wallet.approveSessionWithRetry(proposal)
              .then(() => {
                setStatus("Session approved! Check the dapp.");
                // Clear the URI input after successful connection
                setUri("");
                // Set connected dApp info
                setConnectedDapp({
                  name: proposal.params.proposer.metadata.name || "Unknown dApp",
                  icon: proposal.params.proposer.metadata.icons?.[0] || undefined,
                });
              })
              .catch((err: unknown) => {
                const errorMessage = err instanceof Error ? err.message : String(err);
                console.error("Session approval failed:", errorMessage);
                
                // Handle specific WalletConnect errors
                if (errorMessage.includes("expired") || errorMessage.includes("already been processed")) {
                  setError("Connection request expired. Please try connecting again from the dApp.");
                  setStatus("Connection expired - try again");
                } else if (errorMessage.includes("No matching key")) {
                  setError("Connection session invalid. Please refresh and try again.");
                  setStatus("Invalid session - refresh and retry");
                } else if (errorMessage.includes("Record was recently deleted") || errorMessage.includes("was deleted")) {
                  setError("Connection request was cancelled. Please try connecting again from the dApp.");
                  setStatus("Connection cancelled - try again");
                } else if (errorMessage.includes("no longer valid")) {
                  setError("Connection request is no longer valid. Please try connecting again from the dApp.");
                  setStatus("Invalid request - try again");
                } else {
                  setError(`Session approval failed: ${errorMessage}`);
                  setStatus(`Session approval failed: ${errorMessage}`);
                }
              });
          });

          // Enhanced request handling
          wallet.onRequest(async (event: { id: string; topic: string; params: { request: unknown } }) => {
            console.debug('[WalletConnect] Incoming request:', event);
            
            const wcTx = event.params.request as { method?: string; params?: unknown[] };
            
            // Verify session topic exists before processing
            const activeTopics = new Set(
              (wallet.getActiveSessions() as Array<{ topic?: string }>).map((s) => s.topic).filter(Boolean) as string[]
            );
            if (!activeTopics.has(event.topic)) {
              console.warn(`Ignoring request for unknown topic ${event.topic}`);
              setError(`Connection session expired. Please reconnect to the dApp.`);
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
                
                // Send only the transaction hash back to the dApp (standard format)
                const response = formatJsonRpcResult(Number(event.id), result.transactionHash);
                await wallet.sendSessionResponse(event.topic, response);
                
                // Show transaction success modal for dApp transactions
                setTransactionResult({
                  userOperationHash: result.userOperationHash,
                  transactionHash: result.transactionHash
                });
                setShowTransactionModal(true);
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
            setStatus("Session deleted");
            setConnectedDapp(null);
          });

          wallet.onProposalExpire(() => {
            setStatus("Proposal expired");
          });
        })
        .catch((err) => {
          console.error(err);
          setError(`WalletConnect initialization failed: ${String(err instanceof Error ? err.message : err)}`);
          setConnectionStatus('error');
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
    }
  }, [circleDeployment, circleAccountAddress, chainId, isTestnet]);

  // Utility functions
  const getChainInfo = (chainId: number) => {
    const allChains = { ...SUPPORTED_CHAINS.mainnet, ...SUPPORTED_CHAINS.testnet };
    return allChains[chainId.toString() as keyof typeof allChains] || { name: `Chain ${chainId}`, icon: "🔗", color: "text-gray-400" };
  };

  const canConnect = useMemo(() => Boolean(initialized && uri.startsWith("wc:")), [initialized, uri]);

  const handleConnect = useCallback(async () => {
    if (!walletRef.current) return;

    setStatus("Pairing with dApp...");
    try {
      await walletRef.current.connect(uri);
      setStatus("Paired successfully. Awaiting requests...");
    } catch (err: unknown) {
      setError(`Pairing failed: ${String(err instanceof Error ? err.message : err)}`);
    }
  }, [uri]);

  const sendTransaction = useCallback(async () => {
    if (!circleDeployment || !recipientAddress || !transactionAmount) {
      setError("Please provide recipient address and transaction amount");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setStatus("Processing transaction...");
      
      const amount = BigInt(transactionAmount);
      let result;

      if (selectedToken === "eth") {
        result = await circleDeployment.sendTransaction(recipientAddress, amount);
      } else {
        setError("USDC transactions not yet implemented");
        setLoading(false);
        return;
      }

      setTransactionResult(result);
      setShowTransactionModal(true);
      setStatus("Transaction completed successfully!");
      
      // Refresh balances
      refetchEthBalance();
      refreshUSDCBalance();
      
    } catch (err: unknown) {
      setError(`Transaction failed: ${err instanceof Error ? err.message : String(err)}`);
      setStatus("Transaction failed");
    } finally {
      setLoading(false);
    }
  }, [circleDeployment, recipientAddress, transactionAmount, selectedToken, refetchEthBalance]);

  // Function to refresh USDC balance
  const refreshUSDCBalance = useCallback(async () => {
    if (!circleDeployment) return;
    
    try {
      setStatus("Refreshing USDC balance...");
      const balance = await circleDeployment.checkUSDCBalance();
      setUsdcBalance((BigInt(balance) / BigInt(10 ** 6)).toString());
      setStatus("Balance refreshed!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(`Failed to refresh USDC balance: ${errorMessage}`);
    }
  }, [circleDeployment]);

  // Get current token info and balance
  const currentToken = TOKENS[selectedToken];
  const chainInfo = chainId ? getChainInfo(chainId) : null;



  // Handle disconnect from dApp
  const handleDisconnect = () => {
    if (walletRef.current) {
      // Get active sessions and disconnect them
      const activeSessions = walletRef.current.getActiveSessions();
      if (activeSessions && activeSessions.length > 0) {
        activeSessions.forEach((session: { topic?: string }) => {
          if (session.topic) {
            walletRef.current?.disconnectSession(session.topic);
          }
        });
      }
    }
    setConnectedDapp(null);
    setStatus("Disconnected from dApp");
  };

  // Handle disconnect from wallet
  const handleWalletDisconnect = async () => {
    try {
      await disconnectAsync();
      setStatus("Wallet disconnected");
      setConnectionStatus('idle');
      // Reset Circle deployment state
      setCircleDeployment(null);
      setCircleAccountAddress("");
      setUsdcBalance("");
      setEthBalance("");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      setError("Failed to disconnect wallet");
    }
  };

  // Unified Card View
  return (
    <>
      <UnifiedCard
        isConnected={isConnected}
        isDappConnected={!!connectedDapp}
        connectionStatus={connectionStatus}
        address={address}
        chainId={chainId}
        isTestnet={isTestnet}
        circleDeployment={circleDeployment}
        circleAccountAddress={circleAccountAddress}
        usdcBalance={usdcBalance}
        ethBalance={ethBalance}
        dappName={connectedDapp?.name}
        dappIcon={connectedDapp?.icon}
        uri={uri}
        setUri={setUri}
        canConnect={canConnect}
        onConnect={handleConnect}
        onDisconnect={connectedDapp ? handleDisconnect : handleWalletDisconnect}
        onRefreshBalance={refreshUSDCBalance}
        getChainInfo={getChainInfo}
        status={status}
        error={error}
      />
      
      {/* Transaction Success Modal */}
      <TransactionSuccessModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        transactionHash={transactionResult?.transactionHash || ""}
        userOperationHash={transactionResult?.userOperationHash || ""}
        dappName={connectedDapp?.name}
        dappIcon={connectedDapp?.icon}
        amount={transactionAmount}
        recipient={recipientAddress}
      />
    </>
  );
}



