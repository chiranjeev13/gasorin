# Gasorin

A modern, cyber-inspired WalletConnect implementation for Circle Smart Accounts that supports USDC gas payments via Circle Paymaster. Features automatic Base Sepolia network switching and a sleek, monospaced UI design.

## ✨ Features

### 🔗 Core Functionality
- **Circle Smart Account Integration**: Connect dapps to your Circle Smart Account
- **USDC Gas Payments**: Pay for gas fees using USDC instead of native tokens
- **ERC-4337 Support**: Compatible with ERC-4337 v0.7 and v0.8 standards
- **Automatic Base Sepolia**: Auto-switches to Base Sepolia for optimal Circle Paymaster experience
- **Transaction Success Modal**: Beautiful modal showing transaction details with explorer links

### 🎨 UI/UX Design
- **Cyber-Inspired Theme**: Black and white color scheme with green/red accents
- **Departure Mono Font**: Monospaced typography for a techy, game-like feel
- **Sharp Edges**: No border-radius, maintaining digital aesthetic
- **Grid-Based Layout**: Clean, organized interface with accent bars
- **Responsive Design**: Works seamlessly across all devices

### 🔧 Technical Features
- **WalletConnect v2**: Latest WalletConnect protocol support
- **RainbowKit Integration**: Seamless wallet connection experience
- **Real-time Balance Updates**: Live ETH and USDC balance tracking
- **Session Management**: Robust dApp connection handling
- **Error Handling**: Comprehensive error states and user feedback

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- WalletConnect Project ID

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd gasorin
   pnpm install
   ```

2. **Set environment variables**:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
   ```
   
   Get a Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/)

3. **Run the development server**:
   ```bash
   pnpm dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

## 🎯 Usage Guide

### 1. Connect Your Wallet
- Click "CONNECT WALLET" to connect your preferred wallet
- The app automatically switches to Base Sepolia for optimal Circle Paymaster experience
- Your wallet address and network status are displayed

### 2. Create Circle Smart Account
- Once connected, the app automatically creates a Circle Smart Account
- View your smart account address and balances
- USDC balance is used for gas payments via Circle Paymaster

### 3. Connect to dApps
- Paste a WalletConnect URI from any dApp (Uniswap, Aave, etc.)
- Click "LINK" to establish the connection
- The dApp connection status is displayed with the dApp's name and icon

### 4. Make Transactions
- Send transactions directly from the interface or via connected dApps
- All transactions use USDC for gas via Circle Paymaster
- Transaction success modal shows:
  - Transaction hash with copy and explorer links
  - User operation hash
  - Connected dApp information
  - USDC gas payment confirmation

## 🔗 Supported Networks

### Primary Network (Auto-Switch)
- **Base Sepolia** (Chain ID: 84532) - Recommended for Circle Paymaster

### Additional Supported Chains
- Ethereum Mainnet & Sepolia
- Polygon & Mumbai
- Optimism & Optimism Sepolia  
- Arbitrum & Arbitrum Sepolia
- Base & Base Sepolia
- Avalanche & Fuji
- Unichain


## 🔧 Technical Architecture

### Core Components
- **UnifiedCard**: Main UI component with state management
- **CircleStatus**: Smart account status and balance display
- **TransactionSuccessModal**: Transaction confirmation modal
- **CustomConnectButton**: Wallet connection interface

### State Management
- **Wallet Connection**: RainbowKit + Wagmi
- **Circle Integration**: Custom CircleAccountDeployment class
- **WalletConnect**: Custom CircleWalletConnect implementation
- **Network Switching**: useNetworkSwitch hook

### Key Features
```typescript
// Automatic Base Sepolia switching
useEffect(() => {
  if (isConnected && chainId !== 84532) {
    await checkAndSwitchNetwork(84532);
  }
}, [isConnected, chainId]);

// Transaction success modal
<TransactionSuccessModal
  isOpen={showTransactionModal}
  transactionHash={transactionResult?.transactionHash}
  userOperationHash={transactionResult?.userOperationHash}
  dappName={connectedDapp?.name}
/>
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Manual Deployment
```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## 🔍 Troubleshooting

### Common Issues

1. **"Failed to switch to Base Sepolia"**
   - Manually switch your wallet to Base Sepolia
   - Ensure your wallet supports Base Sepolia

2. **"Transaction failed" in dApp but succeeded in wallet**
   - This was fixed! dApps now receive correct transaction hash format
   - Refresh the dApp to see the successful transaction

3. **"Circle deployment not initialized"**
   - Ensure you're connected to Base Sepolia
   - Check that your wallet is properly connected

4. **Font not loading**
   - Ensure `DepartureMono-Regular.woff` is in `src/app/fonts/`
   - Check browser console for font loading errors

### Debug Mode
- Check browser console for detailed logs
- Use the status messages in the UI for real-time feedback
- Transaction modal shows detailed error information

## 📚 API Reference

### CircleWalletConnect Class
```typescript
const wallet = new CircleWalletConnect(projectId);

// Core methods
await wallet.init();
await wallet.connect(uri);
wallet.setCircleAccountAddress(address);
wallet.setChainId("84532"); // Base Sepolia

// Event handlers
wallet.onSessionProposal(callback);
wallet.onRequest(callback);
wallet.onSessionDelete(callback);
```

### CircleAccountDeployment Class
```typescript
const deployment = new CircleAccountDeployment(
  walletClient,
  address,
  "84532", // Base Sepolia
  true     // Testnet
);

await deployment.initialize();
const result = await deployment.sendTransaction(to, value, data);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Resources

- [Circle Paymaster Documentation](https://developers.circle.com/stablecoins/paymaster-overview)
- [WalletConnect Documentation](https://docs.walletconnect.com/)
- [ERC-4337 Specification](https://eips.ethereum.org/EIPS/eip-4337)
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
- [Departure Mono Font](https://github.com/google/fonts/tree/main/ofl/departuremono)

---

**Built with ❤️ for the Circle ecosystem**

---

**Gasorin** - Where gas meets elegance. ⚡
