import { BigNumber } from "ethers";

export const FP96_ONE = BigNumber.from(1n << 96n);

export function mulFP96(
  multiplier: BigNumber,
  multiplicand: BigNumber
): BigNumber {
  return multiplier.mul(multiplicand).div(FP96_ONE);
}

export function divFP96(
  numerator: BigNumber,
  denominator: BigNumber
): BigNumber {
  return numerator.mul(FP96_ONE).div(denominator);
}

export function calcRealBaseCollateral(
  baseCollateralCoeffX96: BigNumber,
  baseDelevCoeffX96: BigNumber,
  discountedBaseCollateral: BigNumber,
  discountedQuoteDebt: BigNumber
): BigNumber {
  return mulFP96(baseCollateralCoeffX96, discountedBaseCollateral).sub(
    mulFP96(baseDelevCoeffX96, discountedQuoteDebt)
  );
}

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

export function calcRealBaseDebt(
  baseDebtCoeffX96: BigNumber,
  discountedBaseDebt: BigNumber
): BigNumber {
  return mulFP96(baseDebtCoeffX96, discountedBaseDebt);
}

export function calcRealQuoteDebt(
  quoteDebtCoeffX96: BigNumber,
  discountedQuoteDebt: BigNumber
): BigNumber {
  return mulFP96(quoteDebtCoeffX96, discountedQuoteDebt);
}

export function calcLongLeverage(
  realBaseCollateral: BigNumber,
  realQuoteDebt: BigNumber,
  basePriceX96: BigNumber
): BigNumber {
  const collateralInQuote = mulFP96(realBaseCollateral, basePriceX96);
  return collateralInQuote.div(collateralInQuote.sub(realQuoteDebt));
}

export function calcShortLeverage(
  realQuoteCollateral: BigNumber,
  realBaseDebt: BigNumber,
  basePriceX96: BigNumber
): BigNumber {
  const debtInQuote = mulFP96(realBaseDebt, basePriceX96);
  return realQuoteCollateral.div(realQuoteCollateral.sub(debtInQuote));
}

export function calcLongLiquidationPriceX96(
  realBaseCollateral: BigNumber,
  realQuoteDebt: BigNumber,
  maxLeverage: BigNumber
): BigNumber {
  return divFP96(
    maxLeverage.mul(realQuoteDebt),
    maxLeverage.sub(1).mul(realBaseCollateral)
  );
}

export function calcShortLiquidationPriceX96(
  realQuoteCollateral: BigNumber,
  realBaseDebt: BigNumber,
  maxLeverage: BigNumber
): BigNumber {
  return divFP96(
    maxLeverage.sub(1).mul(realQuoteCollateral),
    maxLeverage.mul(realBaseDebt)
  );
}

export function convertPriceX96ToHuman(
  priceX96: BigNumber,
  baseDecimal: BigNumber,
  quoteDecimal: BigNumber
): BigNumber {
  const power = baseDecimal.sub(quoteDecimal);
  return priceX96.mul(BigNumber.from(10).pow(power)).div(FP96_ONE);
}

export function convertPriceHumanToX96(
  price: BigNumber,
  baseDecimal: BigNumber,
  quoteDecimal: BigNumber
): BigNumber {
  const power = baseDecimal.sub(quoteDecimal);
  return price.mul(FP96_ONE).mul(BigNumber.from(10).pow(power));
}


