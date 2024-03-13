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
  convertPriceStringToX96,
  convertPriceX96ToHuman,
  divFP96,
  extractFractionAndWhole,
  mulFP96,
} from './marginlyPoolMath';
import { describe } from '@jest/globals';

const X96_2000 = 158456325028528675187n;

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
  it('convertPriceHumanToX96', async () => {
    const price = BigNumber.from(2000);
    const baseDecimals = BigNumber.from(18);
    const quoteDecimals = BigNumber.from(6);
    const actual = convertPriceHumanToX96(price, baseDecimals, quoteDecimals);

    expect(actual.toBigInt()).to.be.eq(X96_2000);
  });

  it('convertPriceX96ToHuman', async () => {
    const baseDecimals = BigNumber.from(18);
    const quoteDecimals = BigNumber.from(6);

    expect(convertPriceX96ToHuman(BigNumber.from(X96_2000), baseDecimals, quoteDecimals).toNumber()).to.be.closeTo(
      2000,
      1
    );
  });

  it('Convert 4029 in X96 to human', async () => {
    const expected = 4029n;
    const baseDecimals = BigNumber.from(18);
    const quoteDecimals = BigNumber.from(6);

    expect(
      convertPriceX96ToHuman(BigNumber.from(319278614229239593873n), baseDecimals, quoteDecimals).toBigInt()
    ).to.be.eq(expected);
  });

  it('Convert 2000 as string in X96 to human', async () => {
    const baseDecimals = BigNumber.from(18);
    const quoteDecimals = BigNumber.from(6);
    const actual = convertPriceStringToX96('2000', baseDecimals, quoteDecimals);

    expect(actual.toBigInt()).to.be.eq(X96_2000);
  });

  it('Convert 4029.12345 to X96', async () => {
    const baseDecimals = BigNumber.from(18);
    const quoteDecimals = BigNumber.from(6);
    const actual = convertPriceStringToX96('4228.3950348885', baseDecimals, quoteDecimals);

    expect(actual.toBigInt()).to.be.eq(33500796899865450163776461401334883129753n);
  });
});

describe('extractFractionAndWhole', () => {
  it('should extract whole and fraction when a valid number with both parts is provided', () => {
    const result = extractFractionAndWhole('123.456');
    expect(result).to.deep.eq({ whole: '123', fraction: '456' });
  });

  it('should extract only the whole part when a valid number with only the whole part is provided', () => {
    const result = extractFractionAndWhole('789');
    expect(result).to.deep.eq({ whole: '789', fraction: undefined });
  });

  it('should return undefined for both whole and fraction for an invalid number', () => {
    const result = extractFractionAndWhole('abc');
    expect(result).to.deep.eq({ whole: undefined });
  });
});
