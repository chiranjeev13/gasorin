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
  title: "Gasorin - Where Gas Meets Elegance",
  description: "Modern, cyber-inspired Circle Smart Account wallet with USDC gas payments. Automatic Base Sepolia switching and sleek monospaced design.",
  keywords: "Gasorin, Circle Paymaster, USDC, Gas Payments, Smart Account, Wallet, DeFi, Web3, Base Sepolia",
  authors: [{ name: "Gasorin Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "Gasorin - Where Gas Meets Elegance",
    description: "Modern, cyber-inspired Circle Smart Account wallet with USDC gas payments",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gasorin - Where Gas Meets Elegance",
    description: "Modern, cyber-inspired Circle Smart Account wallet with USDC gas payments",
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
