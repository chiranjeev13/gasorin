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

## Technical Flow Summary

### 1. **Smart Account Initialization Phase**
- **EOA Connection**: User connects their Externally Owned Account (EOA) to the application
- **Address Computation**: Circle SDK computes the deterministic smart account address using the `CREATE2` opcode
- **Client Instantiation**: Smart account client is created, enabling interactions with the computed smart account address

### 2. **WalletConnect Session Establishment**
- **URI Generation**: WalletConnect SDK generates a connection URI for DeFi applications
- **dApp Connection**: User scans/copy-link the URI with a DeFi application to establish a secure session
- **Session Management**: Secure connection established between the smart account and DeFi platform

### 3. **Smart Account Deployment (First User Operation)**
- **UserOperation Preparation**: Circle SDK prepares a UserOperation object for the first transaction
- **Factory Data Inclusion**: UserOperation includes `initCode` containing factory deployment data
- **CREATE2 Opcode Execution**: Smart account address is deterministically computed and deployed on-chain
- **Account Abstraction**: ERC-4337 standard ensures the smart account is deployed during the first operation

### 4. **RPC Method Override & Smart Account Integration**
- **Method Interception**: WalletConnect intercepts RPC method calls sent by the connected DeFi application
- **Smart Account Method Replacement**: Standard RPC methods are overridden with smart account-compatible implementations
- **Seamless User Experience**: Users interact with DeFi apps normally while transactions are automatically routed through the smart account
- **Transparent Abstraction**: DeFi applications see standard Ethereum RPC responses while the underlying execution uses smart account infrastructure

### 5. **USDC Paymaster Authorization Flow**
- **Permit Signature Creation**: User signs an EIP-2612 permit message authorizing the paymaster to spend USDC
- **Authorization Scope**: Permit authorizes specific USDC amount for gas fee coverage
- **Smart Account Authorization**: Permit is signed by the smart account owner for USDC spending permissions.(Make sure you have USDC in your smart account)

### 6. **Transaction Execution & Gas Payment**
- **UserOperation Signing**: User signs the UserOperation hash confirming transaction details
- **Permit Integration**: Permit signature is included in the UserOperation for paymaster verification
- **Bundler Submission**: Signed UserOperation is sent to Pimlico bundler service
- **On-chain Execution**: Bundler submits UserOperation to the blockchain
- **USDC Deduction**: Paymaster verifies permit signature and deducts USDC from smart account for gas fees

### 7. **Key Technical Components**
- **CREATE2 Opcode**: Deterministic smart account address computation
- **ERC-4337 Standard**: Account abstraction for gasless transactions
- **EIP-2612 Permit**: Gasless USDC authorization mechanism
- **Circle Paymaster**: USDC-based gas fee coverage system
- **Pimlico Bundler**: UserOperation bundling and submission service
- **WalletConnect Protocol**: Secure dApp connection and session management
- **RPC Method Override**: Seamless integration layer between DeFi apps and smart account infrastructure

This architecture enables users to interact with DeFi applications seamlessly without holding native tokens for gas fees, while maintaining security through permit signatures and leveraging the ERC-4337 account abstraction standard. The RPC method override ensures a completely transparent user experience where DeFi applications function normally while leveraging smart account capabilities behind the scenes.

## 📄 License

This project is licensed under the MIT License.

## 🔗 Resources

- [Circle Paymaster Documentation](https://developers.circle.com/stablecoins/paymaster-overview)
- [WalletConnect Documentation](https://docs.walletconnect.com/)
- [ERC-4337 Specification](https://eips.ethereum.org/EIPS/eip-4337)
---

**Built with ❤️ for the Circle ecosystem**

---
