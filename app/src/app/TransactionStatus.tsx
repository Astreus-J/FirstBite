import { TX_PHASE_LABEL, type TxPhase } from "@/lib/tx-status";

export function TransactionStatus({ phase, error }: { phase: TxPhase; error?: string | null }) {
  const label = TX_PHASE_LABEL[phase];

  if (phase === "failed" && error) {
    return <p className="text-sm text-error">{error}</p>;
  }
  if (phase === "confirmed") {
    return <p className="text-sm font-medium text-success">{label}</p>;
  }
  if (!label) return null;

  return (
    <p className="flex items-center gap-2 text-sm text-muted">
      <span
        className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-border border-t-primary"
        aria-hidden
      />
      {label}
    </p>
  );
}
