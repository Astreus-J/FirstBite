"use client";

import { useEffect } from "react";
import { useConnection } from "@solana/wallet-adapter-react";

declare global {
  interface Window {
    nightly?: {
      solana?: {
        changeNetwork?: (params: { genesisHash: string; url: string }) => Promise<void>;
      };
    };
  }
}

/**
 * Nightly doesn't publish Cookie Chain through the Wallet Standard, so it
 * has no built-in notion of this network and may otherwise warn that a
 * transaction "will fail" on what it thinks is the wrong network — even
 * though it won't (docs/research/ECOSYSTEM.md §4, and Arisan's README, a
 * fellow bounty submission that hit the same thing). Nightly's own fix for
 * custom SVM networks is `window.nightly.solana.changeNetwork({genesisHash,
 * url})`; this component calls it once the RPC's genesis hash is known, so
 * it's done proactively rather than leaving a possibly-scary warning for
 * the user to puzzle through mid-claim.
 */
export function NightlyNetworkSync() {
  const { connection } = useConnection();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!window.nightly?.solana?.changeNetwork) return;
      try {
        const genesisHash = await connection.getGenesisHash();
        if (!cancelled) {
          await window.nightly.solana.changeNetwork({ genesisHash, url: connection.rpcEndpoint });
        }
      } catch (err) {
        // Non-fatal — worst case Nightly shows its generic network warning.
        console.warn("Could not sync Nightly to this network:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [connection]);

  return null;
}
