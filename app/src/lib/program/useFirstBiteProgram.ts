"use client";

import { useMemo } from "react";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import idl from "./idl.json";
import type { FirstBite } from "./first_bite";

/**
 * Returns a connected Program instance, or null while no wallet is
 * connected. Anchor requires a signer-capable wallet to build an
 * AnchorProvider, so this is intentionally unavailable pre-connect rather
 * than falling back to a read-only stub.
 */
export function useFirstBiteProgram(): Program<FirstBite> | null {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  return useMemo(() => {
    if (!wallet) return null;
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    return new Program<FirstBite>(idl as FirstBite, provider);
  }, [connection, wallet]);
}
