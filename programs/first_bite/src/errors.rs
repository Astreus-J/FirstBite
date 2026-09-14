use anchor_lang::prelude::*;

#[error_code]
pub enum FirstBiteError {
    #[msg("amount_per_claim must be at least the rent-exempt minimum for a new account")]
    AmountPerClaimTooLow,
    #[msg("max_claims must be greater than zero")]
    InvalidMaxClaims,
    #[msg("this Bite is not active")]
    BiteNotActive,
    #[msg("this Bite has expired")]
    BiteExpired,
    #[msg("only the original creator can perform this action")]
    Unauthorized,
    #[msg("arithmetic overflow")]
    Overflow,
}
