// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/// @notice Safe ERC20 ,ERC721 multi transfer library that gracefully handles missing return values.
/// @author Cocomastoras
/// @author Modified from Solady (https://github.com/vectorized/solady/blob/main/src/utils/SafeTransferLib.sol)
/// @author Modified from Solmate (https://github.com/transmissions11/solmate/blob/main/src/utils/SafeTransferLib.sol)
///
/// @dev Note:
/// - For ERC20s and ERC721s, this implementation won't check that a token has code,
/// responsibility is delegated to the caller.

contract TokenTransferer {
    error TransferFromFailed();

    /**
     * @dev Internal function to transfer ERC20 tokens from a given originator
     *      to a multiple recipients. Sufficient approvals must be set on the
     *      contract performing the transfer.
     *
     * @param token                The ERC20 token to transfer.
     * @param recipientsOffset     Calldata offset of the recipients of the transfer.
     * @param length               Calldata length of the recipients of the transfer.
     * @param amount               The amount to transfer.
     */
    function _performMultiERC20Transfer(address token, uint256 recipientsOffset, uint256 length, uint256 amount) internal{
        /// @solidity memory-safe-assembly
        assembly {
            let total := mul(amount, length)
            let m := mload(0x40) // Cache the free memory pointer.
            mstore(0x60, total) // Store the `amount` argument.
            mstore(0x40, address()) // Store the `to` argument.
            mstore(0x2c, shl(96, caller())) // Store the `from` argument.
            mstore(0x0c, 0x23b872dd000000000000000000000000)
            if iszero(
                and( // The arguments of `and` are evaluated from right to left.
                    or(
                        eq(mload(0x00), 1), iszero(returndatasize())), // Returned 1 or nothing.
                        call(gas(), token, 0, 0x1c, 0x64, 0x00, 0x20)
                    )
                )
            {
                mstore(0x00, 0x7939f424) // `TransferFromFailed()`.
                revert(0x1c, 0x04)
            }
            mstore(0x40, amount) // Store the `amount` argument.
            for { let i := 0 } lt(i, length) { i := add(i, 1) } {
                let to := calldataload(add(recipientsOffset, mul(i, 0x20)))
                mstore(0x2c, shl(96, to)) // Store the `to` argument.
                mstore(0x0c, 0xa9059cbb000000000000000000000000) // `transfer(address,uint256)`.
                // Perform the transfer, reverting upon failure.
                if iszero(
                    and( // The arguments of `and` are evaluated from right to left.
                        or(eq(mload(0x00), 1), iszero(returndatasize())), // Returned 1 or nothing.
                        call(gas(), token, 0, 0x1c, 0x44, 0x00, 0x20)
                    )
                ) {
                    mstore(0x00, 0x7939f424) // `TransferFromFailed()`.
                    revert(0x1c, 0x04)
                }
            }
            mstore(0x60, 0) // Restore the zero slot to zero.
            mstore(0x40, m) // Restore the free memory pointer.
        }
    }

    /**
        * @dev Internal function to transfer ERC20 tokens from a given originator
        *      to multiple recipients. Sufficient approvals must be set on the
        *      contract performing the transfer.
        * @param token            The ERC20 token to transfer.
        * @param recipientsOffset Offset of the recipients of the transfer.
        * @param recipientsLength Length of the recipients of the transfer.
        * @param amountsOffset    Offset of the amounts to transfer.
        * @param totalAmount      The totalAmount to transfer
    */
    function _performMultiERC20TransferCustom(address token, uint256 recipientsOffset, uint256 recipientsLength, uint256 amountsOffset, uint256 totalAmount) internal {
        /// @solidity memory-safe-assembly
        assembly {
            let m := mload(0x40) // Cache the free memory pointer.
            mstore(0x60, totalAmount) // Store the `amount` argument.
            mstore(0x40, address()) // Store the `to` argument.
            mstore(0x2c, shl(96, caller())) // Store the `from` argument.
            mstore(0x0c, 0x23b872dd000000000000000000000000)
            if iszero(
                and( // The arguments of `and` are evaluated from right to left.
                    or(
                        eq(mload(0x00), 1), iszero(returndatasize())), // Returned 1 or nothing.
                        call(gas(), token, 0, 0x1c, 0x64, 0x00, 0x20)
                    )
                )
            {
                mstore(0x00, 0x7939f424) // `TransferFromFailed()`.
                revert(0x1c, 0x04)
            }
            let sumAmount := 0
            for { let i := 0 } lt(i, recipientsLength) { i := add(i, 1) } {
                let to := calldataload(add(recipientsOffset, mul(i, 0x20)))
                let amount := calldataload(add(amountsOffset, mul(i, 0x20)))
                sumAmount := add(sumAmount, amount)
                mstore(0x40, amount) // Store the `amount` argument.
                mstore(0x2c, shl(96, to)) // Store the `to` argument.
                mstore(0x0c, 0xa9059cbb000000000000000000000000) // `transfer(address,uint256)`.
                // Perform the transfer, reverting upon failure.
                if iszero(
                    and( // The arguments of `and` are evaluated from right to left.
                        or(eq(mload(0x00), 1), iszero(returndatasize())), // Returned 1 or nothing.
                        call(gas(), token, 0, 0x1c, 0x44, 0x00, 0x20)
                    )
                ) {
                    mstore(0x00, 0x7939f424) // `TransferFromFailed()`.
                    revert(0x1c, 0x04)
                }
            }
            if iszero(eq(totalAmount, sumAmount)) {
                revert(0,0)
            }
            mstore(0x60, 0) // Restore the zero slot to zero.
            mstore(0x40, m) // Restore the free memory pointer.
        }
    }

    /**
     * @dev Internal function to transfer batch of ERC721 tokens from a given
     *      originator to multiple recipients. Sufficient approvals must be set on
     *      the contract performing the transfer. Note that this function does
     *      not check whether the receiver can accept the ERC721 token (i.e. it
     *      does not use `safeTransferFrom`).
     *
     * @param token             The ERC721 token to transfer.
     * @param from              The originator of the transfer.
     * @param recipientsOffset  The offset of recipients of the transfer.
     * @param recipientsLength  The length of tokens to transfer.
     * @param idsOffset         The offset of tokenIds to transfer.
     */
    function _performMultiERC721Transfer(
        address token,
        address from,
        uint256 recipientsOffset,
        uint256 recipientsLength,
        uint256 idsOffset
    ) internal {
        // Utilize assembly to perform an optimized ERC721 token transfer.
        assembly {
            let m := mload(0x40) // Cache the free memory pointer.
            for { let i := 0 } lt(i, recipientsLength) { i := add(i, 1) } {
                let to := calldataload(add(recipientsOffset, mul(i, 0x20)))
                let identifier := calldataload(add(idsOffset, mul(i, 0x20)))
                mstore(0x60, identifier) // Store the `identifier` argument.
                mstore(0x40, to) // Store the `to` argument.
                mstore(0x2c, shl(96, from)) // Store the `from` argument.
                mstore(0x0c, 0x23b872dd000000000000000000000000) // `transferFrom(address,address,uint256)`.
                // Perform the transfer, reverting upon failure.
                if iszero(
                    and( // The arguments of `and` are evaluated from right to left.
                        iszero(returndatasize()), // Returned error.
                        call(gas(), token, 0, 0x1c, 0x64, 0x00, 0x00)
                    )
                ) {
                    mstore(0x00, 0x7939f424) // `TransferFromFailed()`.
                    revert(0x1c, 0x04)
                }
            }
            mstore(0x60, 0) // Restore the zero slot to zero.
            mstore(0x40, m) // Restore the free memory pointer.
        }
    }
}

