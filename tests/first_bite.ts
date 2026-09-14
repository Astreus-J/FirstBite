import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";
import { FirstBite } from "../target/types/first_bite";

const RENT_EXEMPT_MIN_0_BYTES = 890_880; // confirmed via poc/RESULTS.md, both locally and on Cookie Chain

describe("first_bite", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.firstBite as Program<FirstBite>;
  const connection = provider.connection;

  function bitePda(creator: PublicKey, biteId: BN): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("bite"), creator.toBuffer(), biteId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );
  }

  function claimRecordPda(bite: PublicKey, claimer: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("claim"), bite.toBuffer(), claimer.toBuffer()],
      program.programId
    );
  }

  let nextBiteId = 1;
  function freshBiteId(): BN {
    return new BN(nextBiteId++);
  }

  async function airdrop(pubkey: PublicKey, lamports: number) {
    const signature = await connection.requestAirdrop(pubkey, lamports);
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({ signature, ...latestBlockhash });
  }

  async function createBite(
    creator: Keypair,
    biteId: BN,
    amountPerClaim: number | BN,
    maxClaims: number,
    expiration: number
  ) {
    const [bite] = bitePda(creator.publicKey, biteId);
    await program.methods
      .createBite(biteId, new BN(amountPerClaim), maxClaims, new BN(expiration))
      .accountsPartial({
        creator: creator.publicKey,
        bite,
        systemProgram: SystemProgram.programId,
      })
      .signers([creator])
      .rpc();
    return bite;
  }

  async function claim(bite: PublicKey, claimer: Keypair, payer: Keypair) {
    const [claimRecord] = claimRecordPda(bite, claimer.publicKey);
    return program.methods
      .claim()
      .accountsPartial({
        claimer: claimer.publicKey,
        bite,
        claimRecord,
        payer: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers(claimer.publicKey.equals(payer.publicKey) ? [claimer] : [claimer, payer])
      .rpc();
  }

  it("creates a Bite and deposits the full amount into the PDA", async () => {
    const biteId = freshBiteId();
    const amountPerClaim = RENT_EXEMPT_MIN_0_BYTES;
    const maxClaims = 3;
    const bite = await createBite(provider.wallet.payer as Keypair, biteId, amountPerClaim, maxClaims, 0);

    const account = await program.account.bite.fetch(bite);
    assert.equal(account.amountPerClaim.toNumber(), amountPerClaim);
    assert.equal(account.maxClaims, maxClaims);
    assert.equal(account.claimedCount, 0);
    assert.deepEqual(account.status, { active: {} });

    const balance = await connection.getBalance(bite);
    assert.isAtLeast(balance, amountPerClaim * maxClaims, "PDA must hold at least the full deposit");
  });

  it("rejects amount_per_claim below the rent-exempt minimum", async () => {
    const biteId = freshBiteId();
    try {
      await createBite(provider.wallet.payer as Keypair, biteId, 1_000, 1, 0);
      assert.fail("expected create_bite to reject amount_per_claim below rent-exempt minimum");
    } catch (err) {
      assert.include(JSON.stringify(err), "AmountPerClaimTooLow");
    }
  });

  it("rejects max_claims = 0", async () => {
    const biteId = freshBiteId();
    try {
      await createBite(provider.wallet.payer as Keypair, biteId, RENT_EXEMPT_MIN_0_BYTES, 0, 0);
      assert.fail("expected create_bite to reject max_claims = 0");
    } catch (err) {
      assert.include(JSON.stringify(err), "InvalidMaxClaims");
    }
  });

  it("lets a genuinely zero-balance claimer claim, with a separate sponsor paying the fee/rent", async () => {
    const creator = provider.wallet.payer as Keypair;
    const sponsor = Keypair.generate();
    await airdrop(sponsor.publicKey, 1_000_000_000);

    const claimer = Keypair.generate(); // never funded — this is the whole point
    const biteId = freshBiteId();
    const bite = await createBite(creator, biteId, RENT_EXEMPT_MIN_0_BYTES, 2, 0);

    const balanceBefore = await connection.getBalance(claimer.publicKey);
    assert.equal(balanceBefore, 0, "claimer must start genuinely at zero");

    // sponsor is both the fee payer for the transaction and the `payer` account.
    const [claimRecord] = claimRecordPda(bite, claimer.publicKey);
    await program.methods
      .claim()
      .accountsPartial({
        claimer: claimer.publicKey,
        bite,
        claimRecord,
        payer: sponsor.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([claimer, sponsor])
      .rpc();

    const balanceAfter = await connection.getBalance(claimer.publicKey);
    assert.equal(balanceAfter, RENT_EXEMPT_MIN_0_BYTES, "claimer receives exactly amount_per_claim");

    const account = await program.account.bite.fetch(bite);
    assert.equal(account.claimedCount, 1);
  });

  it("rejects a second claim from the same claimer on the same Bite", async () => {
    const creator = provider.wallet.payer as Keypair;
    const claimer = Keypair.generate();
    const biteId = freshBiteId();
    const bite = await createBite(creator, biteId, RENT_EXEMPT_MIN_0_BYTES, 5, 0);

    await claim(bite, claimer, creator);

    try {
      await claim(bite, claimer, creator);
      assert.fail("expected the second claim by the same claimer to be rejected");
    } catch (err) {
      // ClaimRecord PDA already exists — Anchor's generic account-in-use error.
      assert.include(JSON.stringify(err), "already in use");
    }
  });

  it("rejects a claim once the Bite is depleted", async () => {
    const creator = provider.wallet.payer as Keypair;
    const claimerA = Keypair.generate();
    const claimerB = Keypair.generate();
    const biteId = freshBiteId();
    const bite = await createBite(creator, biteId, RENT_EXEMPT_MIN_0_BYTES, 1, 0);

    await claim(bite, claimerA, creator);
    const account = await program.account.bite.fetch(bite);
    assert.deepEqual(account.status, { depleted: {} });

    try {
      await claim(bite, claimerB, creator);
      assert.fail("expected claim on a depleted Bite to be rejected");
    } catch (err) {
      // status flips to Depleted the moment claimed_count reaches max_claims,
      // so the depleted case is caught by the same "must be Active" check
      // used for cancelled/inactive Bites — see claim.rs.
      assert.include(JSON.stringify(err), "BiteNotActive");
    }
  });

  it("rejects a claim on an expired Bite", async () => {
    const creator = provider.wallet.payer as Keypair;
    const claimer = Keypair.generate();
    const biteId = freshBiteId();
    const alreadyPast = Math.floor(Date.now() / 1000) - 100;
    const bite = await createBite(creator, biteId, RENT_EXEMPT_MIN_0_BYTES, 1, alreadyPast);

    try {
      await claim(bite, claimer, creator);
      assert.fail("expected claim on an expired Bite to be rejected");
    } catch (err) {
      assert.include(JSON.stringify(err), "BiteExpired");
    }
  });

  it("lets the creator cancel a Bite and reclaims remaining deposit + rent", async () => {
    const creator = Keypair.generate();
    await airdrop(creator.publicKey, 1_000_000_000);

    const biteId = freshBiteId();
    const amountPerClaim = RENT_EXEMPT_MIN_0_BYTES;
    const maxClaims = 4;
    const bite = await createBite(creator, biteId, amountPerClaim, maxClaims, 0);

    const creatorBalanceBefore = await connection.getBalance(creator.publicKey);
    const biteBalance = await connection.getBalance(bite);

    await program.methods
      .cancelBite()
      .accountsPartial({
        creator: creator.publicKey,
        bite,
      })
      .signers([creator])
      .rpc();

    const creatorBalanceAfter = await connection.getBalance(creator.publicKey);
    assert.isAbove(
      creatorBalanceAfter,
      creatorBalanceBefore + biteBalance - 50_000, // minus a little slack for the cancel tx's own fee
      "creator should recover the full remaining deposit + rent"
    );

    const closed = await connection.getAccountInfo(bite);
    assert.isNull(closed, "Bite account should be closed after cancellation");
  });

  it("rejects cancellation by anyone other than the original creator", async () => {
    const creator = Keypair.generate();
    const attacker = Keypair.generate();
    await airdrop(creator.publicKey, 1_000_000_000);

    const biteId = freshBiteId();
    const bite = await createBite(creator, biteId, RENT_EXEMPT_MIN_0_BYTES, 2, 0);

    try {
      await program.methods
        .cancelBite()
        .accountsPartial({
          creator: attacker.publicKey,
          bite,
        })
        .signers([attacker])
        .rpc();
      assert.fail("expected cancellation by a non-creator to be rejected");
    } catch (err) {
      assert.include(JSON.stringify(err), "Unauthorized");
    }

    // Bite must still exist and be untouched.
    const account = await program.account.bite.fetch(bite);
    assert.equal(account.claimedCount, 0);
  });

  it("rejects a claim on a Bite that has already been cancelled", async () => {
    const creator = Keypair.generate();
    const claimer = Keypair.generate();
    await airdrop(creator.publicKey, 1_000_000_000);

    const biteId = freshBiteId();
    const bite = await createBite(creator, biteId, RENT_EXEMPT_MIN_0_BYTES, 2, 0);

    await program.methods
      .cancelBite()
      .accountsPartial({ creator: creator.publicKey, bite })
      .signers([creator])
      .rpc();

    try {
      await claim(bite, claimer, creator);
      assert.fail("expected claim on a cancelled (closed) Bite to be rejected");
    } catch (err) {
      // The Bite account no longer exists — Anchor rejects deserializing it.
      assert.include(JSON.stringify(err), "AccountNotInitialized");
    }
  });

  it("rejects create_bite when amount_per_claim * max_claims overflows u64", async () => {
    const creator = provider.wallet.payer as Keypair;
    const biteId = freshBiteId();
    const nearU64Max = new BN("18446744073709551615"); // u64::MAX

    try {
      await createBite(creator, biteId, nearU64Max, 2, 0);
      assert.fail("expected create_bite to reject an overflowing total deposit");
    } catch (err) {
      assert.include(JSON.stringify(err), "Overflow");
    }
  });
});
