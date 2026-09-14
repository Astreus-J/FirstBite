import { BN } from "@coral-xyz/anchor";

// INFERÊNCIA FORTE, não fato declarado literalmente pelo sponsor: 3 fontes
// independentes de terceiros (ver docs/research/ECOSYSTEM.md §2) calculam
// fees assumindo 9 decimais para COOK, consistente com a convenção padrão
// do token nativo em qualquer client Solana/Agave (LAMPORTS_PER_SOL = 1e9).
// Como a Cookie Chain é descrita como "solana-core"-compatível e COOK é o
// token nativo (não um SPL Mint com decimais próprios), é extremamente
// improvável que isso divirja — mas trate como inferência, não fato, até
// confirmado por uma leitura on-chain real.
export const COOK_DECIMALS = 9;
export const LAMPORTS_PER_COOK = 10 ** COOK_DECIMALS;

export function cookToLamports(cook: number): BN {
  return new BN(Math.round(cook * LAMPORTS_PER_COOK));
}

export function lamportsToCook(lamports: BN | number): number {
  const n = typeof lamports === "number" ? lamports : lamports.toNumber();
  return n / LAMPORTS_PER_COOK;
}
