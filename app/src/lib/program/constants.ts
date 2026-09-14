import { PublicKey } from "@solana/web3.js";
import idl from "./idl.json";

// rpc.cookiescan.io confirmed reachable directly (getHealth: ok, getGenesisHash
// matches the expected value) as part of the Technical PoC — see poc/RESULTS.md.
export const COOKIE_CHAIN_RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_COOKIE_CHAIN_RPC ?? "https://rpc.cookiescan.io";

export const COOKIE_CHAIN_EXPLORER_TX = (signature: string) =>
  `https://cookiescan.io/tx/${signature}`;

export const FIRST_BITE_PROGRAM_ID = new PublicKey(idl.address);

// Confirmed by direct RPC call against both a local Agave validator and
// rpc.cookiescan.io on 2026-09-14 (see poc/RESULTS.md): a brand-new account
// cannot receive fewer lamports than this, or the transfer fails with
// "insufficient funds for rent". create_bite enforces this on-chain too —
// this copy exists purely so the form can validate before ever hitting the
// network.
export const RENT_EXEMPT_MIN_0_BYTES = 890_880;
