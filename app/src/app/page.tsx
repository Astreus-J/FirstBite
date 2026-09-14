"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Home() {
  const { connected, publicKey } = useWallet();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="space-y-3">
        <h1 className="text-5xl font-bold tracking-tight">FirstBite 🍪</h1>
        <p className="text-lg text-neutral-500 dark:text-neutral-400">
          Your first bite of Cookie Chain.
        </p>
      </div>

      <p className="max-w-md text-balance text-neutral-600 dark:text-neutral-300">
        Give someone their first 🍪 — a link or QR code that turns a
        zero-balance wallet into an active Cookie Chain wallet, no bridge
        required.
      </p>

      <WalletMultiButton />

      {connected && publicKey && (
        <>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Connected as{" "}
            <code className="rounded bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-800">
              {publicKey.toBase58()}
            </code>
          </p>
          <Link
            href="/create"
            className="rounded-full bg-purple-700 px-5 py-2.5 font-medium text-white transition hover:opacity-90"
          >
            Create a Bite
          </Link>
        </>
      )}
    </main>
  );
}
