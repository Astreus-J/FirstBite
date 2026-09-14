"use client";

import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
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
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-3xl font-bold">Your Bites</h1>
        <p className="max-w-sm text-neutral-600 dark:text-neutral-300">
          Connect your wallet to see the Bites you&apos;ve created.
        </p>
        <WalletMultiButton />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-center text-3xl font-bold">Your Bites</h1>

      {error && <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>}

      {bites === null ? (
        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">Loading…</p>
      ) : bites.length === 0 ? (
        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
          You haven&apos;t created any Bites yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {bites.map((bite) => {
            const remaining = bite.maxClaims - bite.claimedCount;
            return (
              <li
                key={bite.publicKey.toBase58()}
                className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3 dark:border-neutral-800"
              >
                <div>
                  <p className="font-medium">{lamportsToCook(bite.amountPerClaim)} COOK per claim</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {bite.claimedCount} of {bite.maxClaims} claimed
                    {bite.status === "depleted" ? " — depleted" : ""}
                  </p>
                </div>
                {remaining > 0 || bite.status === "depleted" ? (
                  <button
                    onClick={() => handleCancel(bite.publicKey)}
                    disabled={cancellingId === bite.publicKey.toBase58()}
                    className="text-sm text-red-600 underline disabled:opacity-50 dark:text-red-400"
                  >
                    {cancellingId === bite.publicKey.toBase58() ? "Cancelling…" : "Cancel & reclaim"}
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
