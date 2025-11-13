// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {IBlast} from "../slashtoken-drop-types/interfaces/IBlast.sol";

contract ManagerActions{
    constructor(){}
    address owner;
    address feeSink;
    address gasSink;

    uint256 public frozen;
    uint256 public permitErc721 = 1;

    mapping(address => uint256) denylist;
    using EnumerableSet for EnumerableSet.AddressSet;
    EnumerableSet.AddressSet deniedAddresses;

    address constant internal YIELD_CONTRACT = 0x4300000000000000000000000000000000000002;


    /**
        @notice Admin freezes / unfreezes contracts
        @param value_ 0 = unfreeze, any other value = freeze
    */
    function freezeContract(uint256 value_) external {
        require(msg.sender == owner, 'NVS');
        frozen = value_;
    }

    /**
        @notice Admin permits/freezes erv721Airdrops
        @param value_ 0 = freeze, any other value = permit
    */
    function handleErc721Flag(uint256 value_) external {
        require(msg.sender == owner, 'NVS');
        permitErc721 = value_;
    }

    /**
        @notice Admin updates fee sink address
        @param feeSink_ The new fee sink address
    */
    function updateFeeSink(address feeSink_) external {
        require(msg.sender == owner, 'NVS');
        feeSink = feeSink_;
    }

    /**
        @notice Admin updates gas sink address
        @param gasSink_ The new gas sink address
    */
    function updateGasSink(address gasSink_) external {
        require(msg.sender == owner, 'NVS');
        gasSink = gasSink_;
    }

    function claimMaxGas() external {
        require(msg.sender == owner, 'NVS');
        IBlast(YIELD_CONTRACT).claimMaxGas(address(this), gasSink);
    }

    /**
        @notice Admin claims contract fees
    */
    function claimFees() external {
        address owner_ = owner;
        assembly {
            if iszero(eq(caller(), owner_)) {
                revert(0,0)
            }
            if iszero(call(gas(), sload(feeSink.slot), selfbalance(), 0, 0, 0, 0)) {
                revert(0,0)
            }
        }
    }

    function addToDenylist(address[] memory list) external {
        require(msg.sender == owner, 'NVS');
        uint len = list.length;
        for(uint i = 0; i < len;) {
            if (!deniedAddresses.contains(list[i])) {
                deniedAddresses.add(list[i]);
            }
            unchecked {
                denylist[list[i]] = 1;
                i++;
            }
        }
    }

    function removeFromDenylist(address[] memory list) external {
        require(msg.sender == owner, 'NVS');
        uint len = list.length;
        for(uint i = 0; i < len;) {
            if (deniedAddresses.contains(list[i])) {
                deniedAddresses.remove(list[i]);
            }
            unchecked {
                denylist[list[i]] = 0;
                i++;
            }
        }
    }

    function getDenylist() external view returns (address[] memory) {
        require(msg.sender == owner, 'NVS');
        return deniedAddresses.values();
    }
}
