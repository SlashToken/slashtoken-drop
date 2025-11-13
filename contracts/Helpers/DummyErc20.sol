// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DummyErc20 is ERC20{
    constructor()ERC20("Dummy Token", "DT"){
    }

//    function mint(uint256 _value) external {
//        _mint(msg.sender, _value*10**18);
//    }

    function mint(uint256 _value, address to) external {
        _mint(to, _value*10**18);
    }
}
