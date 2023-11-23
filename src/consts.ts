import { BigNumber, ethers } from 'ethers';

/** Name of main Marginly method */
export const EXECUTE_METHOD = 'execute';

/** X96 representation of 1 */
export const FP96_ONE = BigNumber.from(1n << 96n);

export const ZERO = ethers.constants.Zero;

/** Default value of `swapCalldata` */
export const SWAP_CALLDATA_DEFAULT = ZERO;
