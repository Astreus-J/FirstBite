use anchor_lang::prelude::*;

use crate::errors::FirstBiteError;
use crate::state::{Bite, BiteStatus, ClaimRecord};

#[derive(Accounts)]
pub struct Claim<'info> {
    /// The recipient. Not required to hold any lamports — this is the whole
    /// point of FirstBite. Must sign to prove it is the intended claimer;
    /// the fee for this transaction is expected to be paid by a separate
    /// feePayer (the sponsor), never by this account. `mut` because its
    /// lamport balance is credited directly below.
    #[account(mut)]
    pub claimer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"bite", bite.creator.as_ref(), &bite.bite_id.to_le_bytes()],
        bump = bite.bump,
    )]
    pub bite: Account<'info, Bite>,

    /// Existence of this PDA is itself the proof that (bite, claimer) has
    /// already claimed — `init` fails outright on a second attempt, which is
    /// what makes duplicate claims impossible rather than merely checked.
    #[account(
        init,
        payer = payer,
        space = 8 + ClaimRecord::INIT_SPACE,
        seeds = [b"claim", bite.key().as_ref(), claimer.key().as_ref()],
        bump,
    )]
    pub claim_record: Account<'info, ClaimRecord>,

    /// Pays rent for the new `ClaimRecord` account. In the sponsored flow
    /// this is the sponsor (feePayer); nothing here requires it to be the
    /// claimer.
    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Claim>) -> Result<()> {
    let bite = &mut ctx.accounts.bite;

    // `status` is the single source of truth for "can this Bite still be
    // claimed" — it flips to Depleted in lockstep with claimed_count reaching
    // max_claims below, so checking claimed_count here too would be dead code.
    require!(
        bite.status == BiteStatus::Active,
        FirstBiteError::BiteNotActive
    );
    require!(
        bite.expiration == 0 || Clock::get()?.unix_timestamp < bite.expiration,
        FirstBiteError::BiteExpired
    );

    let amount = bite.amount_per_claim;

    **bite.to_account_info().try_borrow_mut_lamports()? = bite
        .to_account_info()
        .lamports()
        .checked_sub(amount)
        .ok_or(FirstBiteError::Overflow)?;
    **ctx
        .accounts
        .claimer
        .to_account_info()
        .try_borrow_mut_lamports()? = ctx
        .accounts
        .claimer
        .to_account_info()
        .lamports()
        .checked_add(amount)
        .ok_or(FirstBiteError::Overflow)?;

    bite.claimed_count = bite
        .claimed_count
        .checked_add(1)
        .ok_or(FirstBiteError::Overflow)?;
    if bite.claimed_count == bite.max_claims {
        bite.status = BiteStatus::Depleted;
    }

    let claim_record = &mut ctx.accounts.claim_record;
    claim_record.bite = bite.key();
    claim_record.claimer = ctx.accounts.claimer.key();
    claim_record.bump = ctx.bumps.claim_record;

    Ok(())
}
