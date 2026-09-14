"use client";

import { useMemo, useState } from "react";
import { SystemProgram } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "@/app/WalletButton";
import { QRCodeSVG } from "qrcode.react";
import { useFirstBiteProgram } from "@/lib/program/useFirstBiteProgram";
import { bitePda, freshBiteId } from "@/lib/program/pda";
import { cookToLamports, LAMPORTS_PER_COOK } from "@/lib/program/units";
import { RENT_EXEMPT_MIN_0_BYTES, COOKIE_CHAIN_EXPLORER_TX } from "@/lib/program/constants";
import { friendlyError, type TxPhase } from "@/lib/tx-status";
import { TransactionStatus } from "../TransactionStatus";
import { CopyButton } from "../CopyButton";

const MIN_AMOUNT_PER_CLAIM_COOK = RENT_EXEMPT_MIN_0_BYTES / LAMPORTS_PER_COOK;

const inputClass =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

export default function CreateBitePage() {
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const program = useFirstBiteProgram();

  const [amountPerClaim, setAmountPerClaim] = useState(String(MIN_AMOUNT_PER_CLAIM_COOK.toFixed(6)));
  const [maxClaims, setMaxClaims] = useState("1");
  const [hasExpiration, setHasExpiration] = useState(false);
  const [expirationLocal, setExpirationLocal] = useState("");

  const [phase, setPhase] = useState<TxPhase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [claimUrl, setClaimUrl] = useState<string | null>(null);

  const amountPerClaimNumber = Number(amountPerClaim);
  const maxClaimsNumber = Number(maxClaims);

  const validationError = useMemo(() => {
    if (!Number.isFinite(amountPerClaimNumber) || amountPerClaimNumber < MIN_AMOUNT_PER_CLAIM_COOK) {
      return `Amount per claim must be at least ${MIN_AMOUNT_PER_CLAIM_COOK.toFixed(6)} COOK (the network's rent-exempt minimum for a new wallet).`;
    }
    if (!Number.isInteger(maxClaimsNumber) || maxClaimsNumber < 1) {
      return "Number of claims must be a whole number of at least 1.";
    }
    if (hasExpiration && !expirationLocal) {
      return "Pick an expiration date, or turn expiration off.";
    }
    return null;
  }, [amountPerClaimNumber, maxClaimsNumber, hasExpiration, expirationLocal]);

  const totalDeposit = Number.isFinite(amountPerClaimNumber) && Number.isFinite(maxClaimsNumber)
    ? amountPerClaimNumber * maxClaimsNumber
    : 0;

  const isSubmitting = phase !== "idle" && phase !== "failed";

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!publicKey || validationError) return;
    if (!signTransaction) {
      setErrorMessage(friendlyError(new Error("doesn't support signing")));
      setPhase("failed");
      return;
    }

    setErrorMessage(null);

    try {
      setPhase("preparing");
      const id = freshBiteId();
      const [bite] = bitePda(publicKey, id);
      const expiration = hasExpiration ? Math.floor(new Date(expirationLocal).getTime() / 1000) : 0;

      const tx = await program.methods
        .createBite(id, cookToLamports(amountPerClaimNumber), maxClaimsNumber, new BN(expiration))
        .accountsPartial({
          creator: publicKey,
          bite,
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
      tx.feePayer = publicKey;
      tx.recentBlockhash = blockhash;

      setPhase("awaiting-signature");
      const signed = await signTransaction(tx);

      setPhase("submitted");
      const sig = await connection.sendRawTransaction(signed.serialize());

      setPhase("confirming");
      await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");

      setSignature(sig);
      setClaimUrl(`${window.location.origin}/claim/${bite.toBase58()}`);
      setPhase("confirmed");
    } catch (err) {
      console.error(err);
      setErrorMessage(friendlyError(err));
      setPhase("failed");
    }
  }

  if (!connected) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        <h1 className="text-3xl font-bold">Create a Bite 🍪</h1>
        <p className="max-w-sm text-muted">
          Connect your Nightly wallet to deposit COOK and generate a Bite.
        </p>
        <WalletButton />
      </main>
    );
  }

  if (phase === "confirmed" && claimUrl) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        <h1 className="text-3xl font-bold">Your Bite is ready 🍪</h1>
        <p className="max-w-md text-muted">
          Share this link or QR code with someone who has never used Cookie
          Chain. They&apos;ll be able to claim {amountPerClaim} COOK.
        </p>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="rounded-xl bg-bg p-3">
            <QRCodeSVG value={claimUrl} size={192} />
          </div>
        </div>

        <div className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
          <code className="flex-1 truncate text-left text-sm text-muted">{claimUrl}</code>
          <CopyButton text={claimUrl} />
        </div>

        {signature && (
          <a
            className="text-sm font-medium text-accent underline underline-offset-2 transition hover:opacity-80"
            href={COOKIE_CHAIN_EXPLORER_TX(signature)}
            target="_blank"
            rel="noreferrer"
          >
            View deposit transaction on CookieScan ↗
          </a>
        )}

        <button
          className="text-sm text-muted underline underline-offset-2 transition hover:text-ink"
          onClick={() => {
            setPhase("idle");
            setSignature(null);
            setClaimUrl(null);
          }}
        >
          Create another Bite
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Create a Bite 🍪</h1>
        <p className="mt-2 text-sm text-muted">Deposit COOK now, share a link later.</p>
      </div>

      <form
        className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6"
        onSubmit={handleSubmit}
      >
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Amount per claim (COOK)
          <input
            className={inputClass}
            type="number"
            step="any"
            min={MIN_AMOUNT_PER_CLAIM_COOK}
            value={amountPerClaim}
            onChange={(e) => setAmountPerClaim(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Number of claims
          <input
            className={inputClass}
            type="number"
            step="1"
            min={1}
            value={maxClaims}
            onChange={(e) => setMaxClaims(e.target.value)}
          />
        </label>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            className="h-4 w-4 accent-primary"
            checked={hasExpiration}
            onChange={(e) => setHasExpiration(e.target.checked)}
          />
          Set an expiration date
        </label>

        {hasExpiration && (
          <input
            className={inputClass}
            type="datetime-local"
            value={expirationLocal}
            onChange={(e) => setExpirationLocal(e.target.value)}
          />
        )}

        <div className="flex items-baseline justify-between border-t border-border pt-4 text-sm">
          <span className="text-muted">Total to deposit</span>
          <span className="font-semibold text-ink">{totalDeposit.toFixed(6)} COOK</span>
        </div>

        {validationError && <p className="text-sm text-error">{validationError}</p>}
        <TransactionStatus phase={phase} error={errorMessage} />

        <button
          type="submit"
          disabled={!!validationError || isSubmitting}
          className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-4 font-medium text-primary-ink transition hover:opacity-90 disabled:opacity-50"
        >
          Deposit & create Bite
        </button>
      </form>
    </main>
  );
}
