// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../slashtoken-drop-types/interfaces/SlashTokenRegistryEvents.sol";
import "../slashtoken-drop-types/interfaces/PremiumSubscriptionRegistryEvents.sol";
import "./ManagerActions.sol";


contract SubscriptionRegistry is SlashTokenRegistryEvents, PremiumSubscriptionRegistryEvents, ManagerActions {
    // @dev user's adddress to custom base fee for no bundle purchases
    mapping (address => uint256) baseFeeWhitelisted;
    // @dev user address to total available txns to use
    mapping(address => uint256) public userToTxns;

    uint256[] availableTxnsBundles;
    uint256[] txnsBundlesToPrice;

    uint256 isInitialized;
    uint256 public baseFee;
    using EnumerableSet for EnumerableSet.AddressSet;
    EnumerableSet.AddressSet bundleUsers;

    function initialize(address admin_, address feeSink_, uint256 baseFeeCostInWei, uint256[] memory availableTxnsBundles_, uint256[] memory txnsBundlesToPrice_ ) external {
        require(isInitialized == 0, 'AI');
        require(availableTxnsBundles_.length == txnsBundlesToPrice_.length, 'NVD');
        owner = admin_;
        feeSink = feeSink_;
        availableTxnsBundles = availableTxnsBundles_;
        txnsBundlesToPrice = txnsBundlesToPrice_;
        isInitialized = 1;
        baseFee = baseFeeCostInWei;
    }

    constructor(){}

    /**
        @notice User buys a bundle of txns
        @param bundleIndex The index of the bundle array
        @param quantity The number of bundles that the user wants to buy
    */
    function buyTxnsBundle(uint256 bundleIndex, uint256 quantity) external payable {
        require(frozen == 0, "CF");
        require(msg.value == txnsBundlesToPrice[bundleIndex] * quantity, 'NVV');
        require(denylist[msg.sender] == 0, 'UD');
        require(quantity != 0, 'NVA');
        if(!bundleUsers.contains(msg.sender)) {
            bundleUsers.add(msg.sender);
        }
        uint256 total;
        unchecked {
            total = availableTxnsBundles[bundleIndex] * quantity;
            userToTxns[msg.sender] += total;
        }
        emit TxnsBundleBought(msg.sender, msg.value, total);
    }

    /**
        @notice Admin sets promo fee for wallet instead of default base fee
        @param wallet User's wallet address
        @param amountInWei New cost per txns
    */
    function setBaseFeeForWallet(address wallet, uint256 amountInWei) external {
        require(amountInWei < baseFee, "NVV");
        require(msg.sender == owner, 'NVS');
        baseFeeWhitelisted[wallet] = amountInWei;
        emit WalletBaseFeeSet(wallet, amountInWei);
    }

    /**
        @notice Admin resets promo fee for wallet. Default base fee applies
        @param wallet User's wallet address
    */
    function resetBaseFeeForWallet(address wallet) external {
        require(msg.sender == owner, 'NVS');
        delete baseFeeWhitelisted[wallet];
        emit WalletBaseFeeReset(wallet);
    }

    /**
        @notice Admin adds txns to a user
        @param wallets A list of user's wallet address
        @param txns A list of txns to be added
    */
    function addTxnsToWallets(address[] memory wallets, uint256[] memory txns) external {
        require(msg.sender == owner, 'NVS');
        require(wallets.length == txns.length, "NVL");
        uint len = wallets.length;
        for(uint i =0; i<len;){
            unchecked {
                userToTxns[wallets[i]] += txns[i];
                i++;
            }
        }
        emit TxnsAdded(wallets, txns);
    }

    /**
        @notice Admin sets the new base fee for all txns
        @param baseFee_ New base fee
    */
    function setNewBaseFee(uint256 baseFee_) external {
        require(msg.sender == owner, 'NVS');
        baseFee = baseFee_;
    }

    /**
        @notice Admin sets the new available txnsBundles and prices
        @param availableTxnsBundles_ New available bundles
        @param txnsBundlesToPrice_ New price per bundles
    */
    function updateBundles(uint256[] memory availableTxnsBundles_, uint256[] memory txnsBundlesToPrice_ ) external {
        require(msg.sender == owner, 'NVS');
        require(availableTxnsBundles_.length == txnsBundlesToPrice_.length, 'NVD');
        availableTxnsBundles = availableTxnsBundles_;
        txnsBundlesToPrice = txnsBundlesToPrice_;
        emit BundlesUpdated(msg.sender, availableTxnsBundles_, txnsBundlesToPrice_);
    }

    /**
        @notice External view function that returns active bundle offers
    */
    function getBundles() external view returns (uint256[] memory AvailableBundles, uint256[] memory BundlesPrices) {
        AvailableBundles = availableTxnsBundles;
        BundlesPrices = txnsBundlesToPrice;
    }

    /**
        @notice External view function that returns the custom base fee for wallet
    */
    function getBaseFeeForWallet() external view returns (uint256) {
        return baseFeeWhitelisted[msg.sender];
    }

    /**
        @notice External view function that returns the available txns for wallet
    */
    function getAvailableTxnsForWallet() external view returns (uint256) {
        return userToTxns[msg.sender];
    }

    /**
        @notice External view function that returns all the users that have bought a bundle
    */
    function getUsersThatBoughtBundles() external view returns (address[] memory Users) {
        require(msg.sender == owner, 'NVS');
        Users = bundleUsers.values();
    }

    /**
        @notice Internal view function that returns the custom base fee for wallet
    */
    function _getBaseFeeForWallet() internal view returns (uint256) {
        return baseFeeWhitelisted[msg.sender];
    }

    /**
        @notice Internal view function that returns the available txns for wallet
    */
    function _updateAvailableTxnsForWallet() internal {
        unchecked {
            --userToTxns[msg.sender];
        }
    }

    /**
        @notice Internal view function that returns the available txns for wallet
    */
    function _getAvailableTxnsForWallet() internal view returns (uint256) {
        return userToTxns[msg.sender];
    }
}
