// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from 'forge-std/Test.sol';
import {console} from 'forge-std/console.sol';
import '../src/GitFreelasToken.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

/**
 * @title GitFreelasToken Test Suite
 * @dev Comprehensive tests for GitFreelasToken contract
 */
contract GitFreelasTokenTest is Test {
    GitFreelasToken public token;
    address public owner;
    address public gitFreelasContract;

    function setUp() public {
        owner = address(this);
        gitFreelasContract = makeAddr('gitFreelasContract');
        token = new GitFreelasToken('GitFreelasToken', 'GFT', gitFreelasContract);
    }

    function testInitialTokenDetails() public view {
        assertEq(token.name(), 'GitFreelasToken');
        assertEq(token.symbol(), 'GFT');
        assertEq(token.totalSupply(), 0);
        assertEq(token.gitfreelas(), gitFreelasContract);
    }

    function testMintingTokens() public {
        uint256 mintAmount = 1000 * 10 ** 18; // Assuming 18 decimals

        // Only GitFreelas contract can mint
        vm.prank(gitFreelasContract);
        token.mint(owner, mintAmount);

        assertEq(token.balanceOf(owner), mintAmount);
        assertEq(token.totalSupply(), mintAmount);
    }

    function testBurningTokens() public {
        uint256 mintAmount = 1000 * 10 ** 18; // Assuming 18 decimals

        // Mint tokens first
        vm.prank(gitFreelasContract);
        token.mint(owner, mintAmount);
        assertEq(token.balanceOf(owner), mintAmount);

        // Burn tokens
        vm.prank(gitFreelasContract);
        token.burnFrom(owner, mintAmount / 2);

        assertEq(token.balanceOf(owner), mintAmount / 2);
        assertEq(token.totalSupply(), mintAmount / 2);
    }

    function testOnlyGitFreelasCanMint() public {
        address nonOwner = address(0x123);
        vm.expectRevert('Only the GitFreelas contract can mint tokens');
        token.mint(nonOwner, 1000 * 10 ** 18);
    }

    function testOnlyGitFreelasCanBurn() public {
        address nonOwner = address(0x123);
        vm.expectRevert('Only the GitFreelas contract can burn tokens');
        token.burnFrom(nonOwner, 1000 * 10 ** 18);
    }

    function testBurnFromWithInsufficientBalance() public {
        uint256 mintAmount = 1000 * 10 ** 18; // Assuming 18 decimals

        // Mint tokens first
        vm.prank(gitFreelasContract);
        token.mint(owner, mintAmount);
        assertEq(token.balanceOf(owner), mintAmount);

        // Try to burn more than available
        vm.prank(gitFreelasContract);
        vm.expectRevert(); // Should revert with insufficient balance
        token.burnFrom(owner, mintAmount + 1);
    }

    function testBurnFromWithZeroAddress() public {
        uint256 mintAmount = 1000 * 10 ** 18; // Assuming 18 decimals

        // Mint tokens first
        vm.prank(gitFreelasContract);
        token.mint(owner, mintAmount);
        assertEq(token.balanceOf(owner), mintAmount);

        // Try to burn from zero address
        vm.prank(gitFreelasContract);
        vm.expectRevert(); // Should revert with invalid sender
        token.burnFrom(address(0), mintAmount);
    }

    function testBurnFromWithZeroAmount() public {
        uint256 mintAmount = 1000 * 10 ** 18; // Assuming 18 decimals

        // Mint tokens first
        vm.prank(gitFreelasContract);
        token.mint(owner, mintAmount);
        assertEq(token.balanceOf(owner), mintAmount);

        // Burning 0 should not revert
        vm.prank(gitFreelasContract);
        token.burnFrom(owner, 0);
    }
}
