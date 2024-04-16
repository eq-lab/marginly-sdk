/** @module MarginlyPoolMath Marginly underlying math ts implementation */

import { BigNumber } from 'ethers';
import { FP96_ONE } from './consts';

/**
 * Coefficients used in Marginly for interest rate and deleverage calculations
 * @remark all the values are in X96 format
 */
export interface MarginlyCoeffs {
  baseCollateralCoeff: BigNumber;
  quoteCollateralCoeff: BigNumber;
  baseDelevCoeff: BigNumber;
  quoteDelevCoeff: BigNumber;
  baseDebtCoeff: BigNumber;
  quoteDebtCoeff: BigNumber;
}

export interface MarginlyCoeffsBigInt {
  baseCollateralCoeff: bigint;
  quoteCollateralCoeff: bigint;
  baseDelevCoeff: bigint;
  quoteDelevCoeff: bigint;
  baseDebtCoeff: bigint;
  quoteDebtCoeff: bigint;
}

/** @returns multiplication result with at least one of the multipliers in X96 format */
export function mulFP96(multiplier: BigNumber, multiplicand: BigNumber): BigNumber {
  return multiplier.mul(multiplicand).div(FP96_ONE);
}

/**
 * @param denominator must be in X96 format
 * @returns division by X96 number result
 */
export function divFP96(numerator: BigNumber, denominator: BigNumber): BigNumber {
  return numerator.mul(FP96_ONE).div(denominator);
}

/**
 * @param baseCollateralCoeffX96 base collateral coefficient in X96 format
 * @param baseDelevCoeffX96 base deleverage coefficient in X96 format
 * @returns real base collateral from provided coefficients and discounted values
 */
export function calcRealBaseCollateral(
  baseCollateralCoeffX96: BigNumber,
  baseDelevCoeffX96: BigNumber,
  discountedBaseCollateral: BigNumber,
  discountedQuoteDebt: BigNumber
): BigNumber {
  return mulFP96(baseCollateralCoeffX96, discountedBaseCollateral).sub(mulFP96(baseDelevCoeffX96, discountedQuoteDebt));
}

/**
 * @param quoteCollateralCoeffX96 base collateral coefficient in X96 format
 * @param quoteDelevCoeffX96 base deleverage coefficient in X96 format
 * @returns real quote collateral from provided coefficients and discounted values
 */
export function calcRealQuoteCollateral(
  quoteCollateralCoeffX96: BigNumber,
  quoteDelevCoeffX96: BigNumber,
  discountedQuoteCollateral: BigNumber,
  discountedBaseDebt: BigNumber
): BigNumber {
  return mulFP96(quoteCollateralCoeffX96, discountedQuoteCollateral).sub(
    mulFP96(quoteDelevCoeffX96, discountedBaseDebt)
  );
}

/**
 * @param baseDebtCoeffX96 base debt coefficient in X96 format
 * @returns real base debt from provided coefficients and discounted values
 */
export function calcRealBaseDebt(baseDebtCoeffX96: BigNumber, discountedBaseDebt: BigNumber): BigNumber {
  return mulFP96(baseDebtCoeffX96, discountedBaseDebt);
}

/**
 * @param baseDebtCoeffX96 base debt coefficient in X96 format
 * @returns real quote debt from provided coefficients and discounted values
 */
export function calcRealQuoteDebt(quoteDebtCoeffX96: BigNumber, discountedQuoteDebt: BigNumber): BigNumber {
  return mulFP96(quoteDebtCoeffX96, discountedQuoteDebt);
}

/**
 * @param realBaseCollateral long position base collateral
 * @param realQuoteDebt long position quote debt
 * @param basePriceX96 base to quote price in X96 format to calculate leverage with
 * @returns leverage of long position
 */
export function calcLongLeverage(
  realBaseCollateral: BigNumber,
  realQuoteDebt: BigNumber,
  basePriceX96: BigNumber
): BigNumber {
  const collateralInQuote = mulFP96(realBaseCollateral, basePriceX96);
  return collateralInQuote.div(collateralInQuote.sub(realQuoteDebt));
}

/**
 * @param realQuoteCollateral short position quote collateral
 * @param realBaseDebt short position base debt
 * @param basePriceX96 base to quote price in X96 format to calculate leverage with
 * @returns leverage of short position
 */
export function calcShortLeverage(
  realQuoteCollateral: BigNumber,
  realBaseDebt: BigNumber,
  basePriceX96: BigNumber
): BigNumber {
  const debtInQuote = mulFP96(realBaseDebt, basePriceX96);
  return realQuoteCollateral.div(realQuoteCollateral.sub(debtInQuote));
}

/**
 * @returns liquidation price of long position
 * @param realBaseCollateral long position base collateral
 * @param realQuoteDebt long position quote debt
 * @param maxLeverage critical leverage at which liquidation takes place
 */
export function calcLongLiquidationPriceX96(
  realBaseCollateral: BigNumber,
  realQuoteDebt: BigNumber,
  maxLeverage: BigNumber
): BigNumber {
  return divFP96(maxLeverage.mul(realQuoteDebt), maxLeverage.sub(1).mul(realBaseCollateral));
}

/**
 * @returns liquidation price of short position
 * @param realQuoteCollateral short position quote collateral
 * @param realBaseDebt short position base debt
 * @param maxLeverage critical leverage at which liquidation takes place
 */
export function calcShortLiquidationPriceX96(
  realQuoteCollateral: BigNumber,
  realBaseDebt: BigNumber,
  maxLeverage: BigNumber
): BigNumber {
  return divFP96(maxLeverage.sub(1).mul(realQuoteCollateral), maxLeverage.mul(realBaseDebt));
}

/**
 * @param priceX96 price in X96 to convert
 * @param baseDecimal decimals of base token
 * @param quoteDecimal decimals of quote token
 * @returns human readable representation of price
 */
export function convertPriceX96ToHuman(
  priceX96: BigNumber,
  baseDecimal: BigNumber,
  quoteDecimal: BigNumber
): BigNumber {
  const power = baseDecimal.sub(quoteDecimal);
  return priceX96.mul(BigNumber.from(10).pow(power)).div(FP96_ONE);
}

/**
 * @param priceX price in human readable form to convert
 * @param baseDecimal decimals of base token
 * @param quoteDecimal decimals of quote token
 * @returns X96 representation of price
 */
export function convertPriceHumanToX96(price: BigNumber, baseDecimal: BigNumber, quoteDecimal: BigNumber): BigNumber {
  const power = baseDecimal.sub(quoteDecimal);
  return price.mul(FP96_ONE).div(BigNumber.from(10).pow(power));
}

export const isValidNumber = (s: string): boolean => /^[+-]?\d*\.?\d+$/.test(s);

export function extractFractionAndWhole(
  s: string,
  maxDecimals: number = 18
): { whole: string | undefined; fraction?: string } {
  if (!isValidNumber(s)) return { whole: undefined };

  const parts = s.split('.');
  const whole = parts[0];
  const fraction = parts[1]?.slice(0, maxDecimals);
  return { whole, fraction };
}

/**
 * @param priceX price in human readable form to convert
 * @param baseDecimal decimals of base token
 * @param quoteDecimal decimals of quote token
 * @returns X96 representation of price
 */
export function convertPriceStringToX96(price: string, baseDecimal: BigNumber, quoteDecimal: BigNumber): BigNumber {
  const { whole, fraction } = extractFractionAndWhole(price);

  const priceNext = BigNumber.from(`${whole}${fraction ?? ''}`);

  const power = baseDecimal.sub(quoteDecimal).add(fraction?.length ?? 0);

  return priceNext.mul(FP96_ONE).div(BigNumber.from(10).pow(power));
}
