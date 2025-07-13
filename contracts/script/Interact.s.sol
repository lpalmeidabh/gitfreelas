// script/Interact.s.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Script} from 'forge-std/Script.sol';
import {console} from 'forge-std/console.sol';
import '../src/GitFreelas.sol';

/**
 * @title Interact Script for GitFreelas
 * @dev Script to interact with deployed GitFreelas contract
 */
contract Interact is Script {
    GitFreelas public gitFreelas;

    function setUp() public {
        address contractAddress = vm.envAddress('CONTRACT_ADDRESS');
        gitFreelas = GitFreelas(payable(contractAddress));
    }

    function run() external view {
        console.log('=== GitFreelas Contract Info ===');
        console.log('Contract Address:', address(gitFreelas));
        console.log('Owner:', gitFreelas.owner());
        console.log('Platform Fee:', gitFreelas.PLATFORM_FEE_PERCENTAGE(), '%');
        console.log('Minimum Task Value:', gitFreelas.MINIMUM_TASK_VALUE());
        console.log('Overdue Period:', gitFreelas.OVERDUE_PERIOD(), 'seconds');
        console.log('Paused:', gitFreelas.paused());
        console.log('');

        console.log('=== Platform Stats ===');
        IGitFreelas.PlatformStats memory stats = gitFreelas.getPlatformStats();
        console.log('Total Tasks:', stats.totalTasks);
        console.log('Completed Tasks:', stats.completedTasks);
        console.log('Total Value Locked:', stats.totalValueLocked);
        console.log('Total Value Processed:', stats.totalValueProcessed);
        console.log('Platform Fees Collected:', stats.platformFeesCollected);
        console.log(
            'Available Platform Fees:',
            gitFreelas.getAvailablePlatformFees()
        );
        console.log('===============================');
    }

    // Função para criar uma task de teste
    function createTestTask() external {
        vm.startBroadcast();

        string memory taskId = 'test-task-123';
        uint256 deadline = block.timestamp + 7 days;
        uint256 taskValue = 0.1 ether;
        uint256 totalDeposit = gitFreelas.calculateTotalDeposit(taskValue);

        console.log('Creating test task...');
        console.log('Task ID:', taskId);
        console.log('Task Value:', taskValue);
        console.log('Total Deposit:', totalDeposit);

        gitFreelas.createTask{value: totalDeposit}(taskId, deadline, false);

        console.log('Test task created successfully!');

        vm.stopBroadcast();
    }
}
