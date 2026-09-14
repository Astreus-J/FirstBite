use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Bite {
    pub creator: Pubkey,
    pub bite_id: u64,
    pub amount_per_claim: u64,
    pub max_claims: u32,
    pub claimed_count: u32,
    /// Unix timestamp. 0 means "no expiration".
    pub expiration: i64,
    pub status: BiteStatus,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct ClaimRecord {
    pub bite: Pubkey,
    pub claimer: Pubkey,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, InitSpace, Clone, Copy, PartialEq, Eq)]
pub enum BiteStatus {
    Active,
    Depleted,
}
