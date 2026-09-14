// FirstBite — Technical PoC (Fase 22 / Research Gate #1)
// Testa o mecanismo central: wallet B (0 COOK) assina uma instrucao,
// wallet A (financiada) paga a taxa da transacao (feePayer != signer principal do "claim").
//
// Instrucoes: [transfer(A -> B, amount), memo("FirstBite PoC claim", signers=[B])]
// feePayer = A. Signers = [A, B]. B nao precisa ter saldo para assinar seu proprio memo.
//
// IMPORTANTE: "amount" deve ser >= getMinimumBalanceForRentExemption(0) do cluster
// (890_880 native units, confirmado tanto localmente quanto na Cookie Chain em
// 2026-09-14), senao a transferencia falha com "insufficient funds for rent" —
// nao ha como criar uma conta nova abaixo do minimo de rent-exemption.
//
// Uso: node poc.mjs <sponsor-keypair.json> <receiver-keypair.json> [amountLamports]
// RPC default: Cookie Chain mainnet. Para testar localmente: POC_RPC_URL=http://127.0.0.1:8899

import fs from "node:fs";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

const RPC_URL = process.env.POC_RPC_URL || "https://rpc.cookiescan.io";
const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
const RENT_EXEMPT_MIN_0_BYTES = 890_880;

function loadKeypair(path) {
  const raw = JSON.parse(fs.readFileSync(path, "utf8"));
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}

async function main() {
  const [sponsorPath, receiverPath, amountArg] = process.argv.slice(2);
  if (!sponsorPath || !receiverPath) {
    console.error("Uso: node poc.mjs <sponsor-keypair.json> <receiver-keypair.json> [amountLamports]");
    process.exit(1);
  }
  const amount = amountArg ? Number(amountArg) : RENT_EXEMPT_MIN_0_BYTES;

  const sponsor = loadKeypair(sponsorPath);
  const receiver = loadKeypair(receiverPath);
  const connection = new Connection(RPC_URL, "confirmed");

  console.log("=== FirstBite Technical PoC ===");
  console.log("RPC:", RPC_URL);
  console.log("Sponsor (feePayer, financiado):", sponsor.publicKey.toBase58());
  console.log("Receiver (0 saldo, assina o claim):", receiver.publicKey.toBase58());
  console.log("Amount a transferir (native units):", amount);
  console.log("");

  const [sponsorBalBefore, receiverBalBefore] = await Promise.all([
    connection.getBalance(sponsor.publicKey),
    connection.getBalance(receiver.publicKey),
  ]);
  console.log("Saldo ANTES  — sponsor:", sponsorBalBefore, " | receiver:", receiverBalBefore);

  if (sponsorBalBefore === 0) {
    console.error("\nERRO: sponsor sem saldo. Financie o endereco acima com uma pequena quantia de COOK antes de rodar.");
    process.exit(1);
  }

  const transferIx = SystemProgram.transfer({
    fromPubkey: sponsor.publicKey,
    toPubkey: receiver.publicKey,
    lamports: amount,
  });

  const memoIx = new TransactionInstruction({
    programId: MEMO_PROGRAM_ID,
    keys: [{ pubkey: receiver.publicKey, isSigner: true, isWritable: false }],
    data: Buffer.from("FirstBite PoC: zero-balance claim, sponsored fee", "utf8"),
  });

  const tx = new Transaction();
  tx.add(transferIx, memoIx);
  tx.feePayer = sponsor.publicKey;

  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;

  console.log("\nAssinando: receiver assina seu proprio memo (autoriza o claim), sponsor assina e paga a taxa...");
  tx.sign(receiver, sponsor);

  console.log("Enviando transacao...");
  let signature;
  try {
    signature = await sendAndConfirmTransaction(connection, tx, [receiver, sponsor], {
      commitment: "confirmed",
    });
  } catch (err) {
    console.error("\nFALHOU ao enviar/confirmar a transacao:");
    console.error(err.message || err);
    if (err.logs) console.error("Logs:", err.logs);
    process.exit(1);
  }

  const [sponsorBalAfter, receiverBalAfter] = await Promise.all([
    connection.getBalance(sponsor.publicKey),
    connection.getBalance(receiver.publicKey),
  ]);

  console.log("\n=== RESULTADO ===");
  console.log("Signature:", signature);
  console.log("Explorer:", `https://cookiescan.io/tx/${signature}`);
  console.log("Saldo DEPOIS — sponsor:", sponsorBalAfter, " | receiver:", receiverBalAfter);
  console.log("Delta sponsor:", sponsorBalAfter - sponsorBalBefore, "(deve ser -amount - fee)");
  console.log("Delta receiver:", receiverBalAfter - receiverBalBefore, "(deve ser +amount, receiver NAO pagou fee)");

  const feePaidBySponsor = sponsorBalBefore - sponsorBalAfter - amount;
  console.log("\nFee efetivamente paga pelo sponsor (lamports):", feePaidBySponsor);
  console.log("Receiver comecou com 0 e nunca precisou de saldo proprio para assinar:", receiverBalBefore === 0);
}

main().catch((e) => {
  console.error("Erro fatal:", e);
  process.exit(1);
});
