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

    // Set up event listeners
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.wc.on("session_proposal", (proposal: any) => {
      this.listeners.onProposal?.(proposal);
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
    } catch (error) {
      console.error("Session approval failed:", error);
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
