import { BigNumber, ethers } from "ethers";

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

export type ExecuteArgs = [
  number,
  BigNumber,
  BigNumber,
  BigNumber,
  boolean,
  string,
  BigNumber
];

export interface ExecuteParams {
  methodName: string;
  args: ExecuteArgs;
  value: BigNumber;
}

const EXECUTE_METHOD = "execute";

const ZERO = ethers.constants.Zero;
const SWAP_CALLDATA_DEFAULT = ZERO;

export abstract class MarginlyPoolExecute {
  private constructor() {}

  public static depositBase(
    depositAmount: BigNumber,
    isNativeEth: boolean | undefined
  ): ExecuteParams {
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

  public static depositQuote(
    depositAmount: BigNumber,
    isNativeEth: boolean | undefined
  ): ExecuteParams {
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

  public static withdrawBase(
    withdrawAmount: BigNumber,
    isNativeEth: boolean | undefined
  ): ExecuteParams {
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

  public static withdrawBaseAll(
    isNativeEth: boolean | undefined
  ): ExecuteParams {
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

  public static withdrawQuote(
    withdrawAmount: BigNumber,
    isNativeEth: boolean | undefined
  ): ExecuteParams {
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

  public static withdrawQuoteAll(
    isNativeEth: boolean | undefined
  ): ExecuteParams {
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
      args: [
        CallType.Long,
        longAmount,
        ZERO,
        limitPriceX96,
        false,
        ethers.constants.AddressZero,
        swapCalldata,
      ],
      value: ZERO,
    };
  }

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
      args: [
        CallType.Short,
        shortAmount,
        ZERO,
        limitPriceX96,
        false,
        ethers.constants.AddressZero,
        swapCalldata,
      ],
      value: ZERO,
    };
  }

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

  public static reinit(): ExecuteParams {
    return {
      methodName: EXECUTE_METHOD,
      args: [
        CallType.Reinit,
        ZERO,
        ZERO,
        ZERO,
        false,
        ethers.constants.AddressZero,
        SWAP_CALLDATA_DEFAULT,
      ],
      value: ZERO,
    };
  }

  public static reinitWithBalanceSync(): ExecuteParams {
    return {
      methodName: EXECUTE_METHOD,
      args: [
        CallType.Reinit,
        ZERO,
        ZERO,
        ZERO,
        true,
        ethers.constants.AddressZero,
        SWAP_CALLDATA_DEFAULT,
      ],
      value: ZERO,
    };
  }

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

  public static emergencyWithdraw(
    isNativeEth: boolean | undefined
  ): ExecuteParams {
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
