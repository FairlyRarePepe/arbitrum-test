// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FakeUSDC is ERC20 {
    uint256 public INITIAL_SUPPLY = 1000000000 * 10**18;

    string public name;
    string public symbol;

    constructor() public {
        _mint(msg.sender, INITIAL_SUPPLY);
        name = "FakeUSDC";
        symbol = "fUSDC";
    }
}
