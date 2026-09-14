import { NextResponse } from "next/server";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { getSponsorProgram } from "@/lib/program/sponsor.server";
import { claimRecordPda } from "@/lib/program/pda";
import { biteRateLimiter, getClientIp, ipRateLimiter } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    return await handleClaim(request);
  } catch (err) {
    // Any unexpected failure (e.g. SPONSOR_SECRET_KEY missing, RPC down)
    // must still come back as JSON — otherwise the client's `res.json()`
    // throws its own confusing "Unexpected end of JSON input" instead of
    // the real error, and friendlyError() never gets a message to work
    // with (docs/PRODUCT.md: no raw crashes surfaced to the user).
    console.error("Unexpected /api/claim error:", err);
    return NextResponse.json({ error: "The sponsor service is temporarily unavailable." }, { status: 500 });
  }
}

async function handleClaim(request: Request): Promise<Response> {
  if (ipRateLimiter.check(getClientIp(request))) {
    return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
  }
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

  if (biteRateLimiter.check(bitePubkey.toBase58())) {
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
