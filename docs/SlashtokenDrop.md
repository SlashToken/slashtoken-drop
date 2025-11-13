# Drop documentation
Slashtoken drops is a simple airdrop tool where users can airdrop ERC20, ERC721 tokens and Natice Currency.

## User Transactions reference
The possible user transactions are:

- erc20AirdropFixedPrice
- erc20AirdropCustomPrice
- nativeAirdropFixedPrice
- nativeAirdropCustomPrice
- erc721Airdrop
- buyBundleTxns

Details are presented below:

### erc20AirdropFixedPrice
The __erc20AirdropFixedPrice__ action takes 3 argument as input:
- recipients: address[]
- amount: uint256
- token: address

Reverts:
- NVV: If msg.value not equal base or promo fee
- NVL: If total recipients greater than 500
- CF: If contract is frozen
- NIY: If contract is not initialized
- UD: If caller is in denylist

Emits:
- Erc20AirdropFixed

Airdrops the given token to a number of recipients with a fixed amount for all

### erc20AirdropCustomPrice
The __erc20AirdropCustomPrice__ action takes 4 argument as input:
- recipients: address[]
- amount: uint256[]
- token: address
- totalAmount: uint256

Reverts:
- CF: If contract is frozen
- NVV: If msg.value not equal base or promo fee
- NVL: If total recipients greater than 500 or if amounts length not equal recipients length
- NIY: If contract is not initialized
- UD: If caller is in denylist



Emits:
- Erc20AirdropCustom

Airdrops the given token to a number of recipients with a custom amount for each

### nativeAirdropFixedPrice
The __nativeAirdropFixedPrice__ action takes 2 argument as input:
- recipients: address[]
- amount: uint256

Reverts:
- CF: If contract is froze
- NIY: If contract is not initialized
- NVV: If msg.value not equal base or promo fee plus the total amount to be airdroped
- NVL: If total recipients greater than 500
- UD: If caller is in denylist

Emits:
- NativeAirdropFixed

Airdrops the native token to a number of recipients with a fixed amount for all

### nativeAirdropCustomPrice
The __nativeAirdropCustomPrice__ action takes 2 argument as input:
- recipients: address[]
- amount: uint256[]

Reverts:
- CF: If contract is froze
- NIY: If contract is not initialized
- NVV: If msg.value not equal base or promo fee plus the total amount to be airdroped
- NVL: If total recipients greater than 500
- UD: If caller is in denylist

Emits:
- NativeAirdropCustom

Airdrops the native token to a number of recipients with a custom amount for each

### erc721Airdrop
The __erc721Airdrop__ action takes 3 argument as input:
- recipients: address[]
- ids: uint256[]
- token: address

Reverts:
- CF: If contract is frozen
- NIY: If contract is not initialized
- NVV: If msg.value not equal base or promo fee 
- NVL: If total recipients greater than 500 or ids length does not match recipients length
- UD: If caller is in denylist
- NEY: If erc721 drop not yet permitted

Emits:
- Erc721Airdrop

Airdrops the given nfts to a number of recipients

### buyBundleTxns
The __buyBundleTxns__ action takes 2 argument as input:
- bundleIndex: uint256
- amount: uint256

Reverts:
- CF: If contract is frozen
- NVA: If amount is zero valued
- NVV: If not correct msg.value
- UD: If caller is in denylist


Emits:
- TxnBundleBought

User buys a bundle of transactions giving the index of the bundle he wants to buy and defining the quantity of bundles he wants

## Admin transactions reference

The possible admin transactions are:

- claimFees
- initialize
- setBaseFeeForWallet
- resetBaseFeeForWallet
- freezeContract
- updateFeeSink
- addTxnsToWallet
- setNewBaseFee
- updateBundles
- handleErc721Flag
- addToDenylist
- removeFromDenylist

Details are presented below:

### claimFees
The __claimFees__ action takes 0 argument as input:

Reverts:
- NVS: If not correct caller

Admin withdraw all contract's fees

### initialize
The __initialize__ action takes 3 argument as input:
- baseFeeCostInWei: uint256
- availableTxnsBundles_: uint256[]
- txnsBundlesToPrice_: uint256[]

Reverts:
- AI: If already initialised
- NVS: If not correct caller
- NVD: If availableTxnsBundles length not equals txnsBundlesToPrice length

Admin initializes the contract

### setBaseFeeForWallet
The __setBaseFeeForWallet__ action takes 2 argument as input:
- wallet address
- amountInWei uint256

Reverts:
- NVS: If not correct caller
- NVV: If declared value is higher than the normal

Emits:
- NewWalletBaseFee

Admin whitelists a user's wallet to have new basefee per no bundle txn until it resets

### resetBaseFeeForWallet
The __resetBaseFeeForWallet__ action takes 1 argument as input:
- wallet address

Reverts:
- NVS: If not correct caller

Emits:
- WalletBaseFeeReset

Admin resets a user's wallet to have standard basefee per no bundle txn until

### freezeContract
The __freezeContract__ action takes 1 argument as input:
- value_ uint256

Reverts:
- NVS: If not correct caller

Admin freezes/unfreezes the contract

### updateFeeSink
The __updateFeeSink__ action takes 1 argument as input:
- feeSink_ address

Reverts:
- NVS: If not correct caller

Admin updates the feeSink address

### addTxnsToWallet
The __addTxnsToWallet__ action takes 2 argument as input:
- wallet address
- txns uint256

Reverts:
- NVS: If not correct caller

Emits:
- TxnsGifted

Admin adds free txns to a given wallet

### setNewBaseFee
The __setNewBaseFee__ action takes 1 argument as input:
- baseFee_ uint256

Reverts:
- NVS: If not correct caller

Admin updates the baseFee

### updateBundles
The __updateBundles__ action takes 2 argument as input:
- availableTxnsBundles_: uint256[]
- txnsBundlesToPrice_: uint256[]

Reverts:
- NVS: If not correct caller
- NVD: If availableTxnsBundles length not equals txnsBundlesToPrice length

Emits:
- BundlesUpdated

Admin updated available bundles

### handleErc721Flag
The __handleErc721Flag__ action takes 1 argument as input:
- value_: uint256

Reverts:
- NVS: If not correct caller

Admin permits/freezes erc721 airdrop

### addToDenylist
The __addToDenylist__ action takes 1 argument as input:
- list: uint256[]

Reverts:
- NVS: If not correct caller

Admin adds a list of addresses in denylist

### removeFromDenylist
The __removeFromDenylist__ action takes 1 argument as input:
- list: uint256[]

Reverts:
- NVS: If not correct caller

Admin removes a list of addresses from denylist

## Internal transactions reference

- _performMultiERC20Transfer
- _performMultiERC20TransferCustom
- _performMultiERC721Transfer
- _performMultiNativeTransfer
- _performMultiNativeTransferCustom
- _getBaseFeeForWallet
- _getAvailableTxnsForWallet
- _updateAvailableTxnsForWallet

Details are presented below:

### _performMultiERC20Transfer
The ___performMultiERC20Transfer__ action takes 5 argument as input:
- token address
- from address
- offset uint256
- length uint256
- amount uint256

Loads from calldata the recipients and transfers to each one the declared token and amount

### _performMultiERC20TransferCustom
The ___performMultiERC20TransferCustom__ action takes 5 argument as input:
- token address
- from address
- recipientsOffset uint256
- recipientsLength uint256
- amountsOffset uint256

Returns :
- totalAmount: uint256

Loads from calldata the recipients and amounts and transfers to each one the declared token 

### _performMultiERC721Transfer
The ____performMultiERC721Transfer__ action takes 5 argument as input:
- token address
- from address
- recipientsOffset uint256
- recipientsLength uint256
- idsOffset uint256

Loads from calldata the recipients and ids and transfers to each one the declared nft 

### _performMultiNativeTransfer
The ___performMultiNativeTransfer__ action takes 3 argument as input:
- offset uint256
- length uint256
- amount uint256

Loads from calldata the recipients and transfers to each one the native token on fixed amount

### _performMultiNativeTransferCustom
The ___performMultiNativeTransfer__ action takes 3 argument as input:
- recipientsOffset uint256
- length uint256
- amountsOffset uint256

Returns:
- totalAmount

Loads from calldata the recipients and amounts and transfers to each one the native token

### _getBaseFeeForWallet
The ___getBaseFeeForWallet__ action takes 0 argument as input:

Returns
- BaseFee uint256

Internal view function that returns the given user's premium fee or zero

### _getAvailableTxnsForWallet
The ___getAvailableTxnsForWallet__ action takes 0 argument as input:

Internal view function that returns the available txns to the connected wallet

### _updateAvailableTxnsForWallet
The ___updateAvailableTxnsForWallet__ action takes 0 argument as input:

Internal txns that consumes a txns from the caller

## Events:
    event NewWalletBaseFee(address indexed Wallet, uint256 BaseFeeInWei);
    event WalletBaseFeeReset(address indexed Wallet);
    event TxnsGifted(address indexed Wallet, uint256 Txns);
    event TxnBundleBought(address indexed Buyer, uint256 Amount);
    event BundlesUpdated(address indexed Operator, uint256[] BundlesAmounts, uint256[] BundlesPrices);
    event Erc20AirdropFixed(address indexed From, address indexed Token,uint256 RecipientsLength, uint256 TotalPrice);
    event Erc20AirdropCustom(address indexed From, address indexed Token, uint256 RecipientsLength, uint256 TotalPrice);
    event NativeAirdropFixed(address indexed From,uint256 RecipientsLength, uint256 TotalPrice);
    event NativeAirdropCustom(address indexed From, uint256 RecipientsLength, uint256 TotalPrice);
    event Erc721Airdrop(address indexed From, address indexed Token, uint256 RecipientsLength);


## View transactions:
- getBundles
- getAvailableTxnsForWallet
- getUsersThatBoughtBundles
- getBaseFeeForWallet
- getDenylist

### getBundles():
Retuns the lists of available bundles and pricing

### getAvailableTxnsForWallet():
Retuns callers available txns 

### getUsersThatBoughtBundles():
Retuns a list of addresses that bought txns bundles

### getBaseFeeForWallet():
Retuns callers promo base fee or 0

### getDenylist():
Returns the list of addresses that are in denylist
