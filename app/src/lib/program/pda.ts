import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { FIRST_BITE_PROGRAM_ID } from "./constants";

export function biteId(id: number | bigint): BN {
  return new BN(id.toString());
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
