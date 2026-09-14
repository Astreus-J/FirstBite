export type TxPhase =
  | "idle"
  | "preparing"
  | "awaiting-signature"
  | "submitted"
  | "confirming"
  | "confirmed"
  | "failed";

export const TX_PHASE_LABEL: Record<TxPhase, string | null> = {
  idle: null,
  preparing: "Preparing transaction…",
  "awaiting-signature": "Waiting for your signature…",
  submitted: "Submitted — waiting for the network…",
  confirming: "Confirming on Cookie Chain…",
  confirmed: "Confirmed ✓",
  failed: null,
};

/**
 * Maps wallet/RPC/program errors to something a non-technical user can act
 * on, per docs/PRODUCT.md's rule against showing raw stack traces or RPC
 * internals. Always console.error the original alongside this at the call
 * site — this is for the UI only, not for debugging.
 */
export function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);

  if (/user rejected|rejected the request|denied|cancelled/i.test(msg)) {
    return "You declined the request in your wallet.";
  }
  if (/insufficient (lamports|funds)/i.test(msg)) {
    return "Not enough balance to complete this transaction.";
  }
  if (/blockhash not found|block height exceeded|expired/i.test(msg)) {
    return "This took too long and the transaction expired. Please try again.";
  }
  if (/already in use/i.test(msg)) {
    return "This wallet has already claimed this Bite.";
  }
  if (/BiteNotActive/i.test(msg)) {
    return "This Bite is no longer active.";
  }
  if (/BiteExpired/i.test(msg)) {
    return "This Bite has expired.";
  }
  if (/AmountPerClaimTooLow/i.test(msg)) {
    return "That amount is too small — see the minimum below.";
  }
  if (/InvalidMaxClaims/i.test(msg)) {
    return "Number of claims must be at least 1.";
  }
  if (/Unauthorized/i.test(msg)) {
    return "Only the creator of this Bite can do that.";
  }
  if (/doesn't support signing|wallet not connected/i.test(msg)) {
    return "Connect a wallet that supports signing transactions.";
  }
  if (/Too many requests/i.test(msg)) {
    return "Too many attempts — please wait a moment and try again.";
  }
  if (msg && msg.length < 120 && !/[{}[\]]/.test(msg)) {
    // Short, already-readable messages we deliberately wrote ourselves
    // (e.g. our own API route's error strings) pass through as-is.
    return msg;
  }
  return "Something went wrong. Please try again in a moment.";
}
