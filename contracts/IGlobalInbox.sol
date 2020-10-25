pragma solidity >=0.4.21 <0.7.0;

interface IGlobalInbox {
    function depositERC20Message(
        address chain,
        address erc20,
        address to,
        uint256 value
    ) external;
}
