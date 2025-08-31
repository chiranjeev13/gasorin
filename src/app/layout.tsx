import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import localFont from "next/font/local";

const departureMono = localFont({
  src: "./fonts/DepartureMono-Regular.woff",
  variable: "--font-departure-mono",
  display: "swap",
});
const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: "Circle Paymaster Wallet - USDC Gas Payments",
  description: "Enterprise-grade smart account wallet with USDC gas payments powered by Circle Paymaster. Seamlessly send transactions without ETH for gas fees.",
  keywords: "Circle Paymaster, USDC, Gas Payments, Smart Account, Wallet, DeFi, Web3",
  authors: [{ name: "Circle Paymaster Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "Circle Paymaster Wallet - USDC Gas Payments",
    description: "Enterprise-grade smart account wallet with USDC gas payments powered by Circle Paymaster",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Circle Paymaster Wallet - USDC Gas Payments",
    description: "Enterprise-grade smart account wallet with USDC gas payments powered by Circle Paymaster",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${departureMono.variable} antialiased`}
      style={{ fontFamily: "var(--font-departure-mono)" }}>
        <Providers walletConnectProjectId={process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ""}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
