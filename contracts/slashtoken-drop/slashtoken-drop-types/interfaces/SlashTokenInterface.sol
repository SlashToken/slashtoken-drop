// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

interface SlashTokenInterface {
    function erc20AirdropEqualAmount(address[] calldata recipients, uint256 amount, address token) external payable;
    function erc20AirdropCustomAmount(address[] calldata recipients, uint256[] calldata amount, address token, uint256 totalAmount) external payable;
    function nativeAirdropEqualAmount(address[] calldata recipients, uint256 amount) external payable;
    function nativeAirdropCustomAmount(address[] calldata recipients, uint256[] calldata amounts) external payable;
    function erc721Airdrop(address[] calldata recipients, uint256[] calldata ids, address token) external payable;
    function buyTxnsBundle(uint256 bundleIndex, uint256 quantity) external payable;
    function getBundles() external view returns (uint256[] memory AvailableBundles, uint256[] memory BundlesPrices);
    function getBaseFeeForWallet() external view returns (uint256);
    function getAvailableTxnsForWallet() external view returns (uint256);
    function getUsersThatBoughtBundles() external view returns (address[] memory Users);

    function removeFromDenylist(address[] memory list) external;
    function getDenylist() external view returns (address[] memory);
    function addToDenylist(address[] memory list) external;
    function claimFees() external;
    function updateFeeSink(address feeSink_) external;
    function freezeContract(uint256 value_) external;
    function setBaseFeeForWallet(address wallet, uint256 amountInWei) external;
    function resetBaseFeeForWallet(address wallet) external;
    function addTxnsToWallets(address[] memory wallets, uint256[] memory txns) external;
    function setNewBaseFee(uint256 baseFee_) external;
    function updateBundles(uint256[] memory availableTxnsBundles_, uint256[] memory txnsBundlesToPrice_ ) external;
    function handleErc721Flag(uint256 value_) external;
    function userToTxns(address user) external view returns(uint256);
}
