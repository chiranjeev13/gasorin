# Circle Smart Account WalletConnect

A WalletConnect implementation for Circle Smart Accounts that supports USDC gas payments via Circle Paymaster.

## Features

- **Circle Smart Account Integration**: Connect dapps to your Circle Smart Account
- **USDC Gas Payments**: Pay for gas fees using USDC instead of native tokens
- **ERC-4337 Support**: Compatible with ERC-4337 v0.7 and v0.8 standards
- **Multi-Chain Support**: Supports Ethereum, Polygon, Optimism, Arbitrum, Base, Avalanche, and Unichain

## Supported Chains

### ERC-4337 v0.7
- Arbitrum
- Base

### ERC-4337 v0.8
- Ethereum
- Polygon
- Optimism
- Arbitrum
- Base
- Avalanche
- Unichain

## Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set environment variables**:
   Create a `.env.local` file with your WalletConnect Project ID:
   ```env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
   ```
   
   Get a Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/)

3. **Run the development server**:
   ```bash
   pnpm dev
   ```

## Usage

1. **Set your Circle Smart Account address** and **chain ID** in the UI
2. **Paste a WalletConnect URI** from any dapp (like Aave, Uniswap, etc.)
3. **Click Connect** to establish the connection
4. The wallet will automatically approve session proposals if a Circle account is set

## Circle Paymaster Integration

This implementation is designed to work with Circle Paymaster for USDC gas payments. The Circle Paymaster:

- Allows users to pay gas fees in USDC instead of native tokens
- Supports ERC-4337 smart accounts
- Has a 10% surcharge on gas fees (after July 2025)
- Works on multiple chains

For more information, see the [Circle Paymaster documentation](https://developers.circle.com/stablecoins/paymaster-overview).

## API Reference

### CircleWalletConnect Class

```typescript
const wallet = new CircleWalletConnect(projectId);
await wallet.init();

// Set your Circle Smart Account
wallet.setCircleAccountAddress("0x...");
wallet.setChainId("1"); // Ethereum mainnet

// Connect to a dapp
await wallet.connect("wc:...");

// Handle session proposals
wallet.onSessionProposal((proposal) => {
  // Auto-approve or show approval UI
  wallet.approveSession(proposal);
});

// Handle requests
wallet.onRequest((event) => {
  // Handle transaction requests, signing, etc.
});
```

### Methods

- `init()`: Initialize the WalletConnect instance
- `connect(uri)`: Connect to a dapp using a WalletConnect URI
- `setCircleAccountAddress(address)`: Set the Circle Smart Account address
- `setChainId(chainId)`: Set the chain ID for the wallet
- `approveSession(proposal)`: Approve a session proposal
- `rejectSession(proposal)`: Reject a session proposal
- `disconnectSession(topic)`: Disconnect from a session
- `getActiveSessions()`: Get all active sessions
- `getSupportedChains()`: Get supported chains for Circle Paymaster
- `isChainSupported(chainId)`: Check if a chain is supported
- `getPaymasterInfo()`: Get Circle Paymaster information

### Event Listeners

- `onSessionProposal(callback)`: Handle session proposals
- `onRequest(callback)`: Handle session requests
- `onSessionDelete(callback)`: Handle session deletions
- `onProposalExpire(callback)`: Handle proposal expirations

## Example Integration

```typescript
import { CircleWalletConnect } from "@/lib/walletconnect";

// Initialize wallet
const wallet = new CircleWalletConnect(process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!);
await wallet.init();

// Set Circle Smart Account
wallet.setCircleAccountAddress("0x1234567890123456789012345678901234567890");
wallet.setChainId("1"); // Ethereum

// Handle session proposals
wallet.onSessionProposal((proposal) => {
  console.log("Session proposal from:", proposal.params.proposer.metadata.name);
  
  // Auto-approve the session
  wallet.approveSession(proposal)
    .then(() => console.log("Session approved"))
    .catch(err => console.error("Approval failed:", err));
});

// Handle requests
wallet.onRequest((event) => {
  console.log("Request method:", event.params.request.method);
  
  // Handle different request types
  switch (event.params.request.method) {
    case "eth_sendTransaction":
      // Handle transaction requests
      break;
    case "eth_sign":
      // Handle signing requests
      break;
    default:
      // Handle other requests
      break;
  }
});

// Connect to a dapp
await wallet.connect("wc:8b73492af1d66ec97731b8c94ae68072df08e11715a101046828928b6246712b@2?relay-protocol=irn&symKey=d0835e3484886764c81d556c1d083f63ac62b63082f10120feeea0455a4c79c3&expiryTimestamp=1756464517");
```

## Troubleshooting

### Common Issues

1. **"Missing or invalid. approve(), namespaces should be an object with data"**
   - Make sure you've set a Circle Smart Account address before approving sessions
   - Check that the chain ID is supported by Circle Paymaster

2. **Connection fails**
   - Verify your WalletConnect Project ID is correct
   - Check that the URI is valid and not expired

3. **Session approval fails**
   - Ensure the Circle Smart Account address is valid
   - Verify the chain ID matches your account's chain

### Debug Mode

The UI includes a detailed event log that shows all WalletConnect events. Use this to debug connection issues.

## Resources

- [Circle Paymaster Documentation](https://developers.circle.com/stablecoins/paymaster-overview)
- [WalletConnect Documentation](https://docs.walletconnect.com/)
- [ERC-4337 Specification](https://eips.ethereum.org/EIPS/eip-4337)
