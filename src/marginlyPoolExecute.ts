/** @module MarginlyPoolExecute generates `execute` parameters for desired actions */

import { BigNumber, ethers } from 'ethers';
import { EXECUTE_METHOD, SWAP_CALLDATA_DEFAULT, ZERO } from './consts';

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

export interface ExecuteParams {
  methodName: string;
  args: ExecuteArgs;
  value: BigNumber;
}

export abstract class MarginlyPoolExecute {
  private constructor() {}

  /**
   * @param depositAmount - amount of base tokens to be deposited
   * @param isNativeEth - if deposited token is native eth so it can be wrapped in process (false if undefined)
   * @returns method and parameters for Marginly `deposit base` call
   */
  public static depositBase(depositAmount: BigNumber, isNativeEth: boolean | undefined): ExecuteParams {
    return {
      methodName: EXECUTE_METHOD,
      args: [
        CallType.DepositBase,
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
   * @param depositAmount - amount of quote tokens to be deposited
   * @param isNativeEth - if deposited token is native eth so it can be wrapped in process (false if undefined)
   * @returns method and parameters for Marginly `deposit quote` call
   */
  public static depositQuote(depositAmount: BigNumber, isNativeEth: boolean | undefined): ExecuteParams {
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
  public static withdrawBase(withdrawAmount: BigNumber, isNativeEth: boolean | undefined): ExecuteParams {
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
  public static withdrawBaseAll(isNativeEth: boolean | undefined): ExecuteParams {
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
  public static withdrawQuote(withdrawAmount: BigNumber, isNativeEth: boolean | undefined): ExecuteParams {
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
  public static withdrawQuoteAll(isNativeEth: boolean | undefined): ExecuteParams {
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
  public static long(
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
  public static depositBaseAndLong(
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
        false,
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
  public static short(
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
  public static depositQuoteAndShort(
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
  public static closePosition(
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
  public static reinit(): ExecuteParams {
    return {
      methodName: EXECUTE_METHOD,
      args: [CallType.Reinit, ZERO, ZERO, ZERO, false, ethers.constants.AddressZero, SWAP_CALLDATA_DEFAULT],
      value: ZERO,
    };
  }

  /**
   * @returns method and parameters for Marginly `reinit with balance sync` call.
   */
  public static reinitWithBalanceSync(): ExecuteParams {
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
  public static receivePosition(
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
  public static emergencyWithdraw(isNativeEth: boolean | undefined): ExecuteParams {
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
}
