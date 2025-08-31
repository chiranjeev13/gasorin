import { Web3Wallet, Web3WalletTypes } from "@walletconnect/web3wallet";
import { Core } from "@walletconnect/core";
import { JsonRpcResponse } from "@walletconnect/jsonrpc-utils";

// Circle Smart Account compatible methods for ERC-4337
const CIRCLE_COMPATIBLE_METHODS = [
  "eth_sendTransaction",
  "eth_sign",
  "personal_sign",
  "eth_signTypedData",
  "eth_signTypedData_v4",
  "eth_chainId",
  "eth_getBalance",
  "eth_getCode",
  "eth_getTransactionCount",
  "eth_getTransactionReceipt",
  "eth_estimateGas",
  "eth_call",
  "eth_getLogs",
  "eth_getBlockByNumber",
  "eth_getBlockByHash",
  "eth_getTransactionByHash",
  "eth_getTransactionByBlockHashAndIndex",
  "eth_getTransactionByBlockNumberAndIndex",
  "eth_getUncleByBlockHashAndIndex",
  "eth_getUncleByBlockNumberAndIndex",
  "eth_getUncleCountByBlockHash",
  "eth_getUncleCountByBlockNumber",
  "eth_getStorageAt",
  "eth_protocolVersion",
  "eth_syncing",
  "eth_coinbase",
  "eth_mining",
  "eth_hashrate",
  "eth_gasPrice",
  "eth_accounts",
  "eth_blockNumber",
  "eth_getBlockTransactionCountByHash",
  "eth_getBlockTransactionCountByNumber",
  "eth_newFilter",
  "eth_newBlockFilter",
  "eth_newPendingTransactionFilter",
  "eth_uninstallFilter",
  "eth_getFilterChanges",
  "eth_getFilterLogs",
  "eth_subscribe",
  "eth_unsubscribe",
];

const CIRCLE_COMPATIBLE_EVENTS = [
  "accountsChanged",
  "chainChanged",
  "connect",
  "disconnect",
  "message",
];

// Supported chains for Circle Paymaster - Mainnet
const SUPPORTED_MAINNET_CHAINS = {
  // ERC-4337 v0.7
  "eip155:42161": "Arbitrum",
  "eip155:8453": "Base",

  // ERC-4337 v0.8
  "eip155:1": "Ethereum",
  "eip155:137": "Polygon",
  "eip155:10": "Optimism",
  "eip155:43114": "Avalanche",
  "eip155:71": "Unichain",
};

// Supported chains for Circle Paymaster - Testnet
const SUPPORTED_TESTNET_CHAINS = {
  "eip155:11155111": "Sepolia",
  "eip155:80001": "Mumbai",
  "eip155:11155420": "Optimism Sepolia",
  "eip155:421614": "Arbitrum Sepolia",
  "eip155:84532": "Base Sepolia",
  "eip155:43113": "Fuji",
};

export class CircleWalletConnect {
  private wc: InstanceType<typeof Web3Wallet> | null = null;
  private core: InstanceType<typeof Core>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listeners: { [key: string]: ((arg: any) => void) | undefined } = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private activeSessions: Record<string, any> = {};
  private circleAccountAddress: string | null = null;
  private chainId: string = "1"; // Default to Ethereum mainnet
  private isTestnet: boolean = false; // Default to mainnet
  private proposalQueue: Set<string> = new Set(); // Track proposals to prevent duplicates

  constructor(projectId: string) {
    this.core = new Core({ projectId });
  }

  async init() {
    this.wc = await Web3Wallet.init({
      core: this.core,
      metadata: {
        name: "Circle Smart Account",
        description:
          "Connect dapps to your Circle Smart Account with USDC gas payments",
        url: "https://developers.circle.com",
        icons: ["https://developers.circle.com/img/favicon.ico"],
      },
    });

    // Load existing sessions
    this.activeSessions = this.wc.getActiveSessions();

    // Set up event listeners with enhanced proposal handling
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.wc.on("session_proposal", (proposal: any) => {
      // Track the proposal to prevent duplicate processing
      if (proposal?.id) {
        this.proposalQueue.add(proposal.id);
      }

      // Add a small delay to ensure the proposal is fully registered
      setTimeout(() => {
        this.listeners.onProposal?.(proposal);
      }, 100); // Increased delay for better reliability
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.wc.on("session_request", (event: any) => {
      this.listeners.onRequest?.(event);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.wc.on("session_delete", (event: any) => {
      this.activeSessions = this.wc?.getActiveSessions() || {};
      this.listeners.onSessionDelete?.(event);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.wc.on("proposal_expire", (event: any) => {
      console.log("Session proposal expired:", event);
      // Clean up expired proposal from queue
      if (event?.id) {
        this.proposalQueue.delete(event.id);
      }
      this.listeners.onProposalExpire?.(event);
    });
  }

  async connect(uri: string) {
    if (!this.wc) throw new Error("WalletConnect not initialized");
    await this.wc.core.pairing.pair({ uri });
  }

  // Set Circle Smart Account address
  setCircleAccountAddress(address: string) {
    this.circleAccountAddress = address;
  }

  // Set chain ID for the wallet
  setChainId(chainId: string) {
    this.chainId = chainId;
  }

  // Set network type (mainnet/testnet)
  setNetworkType(isTestnet: boolean) {
    this.isTestnet = isTestnet;
  }

  // Event listeners
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSessionProposal(cb: (proposal: any) => void) {
    this.listeners.onProposal = cb;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRequest(cb: (event: any) => void) {
    this.listeners.onRequest = cb;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSessionDelete(cb: (event: any) => void) {
    this.listeners.onSessionDelete = cb;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onProposalExpire(cb: (event: any) => void) {
    this.listeners.onProposalExpire = cb;
  }

  // Get active sessions
  getActiveSessions() {
    if (!this.wc) return [];
    this.activeSessions = this.wc.getActiveSessions();
    return Object.values(this.activeSessions);
  }

  // Disconnect from a session
  async disconnectSession(topic: string) {
    if (!this.wc) throw new Error("WalletConnect not initialized");
    await this.wc.disconnectSession({
      topic,
      reason: { code: 6000, message: "User disconnected" },
    });
    this.activeSessions = this.wc.getActiveSessions();
  }

  // Approve session with Circle Smart Account
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async approveSession(proposal: any) {
    if (!this.wc) throw new Error("WalletConnect not initialized");

    // Check if proposal is still valid
    if (!proposal || !proposal.id) {
      throw new Error("Invalid session proposal: missing proposal ID");
    }

    // More aggressive validation to prevent "Record was recently deleted" errors
    try {
      // Verify the proposal still exists in the pending proposals
      const pendingProposals = this.wc.getPendingSessionProposals();
      const proposalExists = Object.values(pendingProposals).some(
        (p: unknown) => (p as { id?: string })?.id === proposal.id
      );

      if (!proposalExists) {
        // Double-check if this is a timing issue by waiting a moment and checking again
        await new Promise((resolve) => setTimeout(resolve, 100));
        const pendingProposalsRetry = this.wc.getPendingSessionProposals();
        const proposalExistsRetry = Object.values(pendingProposalsRetry).some(
          (p: unknown) => (p as { id?: string })?.id === proposal.id
        );

        if (!proposalExistsRetry) {
          throw new Error(
            `Session proposal ${proposal.id} has expired or already been processed`
          );
        }
      }
    } catch (error) {
      console.warn("Proposal validation failed:", error);
      // Don't continue with approval if validation fails
      throw error;
    }

    const requiredNamespaces = proposal.params.requiredNamespaces || {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const namespaces: Record<string, any> = {};

    console.log(
      "DEBUG: Required namespaces:",
      JSON.stringify(requiredNamespaces, null, 2)
    );

    // If no required namespaces are specified, provide default EIP155 namespace
    if (Object.keys(requiredNamespaces).length === 0) {
      console.log(
        "DEBUG: No required namespaces found, providing default EIP155 namespace"
      );

      // Use Circle account if set, otherwise use a placeholder account
      const accountAddress =
        this.circleAccountAddress ||
        "0x0000000000000000000000000000000000000000";

      // Validate that we have a proper account address
      if (!this.circleAccountAddress) {
        console.warn(
          "DEBUG: No Circle account address set, using placeholder address"
        );
      }

      namespaces.eip155 = {
        accounts: [`eip155:${this.chainId}:${accountAddress}`],
        methods: CIRCLE_COMPATIBLE_METHODS,
        events: CIRCLE_COMPATIBLE_EVENTS,
        chains: [`eip155:${this.chainId}`],
      };

      console.log(
        "DEBUG: Default EIP155 namespace:",
        JSON.stringify(namespaces.eip155, null, 2)
      );
    } else {
      // Handle each required namespace
      Object.keys(requiredNamespaces).forEach((key) => {
        const ns = requiredNamespaces[key];

        if (key === "eip155") {
          // For Ethereum namespace, provide Circle Smart Account or fallback
          const methods =
            Array.isArray(ns.methods) && ns.methods.length > 0
              ? ns.methods
              : CIRCLE_COMPATIBLE_METHODS;

          const events =
            Array.isArray(ns.events) && ns.events.length > 0
              ? ns.events
              : CIRCLE_COMPATIBLE_EVENTS;

          const chains =
            Array.isArray(ns.chains) && ns.chains.length > 0
              ? ns.chains
              : [`eip155:${this.chainId}`];

          // Use Circle account if set, otherwise use a placeholder account
          const accountAddress =
            this.circleAccountAddress ||
            "0x0000000000000000000000000000000000000000";

          // Ensure we have valid accounts for the requested chains
          const accounts = chains.map(
            (chain: string) => `${chain}:${accountAddress}`
          );

          namespaces[key] = {
            accounts,
            methods,
            events,
            chains,
          };

          console.log(
            "DEBUG: EIP155 namespace:",
            JSON.stringify(namespaces[key], null, 2)
          );
        } else {
          // For other namespaces, provide basic structure
          namespaces[key] = {
            accounts: [],
            methods: ns.methods || [],
            events: ns.events || [],
            chains: ns.chains || [],
          };
        }
      });
    }

    console.log(
      "DEBUG: Final namespaces object:",
      JSON.stringify(namespaces, null, 2)
    );

    try {
      await this.wc.approveSession({
        id: proposal.id,
        namespaces,
      });

      // Update active sessions after approval
      this.activeSessions = this.wc.getActiveSessions();

      // Remove from proposal queue after successful approval
      this.proposalQueue.delete(proposal.id);
    } catch (error) {
      console.error("Session approval failed:", error);

      // Handle specific WalletConnect errors
      if (error instanceof Error) {
        if (
          error.message.includes("No matching key") ||
          error.message.includes("proposal")
        ) {
          throw new Error(
            `Session proposal ${proposal.id} has expired or already been processed. Please try connecting again.`
          );
        }
        if (error.message.includes("Record was recently deleted")) {
          throw new Error(
            `Session proposal ${proposal.id} was deleted. Please try connecting again from the dApp.`
          );
        }
        if (error.message.includes("namespaces")) {
          throw new Error(
            "Invalid session configuration. Please check your wallet setup."
          );
        }
      }

      throw error;
    }
  }

  // Reject session
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async rejectSession(proposal: any) {
    if (!this.wc) throw new Error("WalletConnect not initialized");
    await this.wc.rejectSession({
      id: proposal.id,
      reason: { code: 5000, message: "User rejected" },
    });
  }

  // Send session response (for transaction approval/rejection)
  async sendSessionResponse(topic: string, response: JsonRpcResponse) {
    if (!this.wc) throw new Error("WalletConnect not initialized");
    await this.wc.respondSessionRequest({ topic, response });
  }

  // Get supported chains for Circle Paymaster
  getSupportedChains() {
    return this.isTestnet ? SUPPORTED_TESTNET_CHAINS : SUPPORTED_MAINNET_CHAINS;
  }

  // Check if a chain is supported by Circle Paymaster
  isChainSupported(chainId: string): boolean {
    const supportedChains = this.isTestnet
      ? SUPPORTED_TESTNET_CHAINS
      : SUPPORTED_MAINNET_CHAINS;
    return `eip155:${chainId}` in supportedChains;
  }

  // Get all supported chains (both mainnet and testnet)
  getAllSupportedChains() {
    return {
      mainnet: SUPPORTED_MAINNET_CHAINS,
      testnet: SUPPORTED_TESTNET_CHAINS,
    };
  }

  // Get Circle Paymaster information
  getPaymasterInfo() {
    const networkType = this.isTestnet ? "Testnet" : "Mainnet";
    const supportedChains = this.getSupportedChains();

    return {
      description: "Circle Paymaster allows users to pay gas fees in USDC",
      networkType,
      supportedChains,
      pricing: this.isTestnet
        ? "Free on testnets"
        : "10% surcharge on gas fees (after July 2025)",
      token: "USDC only",
      standard: "ERC-4337 v0.7 and v0.8",
      documentation:
        "https://developers.circle.com/stablecoins/paymaster-overview",
    };
  }

  // Get current network configuration
  getNetworkConfig() {
    return {
      chainId: this.chainId,
      isTestnet: this.isTestnet,
      circleAccountAddress: this.circleAccountAddress,
      supportedChains: this.getSupportedChains(),
    };
  }

  // Check if wallet is properly configured
  isConfigured(): boolean {
    return Boolean(
      this.circleAccountAddress &&
        this.circleAccountAddress !==
          "0x0000000000000000000000000000000000000000"
    );
  }

  // Get configuration status
  getConfigurationStatus() {
    return {
      isConfigured: this.isConfigured(),
      hasCircleAccount: Boolean(this.circleAccountAddress),
      chainId: this.chainId,
      isTestnet: this.isTestnet,
      circleAccountAddress: this.circleAccountAddress,
    };
  }

  // Get RPC URL for the current network
  getRpcUrl(): string {
    const rpcUrls: Record<string, string> = {
      // Mainnet
      "1": "https://eth.llamarpc.com",
      "137": "https://polygon-rpc.com",
      "10": "https://mainnet.optimism.io",
      "42161": "https://arb1.arbitrum.io/rpc",
      "8453": "https://mainnet.base.org",
      "43114": "https://api.avax.network/ext/bc/C/rpc",
      "71": "https://rpc.unichain.world",

      // Testnet
      "11155111": "https://rpc.sepolia.org",
      "80001": "https://rpc-mumbai.maticvigil.com",
      "11155420": "https://sepolia.optimism.io",
      "421614": "https://sepolia-rollup.arbitrum.io/rpc",
      "84532": "https://sepolia.base.org",
      "43113": "https://api.avax-test.network/ext/bc/C/rpc",
    };

    return rpcUrls[this.chainId] || "https://eth.llamarpc.com";
  }

  // Make RPC call to blockchain
  async makeRpcCall(method: string, params: unknown[] = []): Promise<unknown> {
    try {
      const response = await fetch(this.getRpcUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method,
          params,
        }),
      });

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error(`RPC call failed for ${method}:`, error);
      throw error;
    }
  }

  // Send transaction using Circle Smart Account
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async sendTransaction(params: any): Promise<{ userOperationHash: string; transactionHash: string }> {
    console.log("DEBUG: Sending transaction:", params[0]);

    // Check if Circle deployment is available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const circleClient = (this as any).circleDeployment;

    if (!circleClient) {
      throw new Error(
        "Circle deployment not initialized. Please create a Circle deployment first."
      );
    }

    try {
      const txParams = params[0];
      const to = txParams.to;
      const value = txParams.value ? BigInt(txParams.value) : BigInt(0);
      const data = txParams.data || "0x";

      console.log("DEBUG: Using Circle client to send transaction");
      console.log("DEBUG: To:", to);
      console.log("DEBUG: Value:", value.toString());
      console.log("DEBUG: Data:", data);

      // Use the Circle client to send the transaction
      const result = await circleClient.sendTransaction(to, value, data);

      console.log("DEBUG: Transaction result:", result);

      // Return the full result object
      return {
        userOperationHash: result.userOperationHash,
        transactionHash: result.transactionHash
      };
    } catch (error) {
      console.error("DEBUG: Transaction failed:", error);
      throw error;
    }
  }

  // Method to set Circle deployment instance for transaction handling
  setCircleDeployment(circleClient: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).circleDeployment = circleClient;
  }

  // Clean up invalid or expired sessions
  private cleanupInvalidSessions() {
    if (!this.wc) return;

    try {
      // Get current active sessions
      const currentSessions = this.wc.getActiveSessions();

      // Check for any sessions that might be invalid
      Object.entries(currentSessions).forEach(([topic, session]) => {
        // If session has no expiry or is expired, mark for cleanup
        if (!session.expiry || session.expiry < Date.now() / 1000) {
          console.log(`Cleaning up expired session: ${topic}`);
          // The session will be automatically cleaned up by WalletConnect
        }
      });

      // Update our local reference
      this.activeSessions = this.wc.getActiveSessions();
    } catch (error) {
      console.warn("Session cleanup failed:", error);
    }
  }

  // Check if a proposal is still valid before attempting approval
  private isProposalValid(proposalId: string): boolean {
    if (!this.wc) return false;

    // First check if we're tracking this proposal
    if (!this.proposalQueue.has(proposalId)) {
      console.warn(`Proposal ${proposalId} not found in tracking queue`);
      return false;
    }

    try {
      const pendingProposals = this.wc.getPendingSessionProposals();
      const isValid = Object.values(pendingProposals).some(
        (p: unknown) => (p as { id?: string })?.id === proposalId
      );

      if (!isValid) {
        // Remove from queue if no longer valid
        this.proposalQueue.delete(proposalId);
      }

      return isValid;
    } catch (error) {
      console.warn("Error checking proposal validity:", error);
      return false;
    }
  }

  // Enhanced session proposal handling with retry logic
  async approveSessionWithRetry(
    proposal: unknown,
    maxRetries = 2
  ): Promise<void> {
    let lastError: Error | null = null;

    // Pre-validate the proposal before attempting approval
    const proposalId = (proposal as { id?: string })?.id;
    if (proposalId && !this.isProposalValid(proposalId)) {
      throw new Error(
        `Session proposal ${proposalId} is no longer valid. Please try connecting again from the dApp.`
      );
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.approveSession(proposal);
        return; // Success, exit the retry loop
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // If it's a "deleted" or "expired" error, don't retry
        if (
          lastError.message.includes("deleted") ||
          lastError.message.includes("expired") ||
          lastError.message.includes("already been processed") ||
          lastError.message.includes("no longer valid")
        ) {
          throw lastError;
        }

        // For other errors, retry after a short delay
        if (attempt < maxRetries) {
          console.log(
            `Session approval attempt ${attempt} failed, retrying...`
          );
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        }
      }
    }

    // If we get here, all retries failed
    throw (
      lastError || new Error("Session approval failed after multiple attempts")
    );
  }
}

// Legacy export for backward compatibility
export async function initWalletConnect({ projectId }: { projectId: string }) {
  const wallet = new CircleWalletConnect(projectId);
  await wallet.init();
  return wallet;
}

export async function pairWithUri(uri: string) {
  // This would need to be called on an instance
  throw new Error("Use CircleWalletConnect class instead");
}

export function onWalletEvent(cb: (message: string) => void) {
  // This would need to be called on an instance
  throw new Error("Use CircleWalletConnect class instead");
}
