import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { FP96_ONE, ZERO } from './consts';
import {
  calcRealBaseCollateral,
  calcRealQuoteCollateral,
  convertPriceHumanToX96,
  convertPriceX96ToHuman,
  MarginlyCoeffs,
  mulFP96,
} from './marginlyPoolMath';
import { MarginlyPosition, PositionType } from './marginlyPosition';

const TEST_COEFFS: MarginlyCoeffs = {
  baseCollateralCoeff: FP96_ONE,
  quoteCollateralCoeff: FP96_ONE.mul(2),
  baseDelevCoeff: FP96_ONE.div(4),
  quoteDelevCoeff: FP96_ONE.div(2),
  baseDebtCoeff: FP96_ONE.mul(4),
  quoteDebtCoeff: FP96_ONE.mul(8),
};

const TEST_COEFFS_ONES: MarginlyCoeffs = {
  baseCollateralCoeff: FP96_ONE,
  quoteCollateralCoeff: FP96_ONE,
  baseDelevCoeff: ZERO,
  quoteDelevCoeff: ZERO,
  baseDebtCoeff: FP96_ONE,
  quoteDebtCoeff: FP96_ONE,
};

describe('Position creation', () => {
  it('Create lend position', async () => {
    const disBaseAmount = BigNumber.from(12);
    const disQuoteAmount = BigNumber.from(16);
    const position = new MarginlyPosition(TEST_COEFFS, PositionType.Lend, disBaseAmount, disQuoteAmount);

    expect(position.type).to.be.eq(PositionType.Lend);
    expect(position.baseAmount.toBigInt()).to.be.eq(mulFP96(TEST_COEFFS.baseCollateralCoeff, disBaseAmount).toBigInt());
    expect(position.quoteAmount.toBigInt()).to.be.eq(
      mulFP96(TEST_COEFFS.quoteCollateralCoeff, disQuoteAmount).toBigInt()
    );
  });

  it('Create long position', async () => {
    const disBaseAmount = BigNumber.from(12);
    const disQuoteAmount = BigNumber.from(16);
    const position = new MarginlyPosition(TEST_COEFFS, PositionType.Long, disBaseAmount, disQuoteAmount);

    expect(position.type).to.be.eq(PositionType.Long);
    expect(position.baseAmount.toBigInt()).to.be.eq(
      calcRealBaseCollateral(
        TEST_COEFFS.baseCollateralCoeff,
        TEST_COEFFS.baseDelevCoeff,
        disBaseAmount,
        disQuoteAmount
      ).toBigInt()
    );
    expect(position.quoteAmount.toBigInt()).to.be.eq(mulFP96(TEST_COEFFS.quoteDebtCoeff, disQuoteAmount).toBigInt());
  });

  it('Create short position', async () => {
    const disBaseAmount = BigNumber.from(12);
    const disQuoteAmount = BigNumber.from(16);
    const position = new MarginlyPosition(TEST_COEFFS, PositionType.Short, disBaseAmount, disQuoteAmount);

    expect(position.type).to.be.eq(PositionType.Short);
    expect(position.baseAmount.toBigInt()).to.be.eq(mulFP96(TEST_COEFFS.baseDebtCoeff, disBaseAmount).toBigInt());
    expect(position.quoteAmount.toBigInt()).to.be.eq(
      calcRealQuoteCollateral(
        TEST_COEFFS.quoteCollateralCoeff,
        TEST_COEFFS.quoteDelevCoeff,
        disQuoteAmount,
        disBaseAmount
      ).toBigInt()
    );
  });
});

describe('Position calc leverage', () => {
  it('Calc uninitialized leverage', async () => {
    const position = new MarginlyPosition(
      TEST_COEFFS_ONES,
      PositionType.Uninitialized,
      BigNumber.from(3),
      BigNumber.from(6000)
    );
    const priceX96 = FP96_ONE.mul(1000);
    const leverage = position.calcLeverage(priceX96);
    expect(leverage).to.be.undefined;
  });

  it('Calc lend leverage', async () => {
    const position = new MarginlyPosition(TEST_COEFFS_ONES, PositionType.Lend, BigNumber.from(1), BigNumber.from(1000));
    const priceX96 = FP96_ONE.mul(1000);
    const leverage = position.calcLeverage(priceX96);
    expect(leverage).to.be.not.undefined;
    expect(leverage!.toBigInt()).to.be.eq(1n);
  });

  it('Calc long leverage', async () => {
    const position = new MarginlyPosition(TEST_COEFFS_ONES, PositionType.Long, BigNumber.from(6), BigNumber.from(3000));
    const priceX96 = FP96_ONE.mul(1000);
    const leverage = position.calcLeverage(priceX96);
    expect(leverage).to.be.not.undefined;
    expect(leverage!.toBigInt()).to.be.eq(2n);
  });

  it('Calc short leverage', async () => {
    const position = new MarginlyPosition(
      TEST_COEFFS_ONES,
      PositionType.Short,
      BigNumber.from(3),
      BigNumber.from(6000)
    );
    const priceX96 = FP96_ONE.mul(1000);
    const leverage = position.calcLeverage(priceX96);
    expect(leverage).to.be.not.undefined;
    expect(leverage!.toBigInt()).to.be.eq(2n);
  });
});

describe('Position liquidation price', () => {
  it('Calc uninitialized liquidation price', async () => {
    const position = new MarginlyPosition(
      TEST_COEFFS_ONES,
      PositionType.Uninitialized,
      BigNumber.from(3),
      BigNumber.from(6000)
    );
    const maxLeverage = BigNumber.from(2);
    const liquidationPrice = position.calcLiquidationPrice(maxLeverage);
    expect(liquidationPrice).to.be.undefined;
  });

  it('Calc lend liquidation price', async () => {
    const position = new MarginlyPosition(TEST_COEFFS_ONES, PositionType.Lend, BigNumber.from(1), BigNumber.from(1000));
    const maxLeverage = BigNumber.from(2);
    const liquidationPrice = position.calcLiquidationPrice(maxLeverage);
    expect(liquidationPrice).to.be.undefined;
  });

  it('Calc long liquidation price', async () => {
    const position = new MarginlyPosition(TEST_COEFFS_ONES, PositionType.Long, BigNumber.from(6), BigNumber.from(3000));
    const maxLeverage = BigNumber.from(2);
    const liquidationPrice = position.calcLiquidationPrice(maxLeverage);
    expect(liquidationPrice).to.be.not.undefined;
    expect(convertPriceX96ToHuman(liquidationPrice!, ZERO, ZERO).toBigInt()).to.be.eq(1000n);
  });

  it('Calc short liquidation price', async () => {
    const position = new MarginlyPosition(
      TEST_COEFFS_ONES,
      PositionType.Short,
      BigNumber.from(3),
      BigNumber.from(6000)
    );
    const maxLeverage = BigNumber.from(2);
    const liquidationPrice = position.calcLiquidationPrice(maxLeverage);
    expect(liquidationPrice).to.be.not.undefined;
    expect(convertPriceX96ToHuman(liquidationPrice!, ZERO, ZERO).toBigInt()).to.be.eq(1000n);
  });
});

describe('Position base withdraw available', () => {
  it('Calc uninitialized base withdraw available', async () => {
    const position = new MarginlyPosition(
      TEST_COEFFS_ONES,
      PositionType.Uninitialized,
      BigNumber.from(3),
      BigNumber.from(6000)
    );
    const priceX96 = FP96_ONE.mul(1000);
    const maxLeverage = BigNumber.from(2);
    const baseWithdrawAvailable = position.baseWithdrawAvailable(priceX96, maxLeverage).toBigInt();
    expect(baseWithdrawAvailable).to.be.eq(0n);
  });

  it('Calc lend base withdraw available', async () => {
    const position = new MarginlyPosition(TEST_COEFFS_ONES, PositionType.Lend, BigNumber.from(1), BigNumber.from(1000));
    const priceX96 = FP96_ONE.mul(1000);
    const maxLeverage = BigNumber.from(2);
    const baseWithdrawAvailable = position.baseWithdrawAvailable(priceX96, maxLeverage).toBigInt();
    expect(baseWithdrawAvailable).to.be.eq(position.baseAmount.toBigInt());
  });

  it('Calc long base withdraw available', async () => {
    const position = new MarginlyPosition(TEST_COEFFS_ONES, PositionType.Long, BigNumber.from(7), BigNumber.from(3000));
    const priceX96 = FP96_ONE.mul(1000);
    const maxLeverage = BigNumber.from(2);
    const baseWithdrawAvailable = position.baseWithdrawAvailable(priceX96, maxLeverage).toBigInt();
    expect(baseWithdrawAvailable).to.be.eq(1n);
  });

  it('Calc short base withdraw available', async () => {
    const position = new MarginlyPosition(
      TEST_COEFFS_ONES,
      PositionType.Short,
      BigNumber.from(3),
      BigNumber.from(6000)
    );
    const priceX96 = FP96_ONE.mul(1000);
    const maxLeverage = BigNumber.from(2);
    const baseWithdrawAvailable = position.baseWithdrawAvailable(priceX96, maxLeverage).toBigInt();
    expect(baseWithdrawAvailable).to.be.eq(0n);
  });
});

describe('Position quote withdraw available', () => {
  it('Calc uninitialized quote withdraw available', async () => {
    const position = new MarginlyPosition(
      TEST_COEFFS_ONES,
      PositionType.Uninitialized,
      BigNumber.from(3),
      BigNumber.from(6000)
    );
    const priceX96 = FP96_ONE.mul(1000);
    const maxLeverage = BigNumber.from(2);
    const quoteWithdrawAvailable = position.quoteWithdrawAvailable(priceX96, maxLeverage).toBigInt();
    expect(quoteWithdrawAvailable).to.be.eq(0n);
  });

  it('Calc lend quote withdraw available', async () => {
    const position = new MarginlyPosition(TEST_COEFFS_ONES, PositionType.Lend, BigNumber.from(1), BigNumber.from(1000));
    const priceX96 = FP96_ONE.mul(1000);
    const maxLeverage = BigNumber.from(2);
    const quoteWithdrawAvailable = position.quoteWithdrawAvailable(priceX96, maxLeverage).toBigInt();
    expect(quoteWithdrawAvailable).to.be.eq(position.quoteAmount.toBigInt());
  });

  it('Calc long quote withdraw available', async () => {
    const position = new MarginlyPosition(TEST_COEFFS_ONES, PositionType.Long, BigNumber.from(6), BigNumber.from(3000));
    const priceX96 = FP96_ONE.mul(1000);
    const maxLeverage = BigNumber.from(2);
    const quoteWithdrawAvailable = position.quoteWithdrawAvailable(priceX96, maxLeverage).toBigInt();
    expect(quoteWithdrawAvailable).to.be.eq(0n);
  });

  it('Calc short quote withdraw available', async () => {
    const position = new MarginlyPosition(
      TEST_COEFFS_ONES,
      PositionType.Short,
      BigNumber.from(3),
      BigNumber.from(7000)
    );
    const priceX96 = FP96_ONE.mul(1000);
    const maxLeverage = BigNumber.from(2);
    const quoteWithdrawAvailable = position.quoteWithdrawAvailable(priceX96, maxLeverage).toBigInt();
    expect(quoteWithdrawAvailable).to.be.eq(1000n);
  });
});
