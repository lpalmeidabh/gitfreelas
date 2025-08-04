// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

/**
 * @title GitFreelasToken
 * @dev Implementation of a simple ERC20 token with minting and burning capabilities.
 */
contract GitFreelasToken is ERC20 {
    address public gitfreelas;

    /**
     * @dev Sets the values for {name} and {symbol} of the token.
     * The owner is set to the deployer of the contract.
     */
    constructor(
        string memory _name,
        string memory _symbol,
        address _gitfreelas
    ) ERC20(_name, _symbol) {
        gitfreelas = _gitfreelas;
    }

    /**
     * @dev Update the GitFreelas contract address (only callable by current gitfreelas or if gitfreelas is zero)
     * @param newGitFreelas New GitFreelas contract address
     */
    function updateGitFreelasAddress(address newGitFreelas) external {
        require(
            msg.sender == gitfreelas || gitfreelas == address(0),
            'Only current GitFreelas contract can update'
        );
        gitfreelas = newGitFreelas;
    }

    /**
     * @dev Mints `amount` tokens to the `to` address.
     * Only the owner of the contract can call this function.
     */
    function mint(address to, uint256 amount) public {
        require(
            msg.sender == gitfreelas,
            'Only the GitFreelas contract can mint tokens'
        );
        _mint(to, amount);
    }

    function burnFrom(address account, uint256 amount) public {
        require(
            msg.sender == gitfreelas,
            'Only the GitFreelas contract can burn tokens'
        );
        _burn(account, amount);
    }
}
