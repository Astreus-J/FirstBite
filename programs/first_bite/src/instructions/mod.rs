#![allow(ambiguous_glob_reexports)]

pub mod cancel_bite;
pub mod claim;
pub mod create_bite;

// Wildcard re-exports are required so the account-context structs (and the
// Anchor-macro-generated client/IDL helpers for each) are reachable from
// `use instructions::*` in lib.rs. Each module also has a `handler` fn of
// the same name, which makes this an *ambiguous* glob re-export — harmless
// here because lib.rs always calls `instructions::<module>::handler(..)`
// fully qualified, never the ambiguous glob-imported name.
pub use cancel_bite::*;
pub use claim::*;
pub use create_bite::*;
