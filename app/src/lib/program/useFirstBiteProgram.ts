"use client";

import { useMemo } from "react";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import idl from "./idl.json";
import type { FirstBite } from "./first_bite";

// @coral-xyz/anchor's own top-level `Wallet` export is a Node-only *class*
// (extends NodeWallet, requires a real Keypair `payer`) — not the general
// signer interface AnchorProvider's constructor actually accepts. Typing
// against that class would force a fake `payer` here, so this is typed
// structurally instead against what AnchorProvider really expects.
type ProviderWallet = ConstructorParameters<typeof AnchorProvider>[1];

const READ_ONLY_WALLET: ProviderWallet = {
  publicKey: PublicKey.default,
  signTransaction: async () => {
    throw new Error("Read-only provider — connect a wallet to sign transactions.");
  },
  signAllTransactions: async () => {
    throw new Error("Read-only provider — connect a wallet to sign transactions.");
  },
};

/**
 * Returns a Program instance usable for reads (e.g. fetching a Bite's
 * public state) even before any wallet is connected — the Claim page needs
 * to show what's on offer before asking someone to connect. Any write call
 * made through the read-only fallback fails loudly via READ_ONLY_WALLET
 * rather than silently, so callers must still gate signing UI on the real
 * connected wallet (see `useWallet().publicKey`).
 */
export function useFirstBiteProgram(): Program<FirstBite> {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  return useMemo(() => {
    const provider = new AnchorProvider(connection, anchorWallet ?? READ_ONLY_WALLET, {
      commitment: "confirmed",
    });
    return new Program<FirstBite>(idl as FirstBite, provider);
  }, [connection, anchorWallet]);
}
