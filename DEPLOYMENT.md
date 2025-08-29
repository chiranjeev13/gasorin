# Circle Smart Account Deployment Guide

This guide explains how to deploy Circle Smart Accounts using the Circle Paymaster for USDC gas payments.

## Overview

The Circle Smart Account deployment system allows you to:

1. **Deploy Circle Smart Accounts** on multiple chains
2. **Pay gas fees in USDC** instead of native tokens
3. **Use ERC-4337 standards** (v0.7 and v0.8)
4. **Connect to dapps** via WalletConnect

## Prerequisites

1. **Node.js and pnpm** installed
2. **Private key** for account deployment
3. **USDC balance** for gas payments
4. **WalletConnect Project ID** (for WalletConnect functionality)

## Installation

```bash
# Install dependencies
pnpm install

# Set environment variables
echo "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here" > .env.local

# Start development server
pnpm dev
```

## Supported Networks

### Mainnet Networks
- **Ethereum** (Chain ID: 1) - ERC-4337 v0.8
- **Polygon** (Chain ID: 137) - ERC-4337 v0.8
- **Optimism** (Chain ID: 10) - ERC-4337 v0.8
- **Arbitrum** (Chain ID: 42161) - ERC-4337 v0.7 & v0.8
- **Base** (Chain ID: 8453) - ERC-4337 v0.7 & v0.8
- **Avalanche** (Chain ID: 43114) - ERC-4337 v0.8
- **Unichain** (Chain ID: 71) - ERC-4337 v0.8

### Testnet Networks
- **Sepolia** (Chain ID: 11155111) - ERC-4337 v0.8
- **Mumbai** (Chain ID: 80001) - ERC-4337 v0.8
- **Optimism Sepolia** (Chain ID: 11155420) - ERC-4337 v0.8
- **Arbitrum Sepolia** (Chain ID: 421614) - ERC-4337 v0.7 & v0.8
- **Base Sepolia** (Chain ID: 84532) - ERC-4337 v0.7 & v0.8
- **Fuji** (Chain ID: 43113) - ERC-4337 v0.8

## Account Types

### Circle Smart Account
- Standard Circle Smart Account implementation
- Supports all ERC-4337 features
- Compatible with Circle Paymaster

### 7702 Smart Account
- Advanced smart account with additional features
- Requires authorization signing
- Enhanced security features

## Deployment Process

### Step 1: Initialize Deployment
1. Navigate to the **Account Deployment** tab
2. Enter your **private key** (keep it secure!)
3. Select **network type** (testnet/mainnet)
4. Choose your **chain**
5. Select **account type** (Circle or 7702)
6. Click **Initialize Deployment**

### Step 2: Check USDC Balance
- The system will automatically check your USDC balance
- Ensure you have sufficient USDC for gas payments
- For testnets, use the [Circle Faucet](https://faucet.circle.com)

### Step 3: Deploy Account
1. Click **Deploy Account**
2. The system will:
   - Create a permit signature for USDC allowance
   - Submit a user operation to the bundler
   - Deploy your smart account
3. Wait for confirmation

### Step 4: Send Transactions
1. Enter **recipient address**
2. Enter **amount** (in wei)
3. Click **Send Transaction**
4. Transaction will be paid in USDC via Circle Paymaster

## Technical Details

### Circle Paymaster Integration

The deployment system integrates with Circle Paymaster using:

```typescript
// EIP-2612 permit for USDC allowance
const permitSignature = await signPermit({
  tokenAddress: usdcAddress,
  account,
  client,
  spenderAddress: paymasterAddress,
  permitAmount: permitAmount,
});

// Paymaster data encoding
const paymasterData = encodePacked(
  ["uint8", "address", "uint256", "bytes"],
  [0, usdcAddress, permitAmount, permitSignature]
);
```

### Bundler Integration

Uses Pimlico bundler for user operation submission:

```typescript
const bundlerClient = createBundlerClient({
  account,
  client,
  paymaster,
  transport: http(`https://public.pimlico.io/v2/${chainId}/rpc`),
});
```

### Gas Estimation

Automatic gas estimation using Pimlico's gas price API:

```typescript
estimateFeesPerGas: async ({ account, bundlerClient, userOperation }) => {
  const { standard: fees } = await bundlerClient.request({
    method: "pimlico_getUserOperationGasPrice",
  });
  return { 
    maxFeePerGas: BigInt(fees.maxFeePerGas),
    maxPriorityFeePerGas: BigInt(fees.maxPriorityFeePerGas)
  };
}
```

## WalletConnect Integration

After deploying your account:

1. Go to the **WalletConnect** tab
2. Enter your **deployed account address**
3. Select the **correct chain ID**
4. Click **Set Circle Account**
5. Paste a **WalletConnect URI** from any dapp
6. Click **Connect**

The wallet will automatically approve sessions and handle requests using your Circle Smart Account.

## Security Considerations

### Private Key Security
- **Never share your private key**
- Use environment variables in production
- Consider using hardware wallets for mainnet

### USDC Allowance
- The system requests a large USDC allowance (10,000,000 wei)
- This allows for multiple transactions
- You can revoke the allowance anytime

### Network Selection
- Always test on testnets first
- Verify chain ID before mainnet deployment
- Check USDC contract addresses

## Troubleshooting

### Common Issues

1. **"Insufficient USDC balance"**
   - Fund your account with USDC
   - Use Circle faucet for testnets

2. **"Invalid private key"**
   - Ensure private key starts with 0x
   - Check for extra spaces or characters

3. **"Chain not supported"**
   - Verify chain ID is in supported list
   - Check if using correct network type

4. **"Deployment failed"**
   - Check network connectivity
   - Verify bundler endpoint
   - Ensure sufficient USDC for gas

### Debug Information

The deployment system provides detailed logs:
- User operation hashes
- Transaction hashes
- Error messages
- Gas estimates

## API Reference

### CircleAccountDeployment Class

```typescript
const deployment = new CircleAccountDeployment(
  privateKey: string,
  chainId: string,
  isTestnet: boolean
);

// Initialize account
await deployment.initializeAccount(accountType: "circle" | "7702");

// Check USDC balance
const balance = await deployment.checkUSDCBalance();

// Deploy account
const result = await deployment.deployAccount();

// Send transaction
const txResult = await deployment.sendTransaction(
  to: string,
  value: bigint,
  data?: string
);
```

### Utility Functions

```typescript
// Get supported chains
const chains = getSupportedChains();

// Validate chain ID
const isValid = validateChainId(chainId, isTestnet);
```

## Resources

- [Circle Paymaster Documentation](https://developers.circle.com/stablecoins/paymaster-overview)
- [ERC-4337 Specification](https://eips.ethereum.org/EIPS/eip-4337)
- [Circle Faucet](https://faucet.circle.com)
- [Pimlico Bundler](https://pimlico.io)

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review error logs in the UI
3. Verify network and contract addresses
4. Test on testnets first
