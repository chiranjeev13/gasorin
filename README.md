# <img width="40" height="40" alt="gasorin" src="https://github.com/user-attachments/assets/bd4a1c42-52b4-41dc-b53d-ad013cfb0ca2" /> Gasorin 


A WalletConnect implementation for Circle Smart Accounts that supports USDC gas payments via Circle Paymaster. Designed with a sleek UI and intuitive interface for smooth interaction across any DeFi protocol.

## ✨ Features

### 🔗 Core Functionality
- **Circle Smart Account Integration**: Connect dapps to your Circle Smart Account
- **USDC Gas Payments**: Pay for gas fees using USDC instead of native tokens
- **Wallet Connect Implementation**: Connect to any Defi App with ready to use Circle Accounts and pay in USDC
- **ERC-4337 Support**: Compatible with ERC-4337 v0.7 and v0.8 standards
- **Transaction Success Modal**: Beautiful modal showing transaction details with explorer links


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
- Your wallet address and network status are displayed

### 2. Connect to dApps
- Paste a WalletConnect URI from any dApp (Uniswap, Aave, etc.)
- Click "LINK" to establish the connection
- The dApp connection status is displayed with the dApp's name and icon

### 3. Make Transactions
- Send transactions directly from the interface or via connected dApps
- All transactions use USDC for gas via Circle Paymaster

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

## 📄 License

This project is licensed under the MIT License.

## 🔗 Resources

- [Circle Paymaster Documentation](https://developers.circle.com/stablecoins/paymaster-overview)
- [WalletConnect Documentation](https://docs.walletconnect.com/)
- [ERC-4337 Specification](https://eips.ethereum.org/EIPS/eip-4337)
---

**Built with ❤️ for the Circle ecosystem**

---
