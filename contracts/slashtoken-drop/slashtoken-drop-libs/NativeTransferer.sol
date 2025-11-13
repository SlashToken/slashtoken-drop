// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


contract NativeTransferer {
    uint256 internal constant GAS_STIPEND_NO_STORAGE_WRITES = 2300;

    /**
     * @dev Internal function to transfer native tokens from a given originator
     *      to a multiple recipients
     *
     * @param offset     Calldata offset of the recipients of the transfer.
     * @param length     Calldata length of the recipients of the transfer.
     * @param amount     The amount to transfer.
     */
    function _performMultiNativeTransfer(uint256 offset, uint256 length, uint256 amount) internal {
        assembly {
             for { let i := 0 } lt(i, length) { i := add(i, 1) } {
                 let to := calldataload(add(offset, mul(i, 0x20)))
                 if iszero( call(
                    GAS_STIPEND_NO_STORAGE_WRITES,
                    to,
                    amount,
                    0,
                    0,
                    0,
                    0
                 )) {
                     revert(0,0)
                 }
             }
        }
    }

    /**
     * @dev Internal function to transfer native tokens from a given originator
     *      to a multiple recipients
     *
     * @param recipientsOffset            Calldata offset of the recipients of the transfer.
     * @param length            Calldata length of the recipients of the transfer.
     * @param amountsOffset     Calldata offset of the amounts to transfer
     */
    function _performMultiNativeTransferCustom(uint256 recipientsOffset, uint256 length, uint256 amountsOffset) internal returns (uint256 totalAmount){
        assembly {
             for { let i := 0 } lt(i, length) { i := add(i, 1) } {
                 let to := calldataload(add(recipientsOffset, mul(i, 0x20)))
                 let amount := calldataload(add(amountsOffset, mul(i, 0x20)))
                 totalAmount := add(totalAmount, amount)
                 if iszero( call(
                    GAS_STIPEND_NO_STORAGE_WRITES,
                    to,
                    amount,
                    0,
                    0,
                    0,
                    0
                 )) {
                     revert(0,0)
                 }
             }
        }
    }
}
