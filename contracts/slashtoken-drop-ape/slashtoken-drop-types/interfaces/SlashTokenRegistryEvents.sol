// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface SlashTokenRegistryEvents {
    event TxnsBundleBought(address indexed Buyer, uint256 Amount, uint256 Txns);
    event BundlesUpdated(address indexed Operator, uint256[] BundlesAmounts, uint256[] BundlesPrices);
}
