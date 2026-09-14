import { TX_PHASE_LABEL, type TxPhase } from "@/lib/tx-status";

export function TransactionStatus({ phase, error }: { phase: TxPhase; error?: string | null }) {
  const label = TX_PHASE_LABEL[phase];

  if (phase === "failed" && error) {
    return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  }
  if (!label) return null;

  return (
    <p className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
      {phase !== "confirmed" && (
        <span
          className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600 dark:border-neutral-700 dark:border-t-neutral-300"
          aria-hidden
        />
      )}
      {label}
    </p>
  );
}
