# Marginly SDK
SDK for the Marginly protocol

## Usage
This SDK contains bindings for building Marginly contract calls and reproducing some inner math and calculations.

### MarginlyPoolExecute

Contains an abstract class with methods to generate calls input for Marginly contracts.

```ts
import { BigNumber, parseUnits } from 'ethers';
import { convertPriceHumanToX96, MarginlyPoolExecute } from '@eq-lab/marginly-sdk';

const wethDecimals = BigNumber.from(18);
const usdcDecimals = BigNumber.from(6);

const depositBaseAmount = parseUnits('1', wethDecimals);
const longAmount = parseUnits('10', wethDecimals);
const limitPriceX96 = convertPriceHumanToX96(
    BigNumber.from(2000), 
    wethDecimals, 
    usdcDecimals
);

const { method, args, value } = MarginlyPoolExecute.depositBaseAndLong(
    depositBaseAmount, 
    longAmount, 
    limitPriceX96
);
```

### MarginlyPoolPosition

This class is used to construct a Marginly position representation with real values from pools inner discounted ones. 
Moreover it contains methods for position characteristics calculations such as:
* leverage
* liquidation price
* available withdraw amounts

### MarginlyPoolMath

Contains low level math, used in contract calculations and other modules of sdk including:
* FP96 math
* discounted-to-real values conversions
* X96 price conversions
* low level position/pool parameters calculations (e.g. leverage, liquidation price)

## Tests

Run tests
```sh
yarn test
```
