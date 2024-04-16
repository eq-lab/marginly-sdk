const abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "AccessDenied",
    type: "error",
  },
  {
    inputs: [],
    name: "BadLeverage",
    type: "error",
  },
  {
    inputs: [],
    name: "EmergencyMode",
    type: "error",
  },
  {
    inputs: [],
    name: "ExceedsLimit",
    type: "error",
  },
  {
    inputs: [],
    name: "Forbidden",
    type: "error",
  },
  {
    inputs: [],
    name: "LessThanMinimalAmount",
    type: "error",
  },
  {
    inputs: [],
    name: "Locked",
    type: "error",
  },
  {
    inputs: [],
    name: "LongEmergency",
    type: "error",
  },
  {
    inputs: [],
    name: "NotEmergency",
    type: "error",
  },
  {
    inputs: [],
    name: "NotLiquidatable",
    type: "error",
  },
  {
    inputs: [],
    name: "NotWETH9",
    type: "error",
  },
  {
    inputs: [],
    name: "PositionInitialized",
    type: "error",
  },
  {
    inputs: [],
    name: "ShortEmergency",
    type: "error",
  },
  {
    inputs: [],
    name: "SlippageLimit",
    type: "error",
  },
  {
    inputs: [],
    name: "T",
    type: "error",
  },
  {
    inputs: [],
    name: "UninitializedPosition",
    type: "error",
  },
  {
    inputs: [],
    name: "WrongIndex",
    type: "error",
  },
  {
    inputs: [],
    name: "WrongPositionType",
    type: "error",
  },
  {
    inputs: [],
    name: "WrongValue",
    type: "error",
  },
  {
    inputs: [],
    name: "ZeroAmount",
    type: "error",
  },
  {
    inputs: [],
    name: "ZeroSeconds",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [],
    name: "BalanceSync",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "collateralDelta",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "swapPriceX96",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "collateralDiscountedDelta",
        type: "uint256",
      },
    ],
    name: "ClosePosition",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "enum PositionType",
        name: "positionType",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalCollateralReduced",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalDebtReduced",
        type: "uint256",
      },
    ],
    name: "Deleverage",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "enum PositionType",
        name: "newPositionType",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "baseDiscountedAmount",
        type: "uint256",
      },
    ],
    name: "DepositBase",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "enum PositionType",
        name: "newPositionType",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "quoteDiscountedAmount",
        type: "uint256",
      },
    ],
    name: "DepositQuote",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "enum Mode",
        name: "mode",
        type: "uint8",
      },
    ],
    name: "Emergency",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "who",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "EmergencyWithdraw",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "swapPriceX96",
        type: "uint256",
      },
    ],
    name: "EnactMarginCall",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "swapPriceX96",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "quoteDiscountedDelta",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "baseDiscountedDelta",
        type: "uint256",
      },
    ],
    name: "Long",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [],
    name: "ParametersChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "liquidator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "position",
        type: "address",
      },
      {
        indexed: false,
        internalType: "enum PositionType",
        name: "newPositionType",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newPositionQuoteDiscounted",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newPositionBaseDiscounted",
        type: "uint256",
      },
    ],
    name: "ReceivePosition",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "reinitTimestamp",
        type: "uint256",
      },
    ],
    name: "Reinit",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "swapPriceX96",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "quoteDiscountedDelta",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "baseDiscountedDelta",
        type: "uint256",
      },
    ],
    name: "Short",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "baseDiscountedDelta",
        type: "uint256",
      },
    ],
    name: "WithdrawBase",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "quoteDiscountedDelta",
        type: "uint256",
      },
    ],
    name: "WithdrawQuote",
    type: "event",
  },
  {
    inputs: [],
    name: "baseCollateralCoeff",
    outputs: [
      {
        internalType: "uint256",
        name: "inner",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "baseDebtCoeff",
    outputs: [
      {
        internalType: "uint256",
        name: "inner",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "baseDelevCoeff",
    outputs: [
      {
        internalType: "uint256",
        name: "inner",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "baseToken",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "discountedBaseCollateral",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "discountedBaseDebt",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "discountedQuoteCollateral",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "discountedQuoteDebt",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "emergencyWithdrawCoeff",
    outputs: [
      {
        internalType: "uint256",
        name: "inner",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum CallType",
        name: "call",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "amount1",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount2",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "limitPriceX96",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "flag",
        type: "bool",
      },
      {
        internalType: "address",
        name: "receivePositionAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "swapCalldata",
        type: "uint256",
      },
    ],
    name: "execute",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "factory",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getBasePrice",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "inner",
            type: "uint256",
          },
        ],
        internalType: "struct FP96.FixedPoint",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "index",
        type: "uint32",
      },
      {
        internalType: "bool",
        name: "_short",
        type: "bool",
      },
    ],
    name: "getHeapPosition",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
      {
        components: [
          {
            internalType: "uint96",
            name: "key",
            type: "uint96",
          },
          {
            internalType: "address",
            name: "account",
            type: "address",
          },
        ],
        internalType: "struct MaxBinaryHeapLib.Node",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getLiquidationPrice",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "inner",
            type: "uint256",
          },
        ],
        internalType: "struct FP96.FixedPoint",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "initialPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "inner",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_quoteToken",
        type: "address",
      },
      {
        internalType: "address",
        name: "_baseToken",
        type: "address",
      },
      {
        internalType: "bool",
        name: "_quoteTokenIsToken0",
        type: "bool",
      },
      {
        internalType: "address",
        name: "_uniswapPool",
        type: "address",
      },
      {
        components: [
          {
            internalType: "uint8",
            name: "maxLeverage",
            type: "uint8",
          },
          {
            internalType: "uint16",
            name: "priceSecondsAgo",
            type: "uint16",
          },
          {
            internalType: "uint16",
            name: "priceSecondsAgoMC",
            type: "uint16",
          },
          {
            internalType: "uint24",
            name: "interestRate",
            type: "uint24",
          },
          {
            internalType: "uint24",
            name: "fee",
            type: "uint24",
          },
          {
            internalType: "uint24",
            name: "swapFee",
            type: "uint24",
          },
          {
            internalType: "uint24",
            name: "mcSlippage",
            type: "uint24",
          },
          {
            internalType: "uint184",
            name: "positionMinAmount",
            type: "uint184",
          },
          {
            internalType: "uint184",
            name: "quoteLimit",
            type: "uint184",
          },
        ],
        internalType: "struct MarginlyParams",
        name: "_params",
        type: "tuple",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "lastReinitTimestampSeconds",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "mode",
    outputs: [
      {
        internalType: "enum Mode",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "params",
    outputs: [
      {
        internalType: "uint8",
        name: "maxLeverage",
        type: "uint8",
      },
      {
        internalType: "uint16",
        name: "priceSecondsAgo",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "priceSecondsAgoMC",
        type: "uint16",
      },
      {
        internalType: "uint24",
        name: "interestRate",
        type: "uint24",
      },
      {
        internalType: "uint24",
        name: "fee",
        type: "uint24",
      },
      {
        internalType: "uint24",
        name: "swapFee",
        type: "uint24",
      },
      {
        internalType: "uint24",
        name: "mcSlippage",
        type: "uint24",
      },
      {
        internalType: "uint184",
        name: "positionMinAmount",
        type: "uint184",
      },
      {
        internalType: "uint184",
        name: "quoteLimit",
        type: "uint184",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "positions",
    outputs: [
      {
        internalType: "enum PositionType",
        name: "_type",
        type: "uint8",
      },
      {
        internalType: "uint32",
        name: "heapPosition",
        type: "uint32",
      },
      {
        internalType: "uint256",
        name: "discountedBaseAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "discountedQuoteAmount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "quoteCollateralCoeff",
    outputs: [
      {
        internalType: "uint256",
        name: "inner",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "quoteDebtCoeff",
    outputs: [
      {
        internalType: "uint256",
        name: "inner",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "quoteDelevCoeff",
    outputs: [
      {
        internalType: "uint256",
        name: "inner",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "quoteToken",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint8",
            name: "maxLeverage",
            type: "uint8",
          },
          {
            internalType: "uint16",
            name: "priceSecondsAgo",
            type: "uint16",
          },
          {
            internalType: "uint16",
            name: "priceSecondsAgoMC",
            type: "uint16",
          },
          {
            internalType: "uint24",
            name: "interestRate",
            type: "uint24",
          },
          {
            internalType: "uint24",
            name: "fee",
            type: "uint24",
          },
          {
            internalType: "uint24",
            name: "swapFee",
            type: "uint24",
          },
          {
            internalType: "uint24",
            name: "mcSlippage",
            type: "uint24",
          },
          {
            internalType: "uint184",
            name: "positionMinAmount",
            type: "uint184",
          },
          {
            internalType: "uint184",
            name: "quoteLimit",
            type: "uint184",
          },
        ],
        internalType: "struct MarginlyParams",
        name: "_params",
        type: "tuple",
      },
    ],
    name: "setParameters",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "swapCalldata",
        type: "uint256",
      },
    ],
    name: "shutDown",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "sweepETH",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "systemLeverage",
    outputs: [
      {
        internalType: "uint128",
        name: "shortX96",
        type: "uint128",
      },
      {
        internalType: "uint128",
        name: "longX96",
        type: "uint128",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "uniswapPool",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
] as const;

export default abi;
