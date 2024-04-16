# Marginly SDK

SDK for the Marginly protocol

## Installation

```sh
$ yarn add @equilab/marginly-sdk
```

## Usage with ethers.js

### Chain and pool

This example will use Arbitrum mainnet and WETH/USDC marginly pool contract. BigNumber is imported from ethers.js

```typescript
import { BigNumber, BigNumberish, ethers } from 'ethers';

const CHAIN_ID = 42161;
const POOL_ADDRESS = '0x87e711BcB9Ed1f2f6dec8fcC74cD2e0613D43b86';
```

### Contract initialization

```typescript
import type { MarginlyPool } from '@equilab/marginly-sdk/abis/types/MarginlyPool';
import ABI from '@equilab/marginly-sdk/abis/marginly-pool.json';

const contract = useContract<MarginlyPool>(POOL_ADDRESS, ABI.abi, true);
```

### Requesting neccessary parameters

This example is using `updatedAt` counter with some interval.

```typescript
import { MarginlyCoeffs } from '@equilab/marginly-sdk';

const [basePriceX96, setBasePriceX96] = useState<BigNumber>();
const [coeffs, setCoeffs] = useState<MarginlyCoeffs>();
const [baseTokenAddress, setBaseTokenAddress] = useState<string>();
const [quoteTokenAddress, setQuoteTokenAddress] = useState<string>();

useEffect(() => {
  if (!contract) return;

  contract
    .baseToken()
    .then((res) => setBaseTokenAddress(res))
    .catch((e) => e instanceof Error && console.error(e));

  contract
    .quoteToken()
    .then((res) => setQuoteTokenAddress(res))
    .catch((e) => e instanceof Error && console.error(e));

  contract
    .getLiquidationPrice()
    .then((res) => {
      setBasePriceX96(BigNumber.from(res.inner));
    })
    .catch((e) => e instanceof Error && console.error(e));

  Promise.all([
    contract.baseCollateralCoeff(),
    contract.quoteCollateralCoeff(),
    contract.baseDelevCoeff(),
    contract.quoteDelevCoeff(),
    contract.baseDebtCoeff(),
    contract.quoteDebtCoeff(),
  ])
    .then(
      ([baseCollateralCoeff, quoteCollateralCoeff, baseDelevCoeff, quoteDelevCoeff, baseDebtCoeff, quoteDebtCoeff]) => {
        setCoeffs({
          baseCollateralCoeff,
          quoteCollateralCoeff,
          baseDelevCoeff,
          quoteDelevCoeff,
          baseDebtCoeff,
          quoteDebtCoeff,
        });
      }
    )
    .catch((e) => e instanceof Error && console.error(e));
}, [contract, updatedAt]);
```

There are 2 methods to get latest base price: `getBasePrice` and `getLiquidationPrice`. Both are twap prices with different intervals. `getLiquidationPrice` updates more frequently.

Use base and quote token addresses to request their parameters from chain.

### Requesting account position

```typescript
import { useWeb3React } from '@web3-react/core';

const { account, provider } = useWeb3React();
const [position, setPosition] = useState<{
  _type: number;
  heapPosition: number;
  discountedBaseAmount: BigNumber;
  discountedQuoteAmount: BigNumber;
}>();

useEffect(() => {
  if (!account || !contract) return;

  contract
    .positions(account)
    .then((res) => {
      setPosition(res);
    })
    .catch((e) => e instanceof Error && console.error(e));
}, [contract, updatedAt, account]);
```

### Creating position object

After recieving position and coeffs we can use MarginlyPosition class

```typescript
import { MarginlyPosition } from '@equilab/marginly-sdk';

const derivedPosition = useMemo(() => {
  if (!position || !coeffs) return;

  return new MarginlyPosition(coeffs, position._type, position.discountedBaseAmount, position.discountedQuoteAmount);
}, [position, coeffs]);
```

### Open position

Create transaction to open position. You need deposit amount and position amount to open position.

Long position example

```
Depositing 0.1 ETH (will be auto converted to WETH)
With leverage 5
means position amount equals 0.4
```

Short position example

```
Depositing 100 USDC
With leverage 5
means position amount equals [(5 - 1) * 100] / basePrice
```

When opening position `limitPrice` is provided so you can limit your slippage. Example below has slippage limit 5%. Limit price is in fixed point x96 format.

Depending on position direction `getDepositBaseAndLongArgs` or `getDepositQuoteAndShortArgs` method is used to prepare arguments.

```typescript
import {
  convertPriceHumanToX96,
  convertPriceStringToX96,
  convertPriceX96ToHuman,
  getCalldata,
  getDepositBaseAndLongArgs,
  getDepositQuoteAndShortArgs,
} from '@equilab/marginly-sdk';

const openPositionTx = useMemo(() => {
  const limitPrice = basePrice
    ? direction === 'short'
      ? basePrice.toNumber() * 0.95
      : basePrice.toNumber() * 1.05
    : undefined;
  if (!limitPrice) return undefined;

  const depositAmount = ethers.utils.parseUnits(inputAmount || '0', depositToken.decimals);

  const positionAmount = ethers.utils.parseUnits(
    leveragedAmount.toFixed(direction === 'long' ? baseToken.decimals : quoteToken.decimals),
    baseToken.decimals
  );

  const limitPriceX96 = convertPriceStringToX96(
    limitPrice.toString(),
    BigNumber.from(baseToken.decimals),
    BigNumber.from(quoteToken.decimals)
  );

  const openMethod = direction === 'long' ? getDepositBaseAndLongArgs : getDepositQuoteAndShortArgs;

  const args = openMethod(depositAmount, positionAmount, limitPriceX96, ZERO, isNativeToken);

  const { calldata } = getCalldata(args);

  const tx = {
    from: account,
    to: POOL_ADDRESS,
    data: calldata,
    ...(isNativeToken ? { value: depositAmount } : {}),
  };

  return tx;
}, [account, inputAmount, basePrice, positionAmount, leveragedAmount, isNativeToken, isValidAmount]);
```

### Close position

```typescript
const closePositionTx = useMemo(() => {
  const limitPrice = basePrice
    ? derivedPosition.type === PositionType.Long
      ? basePrice.toNumber() * 0.95
      : basePrice.toNumber() * 1.05
    : undefined;

  if (!limitPrice) return undefined;

  const limitPriceX96 = convertPriceStringToX96(
    limitPrice.toString(),
    BigNumber.from(baseToken.decimals),
    BigNumber.from(quoteToken.decimals)
  );

  const args = getClosePositionArgs(limitPriceX96, ZERO, isNativeToken);

  const { calldata } = getCalldata(args);

  const tx = {
    from: account,
    to: POOL_ADDRESS,
    data: calldata,
  };

  return tx;
}, [derivedPosition, basePrice, baseToken, quoteToken, account, direction]);
```

### Withdraw all deposit

After closing long/short position you should withdraw deposit

```typescript
const withdrawAllTx = useMemo(() => {
  if (!derivedPosition || derivedPosition.type !== PositionType.Lend) return;

  const isWithdrawingBase = derivedPosition.baseAmount.gt(0);

  const args = isWithdrawingBase
    ? getWithdrawBaseAllArgs(baseToken?.isNative)
    : getWithdrawQuoteAllArgs(quoteToken?.isNative);
  const { calldata } = getCalldata(args);
  const tx = {
    from: account,
    to: POOL_ADDRESS,
    data: calldata,
  };
  return tx;
}, [derivedPosition, baseToken, quoteToken, account]);
```

## Usage with wagmi (v1)

### Chain and pool

This example will use Arbitrum mainnet and WETH/USDC marginly pool contract. BigNumber is imported from ethers.js

```typescript
import {
  getActionArgs,
  getWithdrawAllArgs,
  MarginlyCoeffsBigInt,
  MarginlyPositionBigInt,
  PositionType,
} from '@equilab/marginly-sdk';
import ABI from '@equilab/marginly-sdk/abis/marginly-pool.json';
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useToken } from 'wagmi';

const CHAIN_ID = 42161;
const POOL_ADDRESS_WETH_USDC = '0x87e711BcB9Ed1f2f6dec8fcC74cD2e0613D43b86';

const contractInfo = {
  abi: ABI.abi,
  address: POOL_ADDRESS_WETH_USDC,
} as const;
```

### Requesting neccessary parameters

```typescript
const baseTokenAddress = useContractRead({
  ...contractInfo,
  functionName: 'baseToken',
});
const quoteTokenAddress = useContractRead({
  ...contractInfo,
  functionName: 'quoteToken',
});

const getLiquidationPrice = useContractRead({
  ...contractInfo,
  functionName: 'getLiquidationPrice',
});

const basePriceX96 = getLiquidationPrice.data?.inner || 0n;

const baseCollateralCoeff = useContractRead({
  ...contractInfo,
  functionName: 'baseCollateralCoeff',
});

const quoteCollateralCoeff = useContractRead({
  ...contractInfo,
  functionName: 'quoteCollateralCoeff',
});

const baseDelevCoeff = useContractRead({
  ...contractInfo,
  functionName: 'baseDelevCoeff',
});

const quoteDelevCoeff = useContractRead({
  ...contractInfo,
  functionName: 'quoteDelevCoeff',
});

const baseDebtCoeff = useContractRead({
  ...contractInfo,
  functionName: 'baseDebtCoeff',
});

const quoteDebtCoeff = useContractRead({
  ...contractInfo,
  functionName: 'quoteDebtCoeff',
});

const { data: baseToken } = useToken({ address: baseTokenAddress.data });
const { data: quoteToken } = useToken({ address: quoteTokenAddress.data });
```

There are 2 methods to get latest base price: `getBasePrice` and `getLiquidationPrice`. Both are twap prices with different intervals. `getLiquidationPrice` updates more frequently.

Use base and quote token addresses to request their parameters from chain.

### Requesting account position

```typescript
const coeffs: MarginlyCoeffsBigInt = useMemo(
  () => ({
    baseCollateralCoeff: baseCollateralCoeff.data || 0n,
    baseDebtCoeff: baseDebtCoeff.data || 0n,
    quoteCollateralCoeff: quoteCollateralCoeff.data || 0n,
    quoteDebtCoeff: quoteDebtCoeff.data || 0n,
    baseDelevCoeff: baseDelevCoeff.data || 0n,
    quoteDelevCoeff: quoteDelevCoeff.data || 0n,
  }),
  [
    baseCollateralCoeff.data,
    baseDebtCoeff.data,
    baseDelevCoeff.data,
    quoteCollateralCoeff.data,
    quoteDebtCoeff.data,
    quoteDelevCoeff.data,
  ]
);

const positions = useContractRead({
  ...contractInfo,
  functionName: 'positions',
  args: [account.address],
});

const position: {
  _type: number;
  heapPosition: number;
  discountedBaseAmount: bigint;
  discountedQuoteAmount: bigint;
} = useMemo(
  () =>
    positions.data && {
      _type: positions.data[0],
      heapPosition: positions.data[1],
      discountedBaseAmount: positions.data[2],
      discountedQuoteAmount: positions.data[3],
    },
  [positions.data]
);
```

### Creating position object

After recieving position and coeffs we can use MarginlyPosition class

```typescript
const derivedPosition = useMemo(() => {
  if (!position || !coeffs || position._type === PositionType.Uninitialized) return;

  return new MarginlyPositionBigInt(
    coeffs,
    position._type,
    position.discountedBaseAmount,
    position.discountedQuoteAmount
  );
}, [position, coeffs]);
```

### Open position

Create transaction to open position. You need deposit amount and position amount to open position.

Long position example

```
Depositing 0.1 ETH (will be auto converted to WETH)
With leverage 5
means position amount equals 0.4
```

Short position example

```
Depositing 100 USDC
With leverage 5
means position amount equals [(5 - 1) * 100] / basePrice
```

Depending on position direction `getDepositBaseAndLongArgs` or `getDepositQuoteAndShortArgs` method is used to prepare arguments.

Use `getActionArgs` helper to open long/short position.

```typescript
const useOpen = ({
  accountAddress,
  baseToken,
  quoteToken,
  inputAmount,
  leverage,
  isNativeToken,
  basePriceX96,
  direction,
}: {
  accountAddress: `0x${string}` | undefined;
  baseToken: FetchTokenResult | undefined;
  quoteToken: FetchTokenResult | undefined;
  inputAmount: string;
  leverage: number;
  isNativeToken: boolean;
  basePriceX96: bigint;
  direction: "long" | "short";
}) => {
  const openPositionParamsWagmi = useMemo(() => {
    if (!baseToken || !quoteToken) return;
    return getActionArgs({
      type: "depositAndOpenPosition",
      baseDecimals: baseToken?.decimals,
      basePriceX96,
      depositAmount: inputAmount,
      direction,
      slippageTolerancePercentage: 1,
      leverage,
      isDepositingNativeToken: isNativeToken,
      quoteDecimals: quoteToken?.decimals,
      swapCalldata: 0n,
    });
  }, [
    basePriceX96,
    baseToken,
    direction,
    inputAmount,
    isNativeToken,
    leverage,
    quoteToken,
  ]);

  const { config: openPositionConfigWagmi } = usePrepareContractWrite(
    openPositionParamsWagmi
      ? {
          ...contractInfo,
          args: openPositionParamsWagmi.args,
          value: openPositionParamsWagmi.value,
          functionName: openPositionParamsWagmi.methodName,
          account: accountAddress,
          gas: undefined,
        }
      : undefined,
  );

  const openPositionTx = useContractWrite(openPositionConfigWagmi);

  const handleOpen = () => {
    openPositionTx.writeAsync?.();
  };
  return handleOpen;
};
...
// long and short examples
 const handleOpenLong = useOpen({
    accountAddress: account.address,
    basePriceX96,
    baseToken,
    direction: "long",
    inputAmount: inputLongAmount,
    isNativeToken,
    leverage,
    quoteToken,
  });

  const handleOpenShort = useOpen({
    accountAddress: account.address,
    basePriceX96,
    baseToken,
    direction: "short",
    inputAmount: inputShortAmount,
    isNativeToken: false,
    leverage,
    quoteToken,
  });


```

### Close position

```typescript
const useClose = ({
  accountAddress,
  baseToken,
  quoteToken,
  isNativeToken,
  basePriceX96,
  type,
}: {
  accountAddress: `0x${string}` | undefined;
  baseToken: FetchTokenResult | undefined;
  quoteToken: FetchTokenResult | undefined;
  isNativeToken: boolean;
  basePriceX96: bigint;
  type: PositionType | undefined;
}) => {
  const closePositionParams = useMemo(() => {
    if (!baseToken || !quoteToken) return;
    return getActionArgs({
      baseDecimals: baseToken?.decimals,
      basePriceX96,
      direction: type === PositionType.Long ? 'long' : 'short',
      isDepositingNativeToken: isNativeToken,
      quoteDecimals: quoteToken.decimals,
      slippageTolerancePercentage: 5,
      swapCalldata: 0n,
      type: 'close',
    });
  }, [basePriceX96, baseToken, isNativeToken, quoteToken, type]);

  const { config: closePositionConfig } = usePrepareContractWrite(
    closePositionParams
      ? {
          ...contractInfo,
          args: closePositionParams.args,
          value: closePositionParams.value,
          functionName: closePositionParams.methodName,
          account: accountAddress,
          gas: undefined,
        }
      : undefined
  );

  const closePositionTx = useContractWrite(closePositionConfig);
  const handleClose = () => {
    closePositionTx.writeAsync?.();
  };
  return handleClose;
};
```

When long or short position is closed user has lend position with his deposit.

### Withdraw all deposit

To withdraw deposit from lend position use `getWithdrawAllArgs` helper to prepare contract call arguments

```typescript
const useWithdraw = ({
  accountAddress,
  derivedPosition,
  isNativeToken,
}: {
  accountAddress: `0x${string}` | undefined;
  derivedPosition: MarginlyPositionBigInt | undefined;
  isNativeToken: boolean;
}) => {
  const withdrawAllParams = useMemo(() => {
    return getWithdrawAllArgs(derivedPosition, isNativeToken, !isNativeToken);
  }, [derivedPosition, isNativeToken]);

  const { config: withdrawPositionConfig } = usePrepareContractWrite(
    withdrawAllParams
      ? {
          ...contractInfo,
          args: withdrawAllParams.args,
          value: withdrawAllParams.value,
          functionName: withdrawAllParams.methodName,
          account: accountAddress,
          gas: undefined,
        }
      : undefined
  );

  const withdrawPositionTx = useContractWrite(withdrawPositionConfig);

  const handleWithdraw = () => {
    withdrawPositionTx.writeAsync?.();
  };

  return handleWithdraw;
};
```
