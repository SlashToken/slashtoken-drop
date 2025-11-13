// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface SlashTokenEvents {
    event Erc20AirdropEqualAmount(address indexed From, address indexed Token,uint256 RecipientsLength, uint256 TotalAmount);
    event Erc20AirdropCustomAmount(address indexed From, address indexed Token, uint256 RecipientsLength, uint256 TotalAmount);
    event NativeAirdropEqualAmount(address indexed From,uint256 RecipientsLength, uint256 TotalAmount);
    event NativeAirdropCustomAmount(address indexed From, uint256 RecipientsLength, uint256 TotalAmount);
    event Erc721Airdrop(address indexed From, address indexed Token, uint256 RecipientsLength);
}
