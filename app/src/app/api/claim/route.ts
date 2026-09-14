import { NextResponse } from "next/server";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { getSponsorProgram } from "@/lib/program/sponsor.server";
import { claimRecordPda } from "@/lib/program/pda";

// Minimal, in-memory, best-effort rate limiting for the MVP (docs/SECURITY.md
// documents this as an accepted limitation, not a solved problem: it resets
// on redeploy and doesn't share state across serverless instances). Its job
// here is just to blunt naive repeated requests against the same Bite, not
// to be a real defense against a determined attacker.
const recentRequests = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (recentRequests.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  recentRequests.set(key, timestamps);
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { bite: biteStr, claimer: claimerStr } = (body ?? {}) as Record<string, unknown>;
  if (typeof biteStr !== "string" || typeof claimerStr !== "string") {
    return NextResponse.json({ error: "Expected { bite, claimer } as base58 pubkey strings." }, { status: 400 });
  }

  let bitePubkey: PublicKey;
  let claimerPubkey: PublicKey;
  try {
    bitePubkey = new PublicKey(biteStr);
    claimerPubkey = new PublicKey(claimerStr);
  } catch {
    return NextResponse.json({ error: "bite or claimer is not a valid public key." }, { status: 400 });
  }

  if (isRateLimited(bitePubkey.toBase58())) {
    return NextResponse.json({ error: "Too many requests for this Bite. Try again shortly." }, { status: 429 });
  }

  const { program, sponsor } = getSponsorProgram();

  // Everything below is derived from on-chain state or from the two
  // pubkeys above — nothing about the transaction's shape or accounts
  // comes from client-supplied data beyond "which bite" and "who is
  // claiming" (docs/SECURITY.md, T1/T2: the sponsor only ever signs an
  // intent it has independently constructed and validated).
  let bite;
  try {
    bite = await program.account.bite.fetch(bitePubkey);
  } catch {
    return NextResponse.json({ error: "Bite not found." }, { status: 404 });
  }

  if (!("active" in bite.status)) {
    return NextResponse.json({ error: "This Bite is not active." }, { status: 409 });
  }
  if (bite.expiration.toNumber() > 0 && Date.now() > bite.expiration.toNumber() * 1000) {
    return NextResponse.json({ error: "This Bite has expired." }, { status: 409 });
  }
  if (bite.claimedCount >= bite.maxClaims) {
    return NextResponse.json({ error: "This Bite has no claims remaining." }, { status: 409 });
  }

  const [claimRecord] = claimRecordPda(bitePubkey, claimerPubkey);
  const alreadyClaimed = (await program.provider.connection.getAccountInfo(claimRecord)) !== null;
  if (alreadyClaimed) {
    return NextResponse.json({ error: "This wallet has already claimed this Bite." }, { status: 409 });
  }

  const ix = await program.methods
    .claim()
    .accountsPartial({
      claimer: claimerPubkey,
      bite: bitePubkey,
      claimRecord,
      payer: sponsor.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .instruction();

  const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash("confirmed");

  const tx = new Transaction({
    feePayer: sponsor.publicKey,
    blockhash,
    lastValidBlockHeight,
  }).add(ix);

  // Sponsor signs its half now; the claimer signs the rest client-side and
  // submits. Serialized with requireAllSignatures: false since the
  // claimer's signature isn't present yet.
  tx.partialSign(sponsor);
  const serialized = tx.serialize({ requireAllSignatures: false });

  return NextResponse.json({
    transaction: serialized.toString("base64"),
  });
}
