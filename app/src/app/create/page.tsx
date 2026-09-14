"use client";

import { useMemo, useState } from "react";
import { SystemProgram } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { QRCodeSVG } from "qrcode.react";
import { useFirstBiteProgram } from "@/lib/program/useFirstBiteProgram";
import { bitePda, freshBiteId } from "@/lib/program/pda";
import { cookToLamports, LAMPORTS_PER_COOK } from "@/lib/program/units";
import { RENT_EXEMPT_MIN_0_BYTES, COOKIE_CHAIN_EXPLORER_TX } from "@/lib/program/constants";
import { friendlyError, type TxPhase } from "@/lib/tx-status";
import { TransactionStatus } from "../TransactionStatus";

const MIN_AMOUNT_PER_CLAIM_COOK = RENT_EXEMPT_MIN_0_BYTES / LAMPORTS_PER_COOK;

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
      return `Amount per claim must be at least ${MIN_AMOUNT_PER_CLAIM_COOK.toFixed(6)} COOK (the network's rent-exempt minimum for a new wallet — see poc/RESULTS.md).`;
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
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-3xl font-bold">Create a Bite 🍪</h1>
        <p className="max-w-sm text-neutral-600 dark:text-neutral-300">
          Connect your Nightly wallet to deposit COOK and generate a Bite.
        </p>
        <WalletMultiButton />
      </main>
    );
  }

  if (phase === "confirmed" && claimUrl) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-3xl font-bold">Your Bite is ready 🍪</h1>
        <p className="max-w-md text-neutral-600 dark:text-neutral-300">
          Share this link or QR code with someone who has never used Cookie
          Chain. They&apos;ll be able to claim {amountPerClaim} COOK each.
        </p>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <QRCodeSVG value={claimUrl} size={200} />
        </div>
        <code className="max-w-full break-all rounded bg-neutral-100 px-3 py-2 text-sm dark:bg-neutral-800">
          {claimUrl}
        </code>
        {signature && (
          <a
            className="text-sm text-purple-600 underline dark:text-purple-400"
            href={COOKIE_CHAIN_EXPLORER_TX(signature)}
            target="_blank"
            rel="noreferrer"
          >
            View deposit transaction on CookieScan
          </a>
        )}
        <button
          className="text-sm text-neutral-500 underline dark:text-neutral-400"
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
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Deposit COOK now, share a link later.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1 text-sm">
          Amount per claim (COOK)
          <input
            className="rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
            type="number"
            step="any"
            min={MIN_AMOUNT_PER_CLAIM_COOK}
            value={amountPerClaim}
            onChange={(e) => setAmountPerClaim(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Number of claims
          <input
            className="rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
            type="number"
            step="1"
            min={1}
            value={maxClaims}
            onChange={(e) => setMaxClaims(e.target.value)}
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={hasExpiration}
            onChange={(e) => setHasExpiration(e.target.checked)}
          />
          Set an expiration date
        </label>

        {hasExpiration && (
          <input
            className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            type="datetime-local"
            value={expirationLocal}
            onChange={(e) => setExpirationLocal(e.target.value)}
          />
        )}

        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Total to deposit: <strong>{totalDeposit.toFixed(6)} COOK</strong>
        </p>

        {validationError && <p className="text-sm text-red-600 dark:text-red-400">{validationError}</p>}
        <TransactionStatus phase={phase} error={errorMessage} />

        <button
          type="submit"
          disabled={!!validationError || (phase !== "idle" && phase !== "failed")}
          className="rounded-full bg-purple-700 px-4 py-2 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          Deposit & create Bite
        </button>
      </form>
    </main>
  );
}
