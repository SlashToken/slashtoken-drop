// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;

import "../slashtoken-drop-libs/TokenTransferer.sol";
import "../slashtoken-drop-types/interfaces/SlashTokenEvents.sol";
import "../slashtoken-drop-libs/NativeTransferer.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../slashtoken-drop-libs/SubscriptionRegistry.sol";
/// @author 0xCocomastoras
/// @custom:version 1.0
/// @title SlashToken
/// @notice SlashToken is a simple, yet powerful tool to airdrop tokens and NFTs.

contract SlashToken is TokenTransferer, NativeTransferer, SlashTokenEvents, SubscriptionRegistry, ReentrancyGuard {

    constructor() ReentrancyGuard(){}

    /**
        @notice ERC-20 token airdrop with same, equal amount to all recipients
        @param recipients A list of addresses of the recipients
        @param amount Amount of tokens each recipient will be airdropped
        @param token Address of the token
    */
    function erc20AirdropEqualAmount(address[] calldata recipients, uint256 amount, address token) external payable nonReentrant {
        require(frozen == 0, "CF");
        require(denylist[msg.sender] == 0, 'UD');
        uint256 value = _getBaseFeeForWallet(); //Check if wallet is whitelisted with different value
        uint256 purchasedTxns = _getAvailableTxnsForWallet();
        uint recipientsLength = recipients.length;
        value = value == 0 ? baseFee : value;
        if (purchasedTxns == 0) {
            require(msg.value == value, "NVV");
        } else {
            _updateAvailableTxnsForWallet();
        }
        require(isInitialized != 0, 'NIY');
        require(recipientsLength <= 500, 'NVL');
        uint recipientsOffset;
        assembly {
            recipientsOffset := recipients.offset
        }
        _performMultiERC20Transfer(token, recipientsOffset, recipientsLength, amount);
        emit Erc20AirdropEqualAmount(msg.sender, token, recipientsLength, recipientsLength*amount);
    }

    /**
        @notice ERC-20 token airdrop with custom amount for each recipient
        @param recipients A list of addresses of the recipients
        @param amount A list of amounts of the tokens each recipient will be airdropped
        @param token Address of the token
        @param totalAmount The sum of all tokens to be airdropped
    */
    function erc20AirdropCustomAmount(address[] calldata recipients, uint256[] calldata amount, address token, uint256 totalAmount) external payable nonReentrant {
        require(frozen == 0, "CF");
        require(denylist[msg.sender] == 0, 'UD');
        uint256 value = _getBaseFeeForWallet(); //Check if wallet is whitelisted with different value
        uint256 purchasedTxns = _getAvailableTxnsForWallet();
        uint recipientsLength = recipients.length;
        value = value == 0 ? baseFee : value;
        if (purchasedTxns == 0) {
            require(msg.value == value, "NVV");
        } else {
            _updateAvailableTxnsForWallet();
        }
        require(isInitialized != 0, 'NIY');
        require(recipientsLength <= 500 && recipientsLength == amount.length, 'NVL');
        uint recipientsOffset;
        uint amountsOffset;

        assembly {
            recipientsOffset := recipients.offset
            amountsOffset := amount.offset
        }
        _performMultiERC20TransferCustom(token, recipientsOffset, recipientsLength, amountsOffset, totalAmount);
        emit Erc20AirdropCustomAmount(msg.sender, token, recipientsLength, totalAmount);
    }

    /**
        @notice Native currency airdrop with same, equal amount to all recipients
        @param recipients A list of addresses of the recipients
        @param amount Amount of tokens each recipient will be airdropped
    */
    function nativeAirdropEqualAmount(address[] calldata recipients, uint256 amount) external payable nonReentrant {
        require(frozen == 0, "CF");
        require(isInitialized != 0, 'NIY');
        require(denylist[msg.sender] == 0, 'UD');
        uint recipientsOffset;
        uint recipientsLength = recipients.length;
        uint256 value = _getBaseFeeForWallet();  //Check if wallet is whitelisted with different value
        uint256 purchasedTxns = _getAvailableTxnsForWallet();
        uint256 recipientsValue = amount * recipientsLength;
        value = value == 0 ? (baseFee + recipientsValue) : (value + recipientsValue);
        if (purchasedTxns == 0) {
            require(msg.value == value, "NVV");
        } else {
            require(msg.value == recipientsValue, 'NVV');
            _updateAvailableTxnsForWallet();
        }
        require(recipientsLength <= 500, 'NVL');
        assembly {
            recipientsOffset := recipients.offset
        }
        _performMultiNativeTransfer(recipientsOffset, recipientsLength, amount);
        emit NativeAirdropEqualAmount(msg.sender, recipientsLength, recipientsValue);
    }

    /**
        @notice Native currency airdrop with custom amount for each recipient
        @param recipients A list of addresses of the recipients
        @param amounts A list of amounts that each recipient will be airdropped
    */
    function nativeAirdropCustomAmount(address[] calldata recipients, uint256[] calldata amounts) external payable nonReentrant {
        require(frozen == 0, "CF");
        require(isInitialized != 0, 'NIY');
        require(denylist[msg.sender] == 0, 'UD');
        uint256 value = _getBaseFeeForWallet(); //Check if wallet is whitelisted with different value
        uint256 purchasedTxns = _getAvailableTxnsForWallet();
        uint recipientsOffset;
        uint amountsOffset;
        uint recipientsLength = recipients.length;
        require(recipientsLength <= 500 && recipientsLength == amounts.length, 'NVL');
        assembly {
            recipientsOffset := recipients.offset
            amountsOffset := amounts.offset
        }
        uint totalAmount = _performMultiNativeTransferCustom(recipientsOffset, recipientsLength, amountsOffset);
        value = value == 0 ? (baseFee + totalAmount) : (value + totalAmount);
        if (purchasedTxns == 0) {
            require(msg.value == value, "NVV");
        } else {
            require(msg.value == totalAmount, 'NVV');
            _updateAvailableTxnsForWallet();
        }
        emit NativeAirdropCustomAmount(msg.sender, recipientsLength, totalAmount);
    }

    /**
        @notice Basic Airdrop of Erc721 tokens without bundle
        @param recipients A list of addresses of the recipients
        @param ids A list of ids of the token each recipient will be airdropped
        @param token The address of the token
    */
    function erc721Airdrop(address[] calldata recipients, uint256[] calldata ids, address token) external payable nonReentrant {
        require(permitErc721 != 0, 'NEY');
        require(frozen == 0, "CF");
        require(isInitialized != 0, 'NIY');
        require(denylist[msg.sender] == 0, 'UD');
        uint256 value = _getBaseFeeForWallet();
        value = value == 0 ? baseFee : value;
        uint256 purchasedTxns = _getAvailableTxnsForWallet();
        uint recipientsLength = recipients.length;
        if (purchasedTxns == 0) {
            require(msg.value == value, "NVV");
        } else {
            _updateAvailableTxnsForWallet();
        }
        require(recipientsLength <= 500 && recipientsLength == ids.length, 'NVL');
        uint recipientsOffset;
        uint idsOffset;
        assembly {
            recipientsOffset := recipients.offset
            idsOffset := ids.offset
        }
        _performMultiERC721Transfer(token, msg.sender, recipientsOffset, recipientsLength, idsOffset);
        emit Erc721Airdrop(msg.sender, token, recipientsLength);
    }
}
