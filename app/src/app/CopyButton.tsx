"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can be unavailable (permissions, insecure context) —
      // the link is still visible and selectable, so this fails silently.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-ink transition hover:opacity-90"
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}
