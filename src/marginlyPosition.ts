import { BigNumber } from "ethers";
import {
  calcLongLeverage,
  calcLongLiquidationPriceX96,
  calcRealBaseCollateral,
  calcRealBaseDebt,
  calcRealQuoteCollateral,
  calcRealQuoteDebt,
  calcShortLeverage,
  calcShortLiquidationPriceX96,
  FP96_ONE,
  MarginlyCoeffs,
  mulFP96,
} from "./marginlyPoolMath";

export enum PositionType {
  Uninitialized,
  Lend,
  Short,
  Long,
}

export class MarginlyPosition {
  type: PositionType;
  heapPosition: BigNumber;
  baseAmount: BigNumber;
  quoteAmount: BigNumber;

  constructor(
    coeffs: MarginlyCoeffs,
    type: PositionType,
    heapPosition: BigNumber,
    discountedBaseAmount: BigNumber,
    discountedQuoteAmount: BigNumber
  ) {
    this.type = type;
    this.heapPosition = heapPosition;
    if (type == PositionType.Lend) {
      this.baseAmount = mulFP96(
        coeffs.baseCollateralCoeff,
        discountedBaseAmount
      );
      this.quoteAmount = mulFP96(
        coeffs.quoteCollateralCoeff,
        discountedQuoteAmount
      );
    } else if (type == PositionType.Short) {
      this.baseAmount = calcRealBaseCollateral(
        coeffs.baseCollateralCoeff,
        coeffs.baseDelevCoeff,
        discountedBaseAmount,
        discountedQuoteAmount
      );
      this.quoteAmount = calcRealQuoteDebt(
        coeffs.quoteDebtCoeff,
        discountedQuoteAmount
      );
    } else if (type == PositionType.Long) {
      this.baseAmount = calcRealBaseDebt(
        coeffs.baseDebtCoeff,
        discountedBaseAmount
      );
      this.quoteAmount = calcRealQuoteCollateral(
        coeffs.quoteCollateralCoeff,
        coeffs.quoteDelevCoeff,
        discountedQuoteAmount,
        discountedBaseAmount
      );
    } else {
      this.baseAmount = BigNumber.from(0);
      this.quoteAmount = BigNumber.from(0);
    }
  }

  public calcLeverage(basePriceX96: BigNumber): BigNumber | undefined {
    if (this.type == PositionType.Long) {
      return calcLongLeverage(this.baseAmount, this.quoteAmount, basePriceX96);
    } else if (this.type == PositionType.Short) {
      return calcShortLeverage(this.quoteAmount, this.baseAmount, basePriceX96);
    } else if (this.type == PositionType.Lend) {
      return BigNumber.from(1);
    } else {
      return undefined;
    }
  }

  public calcLiquidationPrice(maxLeverage: BigNumber): BigNumber | undefined {
    if (this.type == PositionType.Long) {
      return calcLongLiquidationPriceX96(
        this.baseAmount,
        this.quoteAmount,
        maxLeverage
      );
    } else if (this.type == PositionType.Short) {
      return calcShortLiquidationPriceX96(
        this.quoteAmount,
        this.baseAmount,
        maxLeverage
      );
    } else {
      return undefined;
    }
  }

  public baseWithdrawAvailable(
    basePriceX96: BigNumber,
    maxLeverage: BigNumber
  ): BigNumber {
    if (this.type == PositionType.Lend) {
      return this.baseAmount;
    } else if (this.type == PositionType.Long) {
      return this.baseAmount.sub(
        this.quoteAmount
          .mul(maxLeverage)
          .mul(FP96_ONE)
          .div(basePriceX96)
          .div(maxLeverage.sub(1))
      );
    } else {
      return BigNumber.from(0);
    }
  }

  public quoteWithdrawAvailable(
    basePriceX96: BigNumber,
    maxLeverage: BigNumber
  ): BigNumber {
    if (this.type == PositionType.Lend) {
      return this.quoteAmount;
    } else if (this.type == PositionType.Short) {
      return this.quoteAmount.sub(
        this.baseAmount
          .mul(maxLeverage)
          .mul(basePriceX96)
          .div(FP96_ONE)
          .div(maxLeverage.sub(1))
      );
    } else {
      return BigNumber.from(0);
    }
  }
}
