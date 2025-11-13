// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface PremiumSubscriptionRegistryEvents {
    event WalletBaseFeeSet(address indexed Wallet, uint256 BaseFeeInWei);
    event WalletBaseFeeReset(address indexed Wallet);
    event TxnsAdded(address[] Wallet, uint256[] Txns);
}
