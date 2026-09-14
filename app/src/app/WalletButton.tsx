"use client";

import dynamic from "next/dynamic";

// WalletMultiButton renders differently once mounted (it needs to know which
// wallets are actually installed, which is only knowable client-side), so
// server-rendering it and then hydrating causes a mismatch between the
// server HTML and the client's first render. `ssr: false` skips prerendering
// this component entirely — it only ever renders client-side. Every page
// that needs the wallet button should import it from here, not directly
// from @solana/wallet-adapter-react-ui.
export const WalletButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((mod) => mod.WalletMultiButton),
  { ssr: false }
);
