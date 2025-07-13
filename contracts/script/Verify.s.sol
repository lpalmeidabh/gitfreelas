// script/Verify.s.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Script} from 'forge-std/Script.sol';
import {console} from 'forge-std/console.sol';
import '../src/GitFreelas.sol';

/**
 * @title Verify Script for GitFreelas
 * @dev Script to verify deployed GitFreelas contract on Etherscan
 */
contract Verify is Script {
    function run() external {
        // Get contract address from environment
        address contractAddress = vm.envAddress('CONTRACT_ADDRESS');
        address contractOwner = vm.envAddress('CONTRACT_OWNER');

        console.log('=== Contract Verification ===');
        console.log('Contract Address:', contractAddress);
        console.log('Constructor Args:', contractOwner);
        console.log('Network Chain ID:', block.chainid);
        console.log('=============================');

        // The actual verification is done via forge verify-contract command
        // This script just shows the information that would be used

        console.log('To verify manually, run:');
        console.log('forge verify-contract', contractAddress);
        console.log('src/GitFreelas.sol:GitFreelas');
        console.log('--chain-id', vm.toString(block.chainid));
        console.log(
            '--constructor-args $(cast abi-encode "constructor(address)" ',
            vm.toString(contractOwner),
            ')'
        );
        console.log('--etherscan-api-key $ETHERSCAN_API_KEY');
        console.log('--watch');
    }
}
