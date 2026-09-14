"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "@/app/WalletButton";
import { useFirstBiteProgram } from "@/lib/program/useFirstBiteProgram";
import { claimRecordPda } from "@/lib/program/pda";
import { lamportsToCook } from "@/lib/program/units";
import { COOKIE_CHAIN_EXPLORER_TX } from "@/lib/program/constants";
import { friendlyError, type TxPhase } from "@/lib/tx-status";
import { truncateAddress } from "@/lib/format";
import { TransactionStatus } from "../../TransactionStatus";

type BiteAccount = {
  creator: PublicKey;
  amountPerClaim: { toNumber(): number };
  maxClaims: number;
  claimedCount: number;
  expiration: { toNumber(): number };
  status: { active?: object; depleted?: object };
};

type LoadState =
  | { kind: "loading" }
  | { kind: "not-found" }
  | { kind: "ready"; bite: BiteAccount; alreadyClaimed: boolean; isExpired: boolean };

export default function ClaimPage() {
  const params = useParams<{ biteAddress: string }>();
  const { publicKey, connected, signTransaction } = useWallet();
  const { connection } = useConnection();
  const program = useFirstBiteProgram();

  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [phase, setPhase] = useState<TxPhase>("idle");
  const [claimError, setClaimError] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  // Pure derivation from the URL param — no effect needed for this part.
  const bitePubkey = useMemo(() => {
    try {
      return new PublicKey(params.biteAddress);
    } catch {
      return null;
    }
  }, [params.biteAddress]);

  useEffect(() => {
    if (!bitePubkey) return;

    let cancelled = false;

    (async () => {
      try {
        const bite = (await program.account.bite.fetch(bitePubkey)) as unknown as BiteAccount;
        let alreadyClaimed = false;
        if (publicKey) {
          const [record] = claimRecordPda(bitePubkey, publicKey);
          alreadyClaimed = (await program.provider.connection.getAccountInfo(record)) !== null;
        }
        const isExpired = bite.expiration.toNumber() > 0 && Date.now() > bite.expiration.toNumber() * 1000;
        if (!cancelled) setState({ kind: "ready", bite, alreadyClaimed, isExpired });
      } catch {
        if (!cancelled) setState({ kind: "not-found" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bitePubkey, program, publicKey, reloadCount]);

  async function handleClaim() {
    if (!bitePubkey || !publicKey || state.kind !== "ready") return;
    setClaimError(null);
    try {
      if (!signTransaction) {
        throw new Error("doesn't support signing");
      }

      // The Sponsor Service (see app/src/app/api/claim/route.ts) builds the
      // claim instruction itself from validated on-chain state, sets itself
      // as feePayer, and partially signs — the client never constructs the
      // transaction or tells the server what to sign (docs/SECURITY.md).
      setPhase("preparing");
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bite: bitePubkey.toBase58(), claimer: publicKey.toBase58() }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error ?? "The sponsor service rejected this claim.");
      }

      const tx = Transaction.from(Buffer.from(body.transaction, "base64"));

      setPhase("awaiting-signature");
      const signed = await signTransaction(tx);

      setPhase("submitted");
      const sig = await connection.sendRawTransaction(signed.serialize());

      setPhase("confirming");
      await connection.confirmTransaction(
        { signature: sig, ...(await connection.getLatestBlockhash("confirmed")) },
        "confirmed"
      );

      setSignature(sig);
      setPhase("confirmed");
      setReloadCount((c) => c + 1);
    } catch (err) {
      console.error(err);
      setClaimError(friendlyError(err));
      setPhase("failed");
    }
  }

  if (!bitePubkey) {
    return <CenteredMessage title="Invalid link" body="This doesn't look like a valid Bite address." />;
  }

  if (state.kind === "loading") {
    return <CenteredMessage title="Loading Bite…" body="" />;
  }

  if (state.kind === "not-found") {
    return (
      <CenteredMessage
        title="Bite not found"
        body="This Bite may have already been fully claimed and closed by its creator, or the link is wrong."
      />
    );
  }

  const { bite, alreadyClaimed, isExpired } = state;
  const isActive = "active" in bite.status;
  const remaining = bite.maxClaims - bite.claimedCount;
  const amountCook = lamportsToCook(bite.amountPerClaim.toNumber());
  const isConfirmed = phase === "confirmed" && signature;

  const canClaim = isActive && !isExpired && remaining > 0 && !alreadyClaimed;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <h1 className="text-3xl font-bold">You&apos;ve got a Bite 🍪</h1>

      <div
        className={`w-full rounded-2xl px-6 py-8 transition-colors ${
          isConfirmed ? "bg-success text-success-ink" : "bg-primary text-primary-ink"
        }`}
      >
        <p className="text-5xl font-bold tabular-nums">{amountCook}</p>
        <p className="mt-1 text-sm font-medium opacity-90">COOK</p>
        <p className="mt-4 text-sm opacity-80">
          {remaining} of {bite.maxClaims} claim{bite.maxClaims === 1 ? "" : "s"} remaining
        </p>
      </div>

      {isConfirmed ? (
        <div className="flex flex-col items-center gap-2">
          <p className="font-medium text-success">Welcome to Cookie Chain! 🎉</p>
          <a
            className="text-sm font-medium text-accent underline underline-offset-2 transition hover:opacity-80"
            href={COOKIE_CHAIN_EXPLORER_TX(signature)}
            target="_blank"
            rel="noreferrer"
          >
            View transaction on CookieScan ↗
          </a>
        </div>
      ) : alreadyClaimed ? (
        <p className="text-muted">You&apos;ve already claimed this Bite.</p>
      ) : isExpired ? (
        <p className="text-muted">This Bite has expired.</p>
      ) : !isActive || remaining <= 0 ? (
        <p className="text-muted">This Bite has no claims left.</p>
      ) : !connected ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-muted">Connect your Nightly wallet to claim.</p>
          <WalletButton />
        </div>
      ) : (
        <div className="flex w-full flex-col items-center gap-3">
          {publicKey && (
            <p className="text-sm text-muted">
              Connected as{" "}
              <code className="rounded bg-surface px-1.5 py-0.5" title={publicKey.toBase58()}>
                {truncateAddress(publicKey.toBase58())}
              </code>
            </p>
          )}
          <button
            onClick={handleClaim}
            disabled={!canClaim || (phase !== "idle" && phase !== "failed")}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-6 font-medium text-primary-ink transition hover:opacity-90 disabled:opacity-50"
          >
            Claim
          </button>
          <TransactionStatus phase={phase} error={claimError} />
        </div>
      )}
    </main>
  );
}

function CenteredMessage({ title, body }: { title: string; body: string }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      {body && <p className="max-w-sm text-muted">{body}</p>}
    </main>
  );
}
