"use client";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { NightlyWalletAdapter } from "@solana/wallet-adapter-nightly";
import { COOKIE_CHAIN_RPC_ENDPOINT } from "@/lib/program/constants";
import { NightlyNetworkSync } from "./nightly-network";

import "@solana/wallet-adapter-react-ui/styles.css";

export function Providers({ children }: { children: React.ReactNode }) {
  // MVP supports Nightly only (docs/PRODUCT.md) — the wallet list is
  // intentionally a single adapter, not a multi-wallet picker.
  const wallets = useMemo(() => [new NightlyWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={COOKIE_CHAIN_RPC_ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <NightlyNetworkSync />
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
