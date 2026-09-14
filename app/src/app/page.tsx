"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "@/app/WalletButton";
import { truncateAddress } from "@/lib/format";

const STEPS = [
  {
    title: "Create a Bite",
    body: "Deposit some COOK and get back a link or QR code.",
  },
  {
    title: "Share it",
    body: "Send it to someone who's never touched Cookie Chain.",
  },
  {
    title: "They claim it",
    body: "They connect Nightly and sign — the network fee is on us.",
  },
];

export default function Home() {
  const { connected, publicKey } = useWallet();

  return (
    <main className="flex-1">
      <section className="bg-primary px-6 py-20 text-primary-ink sm:py-28">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Give someone their first 🍪
          </h1>
          <p className="max-w-lg text-lg text-balance text-primary-ink/90">
            FirstBite turns a zero-balance wallet into an active Cookie Chain
            wallet — one link, one signature, no bridge required first.
          </p>

          <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row">
            <div className="wallet-button-on-primary">
              <WalletButton />
            </div>
            {connected && (
              <Link
                href="/create"
                className="inline-flex h-11 items-center rounded-full border-2 border-primary-ink px-5 font-medium text-primary-ink transition hover:bg-bg hover:text-ink"
              >
                Create a Bite
              </Link>
            )}
          </div>

          {connected && publicKey && (
            <p className="text-sm text-primary-ink/75">
              Connected as{" "}
              <code className="rounded bg-black/15 px-1.5 py-0.5" title={publicKey.toBase58()}>
                {truncateAddress(publicKey.toBase58())}
              </code>
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <ol className="grid gap-10 sm:grid-cols-3 sm:gap-6">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-ink">
                {i + 1}
              </span>
              <h2 className="font-semibold text-ink">{step.title}</h2>
              <p className="text-sm text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
