// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract DummyErc721 is ERC721{
    constructor()ERC721("Dummy Nft", "DNFT"){
    }
    uint256 tokenId = 1;
//    function mint(uint256 amount) external {
//        for(uint i=0; i< amount; i++) {
//            _mint(msg.sender, tokenId);
//            tokenId++;
//        }
//    }

    function mint(uint256 amount, address to) external {
        for(uint i=0; i< amount; i++) {
            _mint(to, tokenId);
            tokenId++;
        }
    }
}
