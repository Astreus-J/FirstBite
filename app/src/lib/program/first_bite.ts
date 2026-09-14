/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/first_bite.json`.
 */
export type FirstBite = {
  "address": "6Ep1pAfRVX65QPdSnjgd1AyB3AahqNenN5bLVNf1Y6Wy",
  "metadata": {
    "name": "firstBite",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "cancelBite",
      "docs": [
        "Cancels a Bite and returns all remaining lamports (undistributed",
        "deposit + rent) to the original creator. Only the creator may call",
        "this."
      ],
      "discriminator": [
        129,
        179,
        223,
        169,
        37,
        151,
        246,
        15
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "bite",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  105,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "bite.creator",
                "account": "bite"
              },
              {
                "kind": "account",
                "path": "bite.bite_id",
                "account": "bite"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "claim",
      "docs": [
        "Claims one share of a Bite. `claimer` proves intent by signing but",
        "never needs to hold a balance — `payer` (the sponsor, in the",
        "sponsored-fee flow) covers this transaction's fee and the",
        "ClaimRecord's rent."
      ],
      "discriminator": [
        62,
        198,
        214,
        193,
        213,
        159,
        108,
        210
      ],
      "accounts": [
        {
          "name": "claimer",
          "docs": [
            "The recipient. Not required to hold any lamports — this is the whole",
            "point of FirstBite. Must sign to prove it is the intended claimer;",
            "the fee for this transaction is expected to be paid by a separate",
            "feePayer (the sponsor), never by this account. `mut` because its",
            "lamport balance is credited directly below."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "bite",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  105,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "bite.creator",
                "account": "bite"
              },
              {
                "kind": "account",
                "path": "bite.bite_id",
                "account": "bite"
              }
            ]
          }
        },
        {
          "name": "claimRecord",
          "docs": [
            "Existence of this PDA is itself the proof that (bite, claimer) has",
            "already claimed — `init` fails outright on a second attempt, which is",
            "what makes duplicate claims impossible rather than merely checked."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  97,
                  105,
                  109
                ]
              },
              {
                "kind": "account",
                "path": "bite"
              },
              {
                "kind": "account",
                "path": "claimer"
              }
            ]
          }
        },
        {
          "name": "payer",
          "docs": [
            "Pays rent for the new `ClaimRecord` account. In the sponsored flow",
            "this is the sponsor (feePayer); nothing here requires it to be the",
            "claimer."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "createBite",
      "docs": [
        "Creates a Bite: deposits `amount_per_claim * max_claims` native COOK",
        "into a program-owned PDA. `expiration` is a unix timestamp, or 0 for",
        "no expiration."
      ],
      "discriminator": [
        193,
        127,
        206,
        230,
        21,
        82,
        97,
        55
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "bite",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  105,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "arg",
                "path": "biteId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "biteId",
          "type": "u64"
        },
        {
          "name": "amountPerClaim",
          "type": "u64"
        },
        {
          "name": "maxClaims",
          "type": "u32"
        },
        {
          "name": "expiration",
          "type": "i64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "bite",
      "discriminator": [
        35,
        143,
        3,
        76,
        55,
        131,
        126,
        127
      ]
    },
    {
      "name": "claimRecord",
      "discriminator": [
        57,
        229,
        0,
        9,
        65,
        62,
        96,
        7
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "amountPerClaimTooLow",
      "msg": "amount_per_claim must be at least the rent-exempt minimum for a new account"
    },
    {
      "code": 6001,
      "name": "invalidMaxClaims",
      "msg": "max_claims must be greater than zero"
    },
    {
      "code": 6002,
      "name": "biteNotActive",
      "msg": "this Bite is not active"
    },
    {
      "code": 6003,
      "name": "biteExpired",
      "msg": "this Bite has expired"
    },
    {
      "code": 6004,
      "name": "unauthorized",
      "msg": "only the original creator can perform this action"
    },
    {
      "code": 6005,
      "name": "overflow",
      "msg": "arithmetic overflow"
    }
  ],
  "types": [
    {
      "name": "bite",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "biteId",
            "type": "u64"
          },
          {
            "name": "amountPerClaim",
            "type": "u64"
          },
          {
            "name": "maxClaims",
            "type": "u32"
          },
          {
            "name": "claimedCount",
            "type": "u32"
          },
          {
            "name": "expiration",
            "docs": [
              "Unix timestamp. 0 means \"no expiration\"."
            ],
            "type": "i64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "biteStatus"
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "biteStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "active"
          },
          {
            "name": "depleted"
          }
        ]
      }
    },
    {
      "name": "claimRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bite",
            "type": "pubkey"
          },
          {
            "name": "claimer",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
