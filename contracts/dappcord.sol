// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Dappcord is ERC721 {
    address private immutable i_owner;
    uint256 totalChannels;
    uint256 totalSupply;


    modifier onlyOwner() {
        require(msg.sender == i_owner, "only owner can call this fnc");
        _;
    }

    struct Channel {
        uint256 id;
        string name;
        uint256 cost;
    }

    mapping(uint256 => Channel) public channels;
    mapping(uint256 => mapping(address => bool)) public hasJoined;

    constructor() ERC721("ChannelEntry", "CEN") {
        i_owner = msg.sender;
    }

    function createChannel(string memory _name, uint256 _cost) public onlyOwner {
        totalChannels++;
        channels[totalChannels] = Channel(totalChannels, _name, _cost);
    }

    function mint(uint256 _id) public payable {
        require(_id != 0);
        require(_id <= totalSupply);
        require(msg.value >= channels[_id].cost);
        require(hasJoined[_id][msg.sender] == false);

        totalSupply++;
        _mint(msg.sender, totalSupply);
        hasJoined[totalSupply][msg.sender] = true;
    }

    function withdraw() public onlyOwner {
        (bool success,) = payable(i_owner).call{value: address(this).balance}("");
        require (success);
    }

    // getters

    function getChannels(uint256 _id) public view returns(Channel memory){
        return channels[_id];
    }

    function getOwner() public view returns(address) {
        return i_owner;
    }
}
