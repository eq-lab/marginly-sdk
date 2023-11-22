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
  MarginlyCoeffs,
  mulFP96,
} from "./marginlyPoolMath";
import { FP96_ONE } from "./consts";

/** Enum with position type in Marginly */
export enum PositionType {
  Uninitialized,
  Lend,
  Short,
  Long,
}

/** Marginly pool position */
export class MarginlyPosition {
  /** @field position type */
  public type: PositionType

  /** @field absolute value of position base tokens amount */
  public baseAmount: BigNumber;

  /** @field absolute value of position quote tokens amount */
  public quoteAmount: BigNumber;

  constructor(
    coeffs: MarginlyCoeffs,
    type: PositionType,
    discountedBaseAmount: BigNumber,
    discountedQuoteAmount: BigNumber
  ) {
    this.type = type;
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

  /** 
   * @param basePriceX96 base to quote price in X96 to calculate leverage with
   * @returns position leverage (undefined if position is `Uninitialized`)
   */
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

  /** 
   * @param maxLeverage critical leverage
   * @returns position liquidation price (undefined if position is `Uninitialized` or `Lend`)
   */
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

  /** 
   * @returns available for withdrawal amount of base tokens
   */
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

   /** 
   * @returns available for withdrawal amount of quote tokens
   */
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
