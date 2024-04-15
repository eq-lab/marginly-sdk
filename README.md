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
const CHAIN_ID = 42161;
const POOL_ADDRESS_WETH_USDC = '0x87e711BcB9Ed1f2f6dec8fcC74cD2e0613D43b86';

const contractInfo = {
  abi: ABI.abi,
  address: POOL_ADDRESS_WETH_USDC,
} as const;
```

### Requesting neccessary parameters

```typescript

```

There are 2 methods to get latest base price: `getBasePrice` and `getLiquidationPrice`. Both are twap prices with different intervals. `getLiquidationPrice` updates more frequently.

Use base and quote token addresses to request their parameters from chain.

### Requesting account position

```typescript

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

```

### Close position

```typescript

```

### Withdraw all deposit

After closing long/short position you should withdraw deposit

```typescript

```
