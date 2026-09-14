"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "@/app/WalletButton";
import { useFirstBiteProgram } from "@/lib/program/useFirstBiteProgram";
import { lamportsToCook } from "@/lib/program/units";
import { friendlyError } from "@/lib/tx-status";

type BiteRow = {
  publicKey: PublicKey;
  amountPerClaim: number;
  maxClaims: number;
  claimedCount: number;
  status: "active" | "depleted";
};

export default function HistoryPage() {
  const { connected, publicKey } = useWallet();
  const program = useFirstBiteProgram();

  const [bites, setBites] = useState<BiteRow[] | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (!publicKey) return;
    let cancelled = false;

    (async () => {
      const accounts = await program.account.bite.all([
        { memcmp: { offset: 8, bytes: publicKey.toBase58() } },
      ]);
      if (cancelled) return;
      setBites(
        accounts.map(({ publicKey: pk, account }) => ({
          publicKey: pk,
          amountPerClaim: account.amountPerClaim.toNumber(),
          maxClaims: account.maxClaims,
          claimedCount: account.claimedCount,
          status: "active" in account.status ? "active" : "depleted",
        }))
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [program, publicKey, reloadCount]);

  async function handleCancel(bite: PublicKey) {
    if (!publicKey) return;
    setCancellingId(bite.toBase58());
    setError(null);
    try {
      await program.methods
        .cancelBite()
        .accountsPartial({ creator: publicKey, bite })
        .rpc();
      setReloadCount((c) => c + 1);
    } catch (err) {
      console.error(err);
      setError(friendlyError(err));
    } finally {
      setCancellingId(null);
    }
  }

  if (!connected) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        <h1 className="text-3xl font-bold">Your Bites</h1>
        <p className="max-w-sm text-muted">Connect your wallet to see the Bites you&apos;ve created.</p>
        <WalletButton />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-center text-3xl font-bold">Your Bites</h1>

      {error && <p className="text-center text-sm text-error">{error}</p>}

      {bites === null ? (
        <div className="flex flex-col gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
      ) : bites.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-12 text-center">
          <p className="text-muted">You haven&apos;t created any Bites yet.</p>
          <Link
            href="/create"
            className="text-sm font-medium text-accent underline underline-offset-2 transition hover:opacity-80"
          >
            Create your first Bite →
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {bites.map((bite) => {
            const remaining = bite.maxClaims - bite.claimedCount;
            const isCancelling = cancellingId === bite.publicKey.toBase58();
            return (
              <li
                key={bite.publicKey.toBase58()}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ink">{lamportsToCook(bite.amountPerClaim)} COOK per claim</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        bite.status === "active" ? "bg-accent text-accent-ink" : "bg-border text-muted"
                      }`}
                    >
                      {bite.status === "active" ? "Active" : "Depleted"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted">
                    {bite.claimedCount} of {bite.maxClaims} claimed
                  </p>
                </div>
                {(remaining > 0 || bite.status === "depleted") && (
                  <button
                    onClick={() => handleCancel(bite.publicKey)}
                    disabled={isCancelling}
                    className="rounded-full border border-error px-3 py-1.5 text-sm font-medium text-error transition hover:bg-error hover:text-error-ink disabled:opacity-50"
                  >
                    {isCancelling ? "Cancelling…" : "Cancel & reclaim"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
