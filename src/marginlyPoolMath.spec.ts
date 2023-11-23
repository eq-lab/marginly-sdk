import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { FP96_ONE } from './consts';
import {
  calcLongLeverage,
  calcLongLiquidationPriceX96,
  calcRealBaseCollateral,
  calcRealQuoteCollateral,
  calcShortLeverage,
  calcShortLiquidationPriceX96,
  convertPriceHumanToX96,
  convertPriceX96ToHuman,
  divFP96,
  mulFP96,
} from './marginlyPoolMath';

describe('math operations', () => {
  it('FP96_ONE', async () => {
    expect(FP96_ONE.toBigInt()).to.be.eq(1n << 96n);
  });

  it('mulFP96', async () => {
    const multiplier = BigNumber.from(123456789);
    const multiplicand = 4;
    const multiplicandX96 = FP96_ONE.mul(multiplicand);
    const result = multiplier.mul(multiplicand);

    expect(mulFP96(multiplier, multiplicandX96).toBigInt()).to.be.eq(result.toBigInt());
    expect(mulFP96(multiplicandX96, multiplier).toBigInt()).to.be.eq(result.toBigInt());
  });

  it('divFP96', async () => {
    const numerator = BigNumber.from(123456789);
    const denominator = 3;
    const denominatorX96 = FP96_ONE.mul(denominator);
    const result = numerator.div(denominator);

    expect(divFP96(numerator, denominatorX96).toBigInt()).to.be.eq(result.toBigInt());
  });
});

describe('Marginly calculations', () => {
  it('calcRealBaseCollateral', async () => {
    const baseCollateralCoeff = FP96_ONE.div(2);
    const baseDelevCoeff = FP96_ONE.div(4);
    const discountedBaseCollateral = BigNumber.from(10);
    const discountedQuoteDebt = BigNumber.from(4);
    const result = calcRealBaseCollateral(
      baseCollateralCoeff,
      baseDelevCoeff,
      discountedBaseCollateral,
      discountedQuoteDebt
    );

    // baseCollCoeff * disBaseColl - baseDelevCoeff * disQuoteDebt = 1/2 * 10 - 1/4 * 4 = 4
    expect(result.toBigInt()).to.be.eq(4n);
  });

  it('calcRealQuoteCollateral', async () => {
    const quoteCollateralCoeff = FP96_ONE.div(2);
    const quoteDelevCoeff = FP96_ONE.div(4);
    const discountedQuoteCollateral = BigNumber.from(10);
    const discountedBaseDebt = BigNumber.from(4);
    const result = calcRealQuoteCollateral(
      quoteCollateralCoeff,
      quoteDelevCoeff,
      discountedQuoteCollateral,
      discountedBaseDebt
    );

    // quoteCollCoeff * disQuoteColl - quoteDelevCoeff * disBaseDebt = 1/2 * 10 - 1/4 * 4 = 4
    expect(result.toBigInt()).to.be.eq(4n);
  });

  it('calcLongLeverage', async () => {
    const baseCollateral = BigNumber.from(6);
    const quoteDebt = BigNumber.from(3000);
    const priceX96 = FP96_ONE.mul(1000);

    // 6 * 1000 / (6 * 1000 - 3000) = 2
    expect(calcLongLeverage(baseCollateral, quoteDebt, priceX96).toBigInt()).to.be.eq(2n);
  });

  it('calcShortLeverage', async () => {
    const quoteCollateral = BigNumber.from(6000);
    const baseDebt = BigNumber.from(3);
    const priceX96 = FP96_ONE.mul(1000);

    // 6000 / (6000 - 3 * 1000) = 2
    expect(calcShortLeverage(quoteCollateral, baseDebt, priceX96).toBigInt()).to.be.eq(2n);
  });

  it('calcLongLiquidationPrice', async () => {
    const baseCollateral = BigNumber.from(6);
    const quoteDebt = BigNumber.from(3000);
    const maxLeverage = BigNumber.from(2);

    expect(calcLongLiquidationPriceX96(baseCollateral, quoteDebt, maxLeverage).toBigInt()).to.be.eq(
      FP96_ONE.mul(1000).toBigInt()
    );
  });

  it('calcShortLiquidationPrice', async () => {
    const quoteCollateral = BigNumber.from(6000);
    const baseDebt = BigNumber.from(3);
    const maxLeverage = BigNumber.from(2);

    expect(calcShortLiquidationPriceX96(quoteCollateral, baseDebt, maxLeverage).toBigInt()).to.be.eq(
      FP96_ONE.mul(1000).toBigInt()
    );
  });
});

describe('Price conversion', () => {
  it('convertPriceX96ToHuman', async () => {
    const price = BigNumber.from(2000);
    const baseDecimals = BigNumber.from(18);
    const quoteDecimals = BigNumber.from(6);
    const priceX96 = FP96_ONE.mul(price)
      .mul(BigNumber.from(10).pow(baseDecimals.sub(quoteDecimals)))
      .toBigInt();

    expect(convertPriceHumanToX96(price, baseDecimals, quoteDecimals).toBigInt()).to.be.eq(priceX96);
  });

  it('convertPriceX96ToHuman', async () => {
    const price = 2000n;
    const baseDecimals = BigNumber.from(18);
    const quoteDecimals = BigNumber.from(6);
    const priceX96 = FP96_ONE.mul(price).mul(BigNumber.from(10).pow(baseDecimals.sub(quoteDecimals)));

    expect(convertPriceX96ToHuman(priceX96, baseDecimals, quoteDecimals).toBigInt()).to.be.eq(price);
  });
});
