use anchor_lang::prelude::*;

use crate::errors::FirstBiteError;
use crate::state::Bite;

#[derive(Accounts)]
pub struct CancelBite<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        mut,
        seeds = [b"bite", bite.creator.as_ref(), &bite.bite_id.to_le_bytes()],
        bump = bite.bump,
        constraint = bite.creator == creator.key() @ FirstBiteError::Unauthorized,
        close = creator,
    )]
    pub bite: Account<'info, Bite>,
}

pub fn handler(_ctx: Context<CancelBite>) -> Result<()> {
    // `close = creator` above returns every remaining lamport in the Bite
    // account (both the undistributed deposit and the account's own rent)
    // to the creator in a single transfer — no separate bookkeeping needed.
    Ok(())
}
