// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Script} from 'forge-std/Script.sol';
import {console} from 'forge-std/console.sol';
import '../src/GitFreelas.sol';
import '../src/GitFreelasToken.sol';

/**
 * @title Deploy Script for GitFreelas
 * @dev Script to deploy GitFreelas contract to any network
 */
contract Deploy is Script {
    // Configuration
    address public deployer;
    address public contractOwner;
    GitFreelas public gitFreelas;

    function setUp() public {
        // Get deployer address from private key
        deployer = vm.addr(vm.envUint('PRIVATE_KEY'));

        // Get contract owner (can be same as deployer or different)
        contractOwner = vm.envOr('CONTRACT_OWNER', deployer);

        console.log('=== GitFreelas Deployment Configuration ===');
        console.log('Deployer address:', deployer);
        console.log('Contract owner:', contractOwner);
        console.log('Network:', block.chainid);
        console.log('============================================');
    }

    function run() external {
        // Start broadcasting transactions
        vm.startBroadcast(vm.envUint('PRIVATE_KEY'));

        console.log('Deploying GitFreelasToken contract...');

        // Deploy GFT token first with zero address (will be updated by GitFreelas contract)
        GitFreelasToken gftToken = new GitFreelasToken('GitFreelasToken', 'GFT', address(0));

        console.log('GFT Token deployed at:', address(gftToken));

        console.log('Deploying GitFreelas contract...');

        // Deploy GitFreelas contract
        gitFreelas = new GitFreelas(contractOwner, address(gftToken));

        console.log('GitFreelas deployed at:', address(gitFreelas));

        // Verify deployment
        console.log('Verifying deployment...');
        console.log(
            'Platform fee percentage:',
            gitFreelas.PLATFORM_FEE_PERCENTAGE()
        );
        console.log('Minimum task value:', gitFreelas.MINIMUM_TASK_VALUE());
        console.log('Overdue period (seconds):', gitFreelas.OVERDUE_PERIOD());
        console.log('Contract owner:', gitFreelas.owner());
        console.log('Contract paused:', gitFreelas.paused());

        // Stop broadcasting
        vm.stopBroadcast();

        console.log('=== Deployment Summary ===');
        console.log('Contract Address:', address(gitFreelas));
        console.log('Transaction Hash: Check your terminal output');
        console.log(
            'Etherscan: https://sepolia.etherscan.io/address/%s',
            address(gitFreelas)
        );
        console.log('===========================');

        // Save deployment info to file
        _saveDeploymentInfo();
    }

    /**
     * @dev Save deployment information to a JSON file
     */
    function _saveDeploymentInfo() internal {
        string memory deploymentInfo = string.concat(
            '{\n',
            '  "network": "sepolia",\n',
            '  "chainId": ',
            vm.toString(block.chainid),
            ',\n',
            '  "contractAddress": "',
            vm.toString(address(gitFreelas)),
            '",\n',
            '  "gftTokenAddress": "',
            vm.toString(address(gitFreelas.gftToken())),
            '",\n',
            '  "deployerAddress": "',
            vm.toString(deployer),
            '",\n',
            '  "contractOwner": "',
            vm.toString(contractOwner),
            '",\n',
            '  "platformFeePercentage": ',
            vm.toString(gitFreelas.PLATFORM_FEE_PERCENTAGE()),
            ',\n',
            '  "minimumTaskValue": "',
            vm.toString(gitFreelas.MINIMUM_TASK_VALUE()),
            '",\n',
            '  "overduePeriod": ',
            vm.toString(gitFreelas.OVERDUE_PERIOD()),
            ',\n',
            '  "deployedAt": ',
            vm.toString(block.timestamp),
            '\n',
            '}'
        );

        // Write to file (will be in broadcasts folder)
        vm.writeFile('./deployments/sepolia.json', deploymentInfo);
        console.log('Deployment info saved to ./deployments/sepolia.json');
    }
}
