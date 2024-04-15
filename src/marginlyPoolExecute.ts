/** @module MarginlyPoolExecute generates `execute` parameters for desired actions */

import { BigNumber, ethers } from 'ethers';
import { defaultAbiCoder } from 'ethers/lib/utils';

import { EXECUTE_METHOD, EXECUTE_METHOD_ENCODED, SWAP_CALLDATA_DEFAULT, ZERO } from './consts';
import { convertPriceStringToX96, convertPriceX96ToHuman } from './marginlyPoolMath';
import { MarginlyPosition, PositionType } from '.';

/**
 * Enum with all calls performed via Marginly `execute` method
 */
export enum CallType {
  DepositBase,
  DepositQuote,
  WithdrawBase,
  WithdrawQuote,
  Short,
  Long,
  ClosePosition,
  Reinit,
  ReceivePosition,
  EmergencyWithdraw,
}

/**
 * Type of parameter for Marginly `execute` method.
 * @param CallType - type of {@link CallType | Call}.
 * @param BigNumber - `amount1`
 * @param BigNumber - `amount2`
 * @param BigNumber - `limitPriceX96`
 * @param boolean - `flag`
 * @param string - `receivePositionAddress`
 * @param BigNumber - `swapCalldata`
 */
export type ExecuteArgs = [CallType, BigNumber, BigNumber, BigNumber, boolean, string, BigNumber];
export type ExecuteArgsBigInt = [CallType, bigint, bigint, bigint, boolean, string, bigint];

export const EXECUTE_ARGS_ABI_DEFINITION = ['uint8', 'uint256', 'uint256', 'uint256', 'bool', 'address', 'uint256'];

export interface ExecuteParams {
  methodName: string;
  args: ExecuteArgs;
  value: BigNumber;
}
export interface ExecuteParamsBigInt {
  methodName: string;
  args: ExecuteArgsBigInt;
  value: bigint;
}

/**
 * @param depositAmount - amount of base tokens to be deposited
 * @param isNativeEth - if deposited token is native eth so it can be wrapped in process (false if undefined)
 * @returns method and parameters for Marginly `deposit base` call
 */
export function getDepositBaseArgs(depositAmount: BigNumber, isNativeEth: boolean | undefined): ExecuteParams {
  return {
    methodName: EXECUTE_METHOD,
    args: [CallType.DepositBase, depositAmount, ZERO, ZERO, false, ethers.constants.AddressZero, SWAP_CALLDATA_DEFAULT],
    value: isNativeEth ? depositAmount : ZERO,
  };
}

/**
 * @param depositAmount - amount of quote tokens to be deposited
 * @param isNativeEth - if deposited token is native eth so it can be wrapped in process (false if undefined)
 * @returns method and parameters for Marginly `deposit quote` call
 */
export function getDepositQuoteArgs(depositAmount: BigNumber, isNativeEth: boolean | undefined): ExecuteParams {
  return {
    methodName: EXECUTE_METHOD,
    args: [
      CallType.DepositQuote,
      depositAmount,
      ZERO,
      ZERO,
      false,
      ethers.constants.AddressZero,
      SWAP_CALLDATA_DEFAULT,
    ],
    value: isNativeEth ? depositAmount : ZERO,
  };
}

/**
 * @param withdrawAmount - amount of base tokens to be withdrawn
 * @param isNativeEth - if withdrawn token is native eth so it can be unwrapped in process (false if undefined)
 * @returns method and parameters for Marginly `withdraw base` call
 */
export function getWithdrawBaseArgs(withdrawAmount: BigNumber, isNativeEth: boolean | undefined): ExecuteParams {
  return {
    methodName: EXECUTE_METHOD,
    args: [
      CallType.WithdrawBase,
      withdrawAmount,
      ZERO,
      ZERO,
      !!isNativeEth,
      ethers.constants.AddressZero,
      SWAP_CALLDATA_DEFAULT,
    ],
    value: ZERO,
  };
}

/**
 * @remark withdraws all the base tokens from signer position
 * @param isNativeEth - if withdrawn token is native eth so it can be unwrapped in process (false if undefined)
 * @returns method and parameters for Marginly `withdraw base` call.
 */
export function getWithdrawBaseAllArgs(isNativeEth: boolean | undefined): ExecuteParams {
  return {
    methodName: EXECUTE_METHOD,
    args: [
      CallType.WithdrawBase,
      ethers.constants.MaxUint256,
      ZERO,
      ZERO,
      !!isNativeEth,
      ethers.constants.AddressZero,
      SWAP_CALLDATA_DEFAULT,
    ],
    value: ZERO,
  };
}

/**
 * @param withdrawAmount - amount of quote tokens to be withdrawn
 * @param isNativeEth - if withdrawn token is native eth so it can be unwrapped in process (false if undefined)
 * @returns method and parameters for Marginly `withdraw base` call
 */
export function getWithdrawQuoteArgs(withdrawAmount: BigNumber, isNativeEth: boolean | undefined): ExecuteParams {
  return {
    methodName: EXECUTE_METHOD,
    args: [
      CallType.WithdrawQuote,
      withdrawAmount,
      ZERO,
      ZERO,
      !!isNativeEth,
      ethers.constants.AddressZero,
      SWAP_CALLDATA_DEFAULT,
    ],
    value: ZERO,
  };
}

/**
 * @remark withdraws all the quote tokens from signer position
 * @param isNativeEth - if withdrawn token is native eth so it can be unwrapped in process (false if undefined)
 * @returns method and parameters for Marginly `withdraw quote` call.
 */
export function getWithdrawQuoteAllArgs(isNativeEth: boolean | undefined): ExecuteParams {
  return {
    methodName: EXECUTE_METHOD,
    args: [
      CallType.WithdrawQuote,
      ethers.constants.MaxUint256,
      ZERO,
      ZERO,
      !!isNativeEth,
      ethers.constants.AddressZero,
      SWAP_CALLDATA_DEFAULT,
    ],
    value: ZERO,
  };
}

/**
 * @param longAmount - long amount in base tokens
 * @param limitPriceX96 - highest acceptable swap price in X96 format
 * @param swapCalldata - calldata for Marginly router (swaps on default DEX if undefined)
 * @returns method and parameters for Marginly `long` call.
 */
export function getLongArgs(
  longAmount: BigNumber,
  limitPriceX96: BigNumber,
  swapCalldata: BigNumber | undefined
): ExecuteParams {
  if (swapCalldata === undefined) {
    swapCalldata = SWAP_CALLDATA_DEFAULT;
  }

  return {
    methodName: EXECUTE_METHOD,
    args: [CallType.Long, longAmount, ZERO, limitPriceX96, false, ethers.constants.AddressZero, swapCalldata],
    value: ZERO,
  };
}

/**
 * @param depositAmount - amount of base tokens to be deposited
 * @param longAmount - long amount in base tokens
 * @param limitPriceX96 - highest acceptable swap price in X96 format
 * @param swapCalldata - calldata for Marginly router (swaps on default DEX if undefined)
 * @param isNativeEth - if deposited token is native eth so it can be wrapped in process (false if undefined)
 * @returns method and parameters for Marginly `deposit base and long` combined call.
 */
export function getDepositBaseAndLongArgs(
  depositAmount: BigNumber,
  longAmount: BigNumber,
  limitPriceX96: BigNumber,
  swapCalldata: BigNumber | undefined,
  isNativeEth: boolean | undefined
): ExecuteParams {
  if (swapCalldata === undefined) {
    swapCalldata = SWAP_CALLDATA_DEFAULT;
  }

  return {
    methodName: EXECUTE_METHOD,
    args: [
      CallType.DepositBase,
      depositAmount,
      longAmount,
      limitPriceX96,
      !!isNativeEth,
      ethers.constants.AddressZero,
      swapCalldata,
    ],
    value: isNativeEth ? depositAmount : ZERO,
  };
}

/**
 * @param shortAmount - short amount in base tokens
 * @param limitPriceX96 - lowest acceptable swap price in X96 format
 * @param swapCalldata - calldata for Marginly router (swaps on default DEX if undefined)
 * @returns method and parameters for Marginly `short` call.
 */
export function getShortArgs(
  shortAmount: BigNumber,
  limitPriceX96: BigNumber,
  swapCalldata: BigNumber | undefined
): ExecuteParams {
  if (swapCalldata === undefined) {
    swapCalldata = SWAP_CALLDATA_DEFAULT;
  }

  return {
    methodName: EXECUTE_METHOD,
    args: [CallType.Short, shortAmount, ZERO, limitPriceX96, false, ethers.constants.AddressZero, swapCalldata],
    value: ZERO,
  };
}

/**
 * @param depositAmount - amount of quote tokens to be deposited
 * @param shortAmount - short amount in base tokens
 * @param limitPriceX96 - lowest acceptable swap price in X96 format
 * @param swapCalldata - calldata for Marginly router (swaps on default DEX if undefined)
 * @param isNativeEth - if deposited token is native eth so it can be wrapped in process (false if undefined)
 * @returns method and parameters for Marginly `deposit quote and short` combined call.
 */
export function getDepositQuoteAndShortArgs(
  depositAmount: BigNumber,
  shortAmount: BigNumber,
  limitPriceX96: BigNumber,
  swapCalldata: BigNumber | undefined,
  isNativeEth: boolean | undefined
): ExecuteParams {
  if (swapCalldata === undefined) {
    swapCalldata = SWAP_CALLDATA_DEFAULT;
  }

  return {
    methodName: EXECUTE_METHOD,
    args: [
      CallType.DepositQuote,
      depositAmount,
      shortAmount,
      limitPriceX96,
      !!isNativeEth,
      ethers.constants.AddressZero,
      swapCalldata,
    ],
    value: isNativeEth ? depositAmount : ZERO,
  };
}

/**
 * @param limitPriceX96 - worst acceptable swap price in X96 format
 * @param swapCalldata - calldata for Marginly router (swaps on default DEX if undefined)
 * @param isNativeEth - if deposited token is native eth so it can be wrapped in process (false if undefined)
 * @returns method and parameters for Marginly `close position` call.
 */
export function getClosePositionArgs(
  limitPriceX96: BigNumber,
  swapCalldata: BigNumber | undefined,
  isNativeEth: boolean | undefined
): ExecuteParams {
  if (swapCalldata === undefined) {
    swapCalldata = SWAP_CALLDATA_DEFAULT;
  }

  return {
    methodName: EXECUTE_METHOD,
    args: [
      CallType.ClosePosition,
      ZERO,
      ZERO,
      limitPriceX96,
      !!isNativeEth,
      ethers.constants.AddressZero,
      swapCalldata,
    ],
    value: ZERO,
  };
}

/**
 * @returns method and parameters for Marginly `reinit` call.
 */
export function getReinitArgs(): ExecuteParams {
  return {
    methodName: EXECUTE_METHOD,
    args: [CallType.Reinit, ZERO, ZERO, ZERO, false, ethers.constants.AddressZero, SWAP_CALLDATA_DEFAULT],
    value: ZERO,
  };
}

/**
 * @returns method and parameters for Marginly `reinit with balance sync` call.
 */
export function getReinitWithBalanceSyncArgs(): ExecuteParams {
  return {
    methodName: EXECUTE_METHOD,
    args: [CallType.Reinit, ZERO, ZERO, ZERO, true, ethers.constants.AddressZero, SWAP_CALLDATA_DEFAULT],
    value: ZERO,
  };
}

/**
 * @param positionAddress - address of position with bad leverage
 * @param depositAmountBase - amount of base token to deposit
 * @param depositAmountQuote - amount of quote token to deposit
 * @returns method and parameters for Marginly `receive position` call.
 */
export function getReceivePositionArgs(
  positionAddress: string,
  depositAmountBase: BigNumber,
  depositAmountQuote: BigNumber
): ExecuteParams {
  return {
    methodName: EXECUTE_METHOD,
    args: [
      CallType.ReceivePosition,
      depositAmountBase,
      depositAmountQuote,
      ZERO,
      false,
      positionAddress,
      SWAP_CALLDATA_DEFAULT,
    ],
    value: ZERO,
  };
}

/**
 * @param isNativeEth - if withdrawn token is native eth so it can be unwrapped in process (false if undefined)
 * @returns method and parameters for Marginly `emergency withdraw` call.
 */
export function getEmergencyWithdrawArgs(isNativeEth: boolean | undefined): ExecuteParams {
  return {
    methodName: EXECUTE_METHOD,
    args: [
      CallType.EmergencyWithdraw,
      ZERO,
      ZERO,
      ZERO,
      !!isNativeEth,
      ethers.constants.AddressZero,
      SWAP_CALLDATA_DEFAULT,
    ],
    value: ZERO,
  };
}

const addFunctionCalldata = (s: string) => EXECUTE_METHOD_ENCODED.concat(s.replace(/^0x/, ''));

export function getCalldata(args: ExecuteParams) {
  return { ...args, calldata: addFunctionCalldata(defaultAbiCoder.encode(EXECUTE_ARGS_ABI_DEFINITION, args.args)) };
}

const isValidAmount = (x: string | undefined) => !!x && Number.isFinite(+x) && +x > 0;

const getLeveragedAmount = (amount: string, direction: 'long' | 'short', leverage: number, basePrice: number) =>
  direction === 'long' ? +amount * (leverage - 1) : (+amount * (leverage - 1)) / basePrice;

type CommonParams = {
  direction: 'long' | 'short';
  slippageTolerancePercentage: number;
  basePriceX96: bigint;
  baseDecimals: number;
  quoteDecimals: number;
  isDepositingNativeToken: boolean;
  swapCalldata: bigint;
};

export function castParamsToBigInt({
  methodName,
  args: [ct, bn1, bn2, bn3, b, s, bn4],
  value,
}: ExecuteParams): ExecuteParamsBigInt {
  return {
    methodName,
    args: [ct, bn1.toBigInt(), bn2.toBigInt(), bn3.toBigInt(), b, s, bn4.toBigInt()],
    value: value.toBigInt(),
  };
}

export function getActionArgs(
  props:
    | ({
        type: 'depositAndOpenPosition';
        depositAmount: string;
        leverage: number;
      } & CommonParams)
    | ({
        type: 'close';
      } & CommonParams)
): ExecuteParamsBigInt | undefined {
  const {
    type,
    direction,
    slippageTolerancePercentage,
    basePriceX96,
    baseDecimals,
    quoteDecimals,
    isDepositingNativeToken,
    swapCalldata,
  } = props;
  if (type === 'depositAndOpenPosition' && !isValidAmount(props.depositAmount)) return undefined;

  const basePrice = convertPriceX96ToHuman(
    BigNumber.from(basePriceX96),
    BigNumber.from(baseDecimals),
    BigNumber.from(quoteDecimals)
  ).toNumber();

  const depositTokenDecimals = direction === 'long' ? baseDecimals : quoteDecimals;
  const leveragedAmount =
    type === 'depositAndOpenPosition'
      ? getLeveragedAmount(props.depositAmount, direction, props.leverage, basePrice)
      : undefined;
  const leveragedAmountBn = leveragedAmount
    ? ethers.utils.parseUnits(leveragedAmount.toFixed(depositTokenDecimals), depositTokenDecimals)
    : undefined;

  const limitPrice =
    (type === 'depositAndOpenPosition' && direction === 'short') || (type === 'close' && direction === 'long')
      ? basePrice * ((100 - slippageTolerancePercentage) / 100)
      : basePrice * ((100 + slippageTolerancePercentage) / 100);

  const openMethod = direction === 'long' ? getDepositBaseAndLongArgs : getDepositQuoteAndShortArgs;

  const amountBn =
    type === 'depositAndOpenPosition'
      ? ethers.utils.parseUnits(props.depositAmount || '0', depositTokenDecimals)
      : undefined;
  const limitPriceX96 = convertPriceStringToX96(
    limitPrice.toString(),
    BigNumber.from(baseDecimals),
    BigNumber.from(quoteDecimals)
  );

  const params =
    type === 'depositAndOpenPosition' && amountBn && leveragedAmountBn
      ? openMethod(amountBn, leveragedAmountBn, limitPriceX96, BigNumber.from(swapCalldata), isDepositingNativeToken)
      : getClosePositionArgs(limitPriceX96, BigNumber.from(swapCalldata), isDepositingNativeToken);
  return castParamsToBigInt(params);
}

export function getWithdrawAllArgs(
  pos: MarginlyPosition | undefined,
  isBaseNative: boolean,
  isQuoteNative: boolean
): ExecuteParamsBigInt | undefined {
  if (!pos || pos.type !== PositionType.Lend) return undefined;

  const isWithdrawingBase = pos.baseAmount.gt(0);
  const params = isWithdrawingBase ? getWithdrawBaseAllArgs(isBaseNative) : getWithdrawQuoteAllArgs(isQuoteNative);
  return castParamsToBigInt(params);
}
