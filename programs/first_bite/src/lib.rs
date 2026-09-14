use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("6Ep1pAfRVX65QPdSnjgd1AyB3AahqNenN5bLVNf1Y6Wy");

#[program]
pub mod first_bite {
    use super::*;

    /// Creates a Bite: deposits `amount_per_claim * max_claims` native COOK
    /// into a program-owned PDA. `expiration` is a unix timestamp, or 0 for
    /// no expiration.
    pub fn create_bite(
        ctx: Context<CreateBite>,
        bite_id: u64,
        amount_per_claim: u64,
        max_claims: u32,
        expiration: i64,
    ) -> Result<()> {
        instructions::create_bite::handler(ctx, bite_id, amount_per_claim, max_claims, expiration)
    }

    /// Claims one share of a Bite. `claimer` proves intent by signing but
    /// never needs to hold a balance — `payer` (the sponsor, in the
    /// sponsored-fee flow) covers this transaction's fee and the
    /// ClaimRecord's rent.
    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        instructions::claim::handler(ctx)
    }

    /// Cancels a Bite and returns all remaining lamports (undistributed
    /// deposit + rent) to the original creator. Only the creator may call
    /// this.
    pub fn cancel_bite(ctx: Context<CancelBite>) -> Result<()> {
        instructions::cancel_bite::handler(ctx)
    }
}
