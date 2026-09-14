use anchor_lang::prelude::*;
use anchor_lang::system_program::{self, Transfer};

use crate::errors::FirstBiteError;
use crate::state::{Bite, BiteStatus};

#[derive(Accounts)]
#[instruction(bite_id: u64)]
pub struct CreateBite<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init,
        payer = creator,
        space = 8 + Bite::INIT_SPACE,
        seeds = [b"bite", creator.key().as_ref(), &bite_id.to_le_bytes()],
        bump,
    )]
    pub bite: Account<'info, Bite>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreateBite>,
    bite_id: u64,
    amount_per_claim: u64,
    max_claims: u32,
    expiration: i64,
) -> Result<()> {
    require!(max_claims > 0, FirstBiteError::InvalidMaxClaims);

    let rent_exempt_minimum = Rent::get()?.minimum_balance(0);
    require!(
        amount_per_claim >= rent_exempt_minimum,
        FirstBiteError::AmountPerClaimTooLow
    );

    let total_deposit = amount_per_claim
        .checked_mul(max_claims as u64)
        .ok_or(FirstBiteError::Overflow)?;

    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.creator.to_account_info(),
                to: ctx.accounts.bite.to_account_info(),
            },
        ),
        total_deposit,
    )?;

    let bite = &mut ctx.accounts.bite;
    bite.creator = ctx.accounts.creator.key();
    bite.bite_id = bite_id;
    bite.amount_per_claim = amount_per_claim;
    bite.max_claims = max_claims;
    bite.claimed_count = 0;
    bite.expiration = expiration;
    bite.status = BiteStatus::Active;
    bite.bump = ctx.bumps.bite;

    Ok(())
}
