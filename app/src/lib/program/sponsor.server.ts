import "server-only";

import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, Keypair } from "@solana/web3.js";
import idl from "./idl.json";
import type { FirstBite } from "./first_bite";
import { COOKIE_CHAIN_RPC_ENDPOINT } from "./constants";

/**
 * Loads the sponsor's Keypair from SPONSOR_SECRET_KEY (a JSON array of
 * bytes, same format as a `solana-keygen`-produced file, set as a single
 * env var value). Never imported by client code — the `server-only`
 * import above makes any accidental client import a build-time error.
 */
function loadSponsorKeypair(): Keypair {
  const raw = process.env.SPONSOR_SECRET_KEY;
  if (!raw) {
    throw new Error("SPONSOR_SECRET_KEY is not set — the sponsor service cannot sign anything without it.");
  }
  const bytes = Uint8Array.from(JSON.parse(raw));
  return Keypair.fromSecretKey(bytes);
}

let cached: { program: Program<FirstBite>; sponsor: Keypair } | null = null;

export function getSponsorProgram() {
  if (cached) return cached;

  const sponsor = loadSponsorKeypair();
  const connection = new Connection(COOKIE_CHAIN_RPC_ENDPOINT, "confirmed");
  // A minimal Wallet whose signing methods are never actually called by
  // Anchor here — we only use this provider to build instructions and read
  // state; the sponsor's own signature is applied explicitly with
  // Keypair.sign in the route handler, not through this Wallet interface.
  const provider = new AnchorProvider(
    connection,
    {
      publicKey: sponsor.publicKey,
      signTransaction: async () => {
        throw new Error("Not used — sponsor signs explicitly in the route handler.");
      },
      signAllTransactions: async () => {
        throw new Error("Not used — sponsor signs explicitly in the route handler.");
      },
    },
    { commitment: "confirmed" }
  );

  cached = { program: new Program<FirstBite>(idl as FirstBite, provider), sponsor };
  return cached;
}
