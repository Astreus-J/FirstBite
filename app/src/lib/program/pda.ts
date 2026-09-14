import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { FIRST_BITE_PROGRAM_ID } from "./constants";

export function biteId(id: number | bigint): BN {
  return new BN(id.toString());
}

/**
 * A fresh id for a new Bite. Doesn't need to be unpredictable — just unique
 * per creator, since it's part of the PDA seed alongside the creator's
 * pubkey. Millisecond timestamp + a random suffix comfortably avoids
 * collisions from double-submits while staying well under u64/BN range.
 */
export function freshBiteId(): BN {
  const millis = BigInt(Date.now());
  const jitter = BigInt(Math.floor(Math.random() * 1000));
  return new BN((millis * BigInt(1000) + jitter).toString());
}

export function bitePda(creator: PublicKey, biteId: BN): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("bite"), creator.toBuffer(), biteId.toArrayLike(Buffer, "le", 8)],
    FIRST_BITE_PROGRAM_ID
  );
}

export function claimRecordPda(bite: PublicKey, claimer: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("claim"), bite.toBuffer(), claimer.toBuffer()],
    FIRST_BITE_PROGRAM_ID
  );
}
