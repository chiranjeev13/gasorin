import {
  createPublicClient,
  http,
  getContract,
  encodePacked,
  maxUint256,
  parseErc6492Signature,
  type PublicClient,
  type Account,
  type Chain,
} from "viem";
import {
  arbitrumSepolia,
  arbitrum,
  base,
  mainnet,
  polygon,
  optimism,
  avalanche,
  baseSepolia,
  sepolia,
  polygonMumbai,
  optimismSepolia,
  arbitrumSepolia as arbitrumSepoliaChain,
  avalancheFuji,
} from "viem/chains";
import { privateKeyToAccount, type PrivateKeyAccount } from "viem/accounts";
import {
  toCircleSmartAccount,
  type CircleSmartAccount,
} from "@circle-fin/modular-wallets-core";
import { createBundlerClient } from "viem/account-abstraction";

// Circle Paymaster addresses for different chains
export const CIRCLE_PAYMASTER_ADDRESSES: Record<string, string> = {
  // ERC-4337 v0.7
  "42161": "0x31BE08D380A21fc740883c0BC434FcFc88740b58", // Arbitrum
  "8453": "0x31BE08D380A21fc740883c0BC434FcFc88740b58", // Base

  // ERC-4337 v0.8
  "1": "0x31BE08D380A21fc740883c0BC434FcFc88740b58", // Ethereum
  "137": "0x31BE08D380A21fc740883c0BC434FcFc88740b58", // Polygon
  "10": "0x31BE08D380A21fc740883c0BC434FcFc88740b58", // Optimism
  "43114": "0x31BE08D380A21fc740883c0BC434FcFc88740b58", // Avalanche
  "71": "0x31BE08D380A21fc740883c0BC434FcFc88740b58", // Unichain
};

// USDC addresses for different chains
export const USDC_ADDRESSES: Record<string, string> = {
  "42161": "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // Arbitrum
  "8453": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base
  "1": "0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C", // Ethereum
  "137": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // Polygon
  "10": "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // Optimism
  "43114": "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", // Avalanche
  "71": "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // Unichain (using Optimism USDC)
};

// Testnet addresses - Fixed with correct checksum addresses
export const TESTNET_USDC_ADDRESSES: Record<string, string> = {
  "421614": "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", // Arbitrum Sepolia
  "84532": "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia - Fixed checksum
  "11155111": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Sepolia
  "80001": "0x9999f7Fea5938fD3b1E26A12c3f2fb024e194f97", // Mumbai
  "11155420": "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8", // Optimism Sepolia
  "43113": "0x5425890298aed601595a70AB815c96711a31Bc65", // Fuji
};

// Complete EIP-2612 permit ABI for USDC
export const eip2612Abi = [
  // ERC-20 functions
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  // EIP-2612 permit functions
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
    name: "nonces",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    inputs: [],
    name: "version",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
    ],
    name: "permit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class CirclePaymasterClient {
  private client: PublicClient;
  private owner: PrivateKeyAccount;
  private account: CircleSmartAccount | null = null;
  private chainId: string;
  private isTestnet: boolean;

  constructor(privateKey: string, chainId: number, isTestnet: boolean = false) {
    this.chainId = chainId.toString();
    this.isTestnet = isTestnet;

    const chain = this.getChain(this.chainId);
    this.client = createPublicClient({ chain, transport: http() });
    this.owner = privateKeyToAccount(privateKey as `0x${string}`);
  }

  private getChain(chainId: string): Chain {
    const chainMap: Record<string, Chain> = {
      "1": mainnet,
      "137": polygon,
      "10": optimism,
      "42161": arbitrum,
      "8453": base,
      "43114": avalanche,
      "11155111": sepolia, // Sepolia
      "80001": polygonMumbai, // Mumbai
      "11155420": optimismSepolia, // Optimism Sepolia
      "421614": arbitrumSepoliaChain, // Arbitrum Sepolia
      "84532": baseSepolia, // Base Sepolia
      "43113": avalancheFuji, // Fuji
    };

    return chainMap[chainId] || mainnet;
  }

  async initializeAccount() {
    try {
      this.account = await toCircleSmartAccount({
        client: this.client,
        owner: this.owner,
      });

      console.log(`Account initialized: ${this.account.address}`);
      return this.account;
    } catch (error) {
      console.error("Failed to initialize account:", error);
      throw error;
    }
  }

  async getAccountAddress(): Promise<string> {
    if (!this.account) {
      await this.initializeAccount();
    }
    return this.account!.address;
  }

  async getUsdcBalance(): Promise<bigint> {
    if (!this.account) {
      await this.initializeAccount();
    }

    const usdcAddress = this.getUSDCAddress();
    const usdc = getContract({
      client: this.client,
      address: usdcAddress as `0x${string}`,
      abi: eip2612Abi,
    });

    try {
      const balance = await usdc.read.balanceOf([this.account!.address]);
      console.log(`USDC Balance: ${balance.toString()}`);
      return balance;
    } catch (error) {
      console.error("Failed to check USDC balance:", error);
      throw error;
    }
  }

  private getUSDCAddress(): string {
    const addressMap = this.isTestnet ? TESTNET_USDC_ADDRESSES : USDC_ADDRESSES;
    return addressMap[this.chainId] || USDC_ADDRESSES["1"];
  }

  private getPaymasterAddress(): string {
    return (
      CIRCLE_PAYMASTER_ADDRESSES[this.chainId] ||
      CIRCLE_PAYMASTER_ADDRESSES["1"]
    );
  }

  async signPermit(spenderAddress: string, permitAmount: bigint) {
    if (!this.account) {
      await this.initializeAccount();
    }

    const usdcAddress = this.getUSDCAddress();
    const token = getContract({
      client: this.client,
      address: usdcAddress as `0x${string}`,
      abi: eip2612Abi,
    });

    const permitData = await this.eip2612Permit({
      token,
      ownerAddress: this.account!.address,
      spenderAddress,
      value: permitAmount,
    });

    const wrappedPermitSignature = await this.account!.signTypedData(
      permitData
    );
    const { signature } = parseErc6492Signature(wrappedPermitSignature);

    return signature;
  }

  private async eip2612Permit({
    token,
    ownerAddress,
    spenderAddress,
    value,
  }: {
    token: ReturnType<typeof getContract>;
    ownerAddress: string;
    spenderAddress: string;
    value: bigint;
  }) {
    return {
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      },
      primaryType: "Permit",
      domain: {
        name: await token.read.name(),
        version: await token.read.version(),
        chainId: this.client.chain.id,
        verifyingContract: token.address,
      },
      message: {
        owner: ownerAddress,
        spender: spenderAddress,
        value: value.toString(),
        nonce: (await token.read.nonces([ownerAddress])).toString(),
        deadline: maxUint256.toString(),
      },
    };
  }

  async createPaymasterData(permitAmount: bigint = BigInt(10000000)) {
    if (!this.account) {
      await this.initializeAccount();
    }

    const paymasterAddress = this.getPaymasterAddress();
    const usdcAddress = this.getUSDCAddress();

    const permitSignature = await this.signPermit(
      paymasterAddress,
      permitAmount
    );

    const paymasterData = encodePacked(
      ["uint8", "address", "uint256", "bytes"],
      [0, usdcAddress as `0x${string}`, permitAmount, permitSignature]
    );

    return {
      paymaster: paymasterAddress as `0x${string}`,
      paymasterData,
      paymasterVerificationGasLimit: BigInt(200000),
      paymasterPostOpGasLimit: BigInt(15000),
      isFinal: true,
    };
  }

  async sendTransaction(transaction: {
    to: string;
    value?: bigint;
    data?: string;
  }): Promise<string> {
    if (!this.account) {
      await this.initializeAccount();
    }

    try {
      const paymaster = await this.createPaymasterData();

      const bundlerClient = createBundlerClient({
        account: this.account!,
        client: this.client,
        paymaster: true, // Use simple paymaster flag
        userOperation: {
          estimateFeesPerGas: async () => {
            // Use default gas estimation
            return {
              maxFeePerGas: BigInt(20000000000),
              maxPriorityFeePerGas: BigInt(1000000000),
            };
          },
        },
        transport: http(
          `https://api.pimlico.io/v2/${this.chainId}/rpc?apikey=pim_LiPzgUW8Y9rAntyZLntsjR`
        ),
      });

      const hash = await bundlerClient.sendUserOperation({
        account: this.account!,
        calls: [
          {
            to: transaction.to as `0x${string}`,
            value: transaction.value || BigInt(0),
            data: (transaction.data || "0x") as `0x${string}`,
          },
        ],
      });

      console.log("Transaction sent. UserOperation hash:", hash);

      const receipt = await bundlerClient.waitForUserOperationReceipt({ hash });
      console.log(
        "Transaction confirmed. Transaction hash:",
        receipt.receipt.transactionHash
      );

      return receipt.receipt.transactionHash;
    } catch (error) {
      console.error("Failed to send transaction:", error);
      throw error;
    }
  }

  async checkUsdcBalance(): Promise<{ balance: bigint; hasEnough: boolean }> {
    const balance = await this.getUsdcBalance();
    const hasEnough = balance >= BigInt(1000000); // At least 1 USDC (6 decimals)
    return { balance, hasEnough };
  }

  getPaymasterInfo() {
    return {
      address: this.getPaymasterAddress(),
      usdcAddress: this.getUSDCAddress(),
      chainId: this.chainId,
      isTestnet: this.isTestnet,
    };
  }
}
