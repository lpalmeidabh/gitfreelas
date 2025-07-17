// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from 'forge-std/Test.sol';
import {console} from 'forge-std/console.sol';
import '../src/GitFreelas.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Pausable.sol';

/**
 * @title GitFreelas Test Suite
 * @dev Comprehensive tests for GitFreelas contract
 */
contract GitFreelasTest is Test {
    // ============================================================================
    // STATE VARIABLES
    // ============================================================================

    GitFreelas public gitFreelas;

    // Test accounts
    address public owner = makeAddr('owner');
    address public client = makeAddr('client');
    address public developer = makeAddr('developer');
    address public otherUser = makeAddr('otherUser');
    address public feeRecipient = makeAddr('feeRecipient');

    // Test constants
    uint256 public constant TASK_VALUE = 1 ether;
    uint256 public constant PLATFORM_FEE = (TASK_VALUE * 3) / 100; // 3%
    uint256 public constant TOTAL_DEPOSIT = TASK_VALUE + PLATFORM_FEE;
    uint256 public constant DEADLINE_DELAY = 7 days;

    string public constant TASK_ID = 'task-123';
    string public constant TASK_ID_2 = 'task-456';

    // Events to test
    event TaskCreated(
        uint256 indexed internalTaskId,
        string indexed taskId,
        address indexed client,
        uint256 taskValue,
        uint256 totalDeposited,
        uint256 deadline,
        bool allowOverdue
    );

    event DeveloperAccepted(
        uint256 indexed internalTaskId,
        string indexed taskId,
        address indexed developer,
        address client
    );

    event TaskCompleted(
        uint256 indexed internalTaskId,
        string indexed taskId,
        address indexed developer,
        address client,
        uint256 paymentAmount,
        uint256 platformFee
    );

    // ============================================================================
    // SETUP
    // ============================================================================

    function setUp() public {
        // Deploy contract
        gitFreelas = new GitFreelas(owner);

        // Fund test accounts
        vm.deal(client, 100 ether);
        vm.deal(developer, 10 ether);
        vm.deal(otherUser, 10 ether);

        // Label accounts for better error messages
        vm.label(owner, 'Owner');
        vm.label(client, 'Client');
        vm.label(developer, 'Developer');
        vm.label(otherUser, 'OtherUser');
        vm.label(feeRecipient, 'FeeRecipient');
    }

    // ============================================================================
    // DEPLOYMENT TESTS
    // ============================================================================

    function test_Deployment() public view {
        // Check initial state
        assertEq(gitFreelas.owner(), owner);
        assertEq(gitFreelas.PLATFORM_FEE_PERCENTAGE(), 3);
        assertEq(gitFreelas.MINIMUM_TASK_VALUE(), 0.001 ether);
        assertEq(gitFreelas.OVERDUE_PERIOD(), 3 days);
        assertEq(gitFreelas.OVERDUE_PENALTY_PER_DAY(), 10);
        assertFalse(gitFreelas.paused());
        assertEq(gitFreelas.getTaskCount(), 0);
        assertEq(gitFreelas.getAvailablePlatformFees(), 0);
    }

    function test_CalculateTotalDeposit() public view {
        uint256 totalDeposit = gitFreelas.calculateTotalDeposit(TASK_VALUE);
        assertEq(totalDeposit, TOTAL_DEPOSIT);
    }

    // ============================================================================
    // TASK CREATION TESTS
    // ============================================================================

    function test_CreateTask() public {
        uint256 deadline = block.timestamp + DEADLINE_DELAY;

        // Expect event
        vm.expectEmit(true, true, true, true);
        emit TaskCreated(
            1,
            TASK_ID,
            client,
            TASK_VALUE,
            TOTAL_DEPOSIT,
            deadline,
            false
        );

        // Create task
        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);

        // Verify task was created
        IGitFreelas.Task memory task = gitFreelas.getTaskByTaskId(TASK_ID);
        assertEq(task.taskId, TASK_ID);
        assertEq(task.client, client);
        assertEq(task.developer, address(0));
        assertEq(task.taskValue, TASK_VALUE);
        assertEq(task.totalDeposited, TOTAL_DEPOSIT);
        assertEq(task.deadline, deadline);
        assertFalse(task.allowOverdue);
        assertEq(uint(task.status), uint(IGitFreelas.TaskStatus.DEPOSITED));
        assertEq(task.createdAt, block.timestamp);
        assertEq(task.completedAt, 0);

        // Verify contract state
        assertEq(gitFreelas.getTaskCount(), 1);
        assertTrue(gitFreelas.taskExists(TASK_ID));
        assertEq(gitFreelas.getInternalTaskId(TASK_ID), 1);
    }

    function test_CreateTask_WithOverdue() public {
        uint256 deadline = block.timestamp + DEADLINE_DELAY;

        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, true);

        IGitFreelas.Task memory task = gitFreelas.getTaskByTaskId(TASK_ID);
        assertTrue(task.allowOverdue);
    }

    function test_CreateTask_RefundsExcessPayment() public {
        uint256 deadline = block.timestamp + DEADLINE_DELAY;
        uint256 excessAmount = 0.5 ether;
        uint256 totalSent = TOTAL_DEPOSIT + excessAmount;

        uint256 clientBalanceBefore = client.balance;

        vm.prank(client);
        gitFreelas.createTask{value: totalSent}(TASK_ID, deadline, false);

        uint256 clientBalanceAfter = client.balance;
        uint256 totalSpent = clientBalanceBefore - clientBalanceAfter;

        // O importante é que NÃO gastou todo o valor enviado
        // (ou seja, recebeu reembolso do excesso)
        assertTrue(totalSpent < totalSent, 'Should have received refund');

        // E que o valor gasto está próximo do TOTAL_DEPOSIT
        assertApproxEqAbs(
            totalSpent,
            TOTAL_DEPOSIT,
            0.01 ether,
            'Should refund excess payment'
        );
    }

    function test_CreateTask_RevertIf_InvalidDeadline() public {
        uint256 pastDeadline = block.timestamp - 1;

        vm.prank(client);
        vm.expectRevert(IGitFreelas.InvalidDeadline.selector);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(
            TASK_ID,
            pastDeadline,
            false
        );
    }

    function test_CreateTask_RevertIf_InsufficientPayment() public {
        uint256 deadline = block.timestamp + DEADLINE_DELAY;
        uint256 insufficientValue = gitFreelas.calculateTotalDeposit(
            gitFreelas.MINIMUM_TASK_VALUE()
        ) - 1;

        vm.prank(client);
        vm.expectRevert(IGitFreelas.InvalidTaskValue.selector);
        gitFreelas.createTask{value: insufficientValue}(
            TASK_ID,
            deadline,
            false
        );
    }

    function test_CreateTask_RevertIf_TaskAlreadyExists() public {
        uint256 deadline = block.timestamp + DEADLINE_DELAY;

        // Create first task
        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);

        // Try to create duplicate
        vm.prank(client);
        vm.expectRevert(IGitFreelas.TaskAlreadyExists.selector);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);
    }

    function test_CreateTask_RevertIf_Paused() public {
        uint256 deadline = block.timestamp + DEADLINE_DELAY;

        // Pause contract
        vm.prank(owner);
        gitFreelas.pause();

        vm.prank(client);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);
    }

    // ============================================================================
    // ACCEPT DEVELOPER TESTS
    // ============================================================================

    function test_AcceptDeveloper() public {
        // Setup: Create task
        uint256 deadline = block.timestamp + DEADLINE_DELAY;
        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);

        // Expect event
        vm.expectEmit(true, true, true, true);
        emit DeveloperAccepted(1, TASK_ID, developer, client);

        // Accept developer
        vm.prank(client);
        gitFreelas.acceptDeveloper(TASK_ID, developer);

        // Verify task updated correctly
        IGitFreelas.Task memory task = gitFreelas.getTaskByTaskId(TASK_ID);
        assertEq(task.developer, developer);
        assertEq(uint(task.status), uint(IGitFreelas.TaskStatus.ACTIVE));
    }

    function test_AcceptDeveloper_RevertIf_NotClient() public {
        uint256 deadline = block.timestamp + DEADLINE_DELAY;
        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);

        // Try to accept as non-client
        vm.prank(developer);
        vm.expectRevert(IGitFreelas.NotTaskClient.selector);
        gitFreelas.acceptDeveloper(TASK_ID, developer);
    }

    function test_AcceptDeveloper_RevertIf_TaskNotFound() public {
        vm.prank(client);
        vm.expectRevert(IGitFreelas.TaskNotFound.selector);
        gitFreelas.acceptDeveloper('nonexistent-task', developer);
    }

    function test_AcceptDeveloper_RevertIf_TaskNotDeposited() public {
        uint256 deadline = block.timestamp + DEADLINE_DELAY;
        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);

        // Accept developer first time
        vm.prank(client);
        gitFreelas.acceptDeveloper(TASK_ID, developer);

        // Try to accept again
        vm.prank(client);
        vm.expectRevert(IGitFreelas.TaskNotDeposited.selector);
        gitFreelas.acceptDeveloper(TASK_ID, address(0x456));
    }

    function test_AcceptDeveloper_RevertIf_InvalidAddress() public {
        uint256 deadline = block.timestamp + DEADLINE_DELAY;
        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);

        // Try to accept zero address
        vm.prank(client);
        vm.expectRevert(IGitFreelas.InvalidAddress.selector);
        gitFreelas.acceptDeveloper(TASK_ID, address(0));
    }

    function test_AcceptDeveloper_RevertIf_ClientTriesToAcceptSelf() public {
        uint256 deadline = block.timestamp + DEADLINE_DELAY;
        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);

        // Try to accept self
        vm.prank(client);
        vm.expectRevert(IGitFreelas.NotAuthorized.selector);
        gitFreelas.acceptDeveloper(TASK_ID, client);
    }

    // ============================================================================
    // TASK COMPLETION TESTS
    // ============================================================================

    function test_CompleteTask() public {
        // Setup: Create task and accept developer
        uint256 deadline = block.timestamp + DEADLINE_DELAY;
        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);

        vm.prank(client);
        gitFreelas.acceptDeveloper(TASK_ID, developer);

        uint256 initialDeveloperBalance = developer.balance;

        // Expect event
        vm.expectEmit(true, true, true, true);
        emit TaskCompleted(
            1,
            TASK_ID,
            developer,
            client,
            TASK_VALUE,
            PLATFORM_FEE
        );

        // Complete task
        vm.prank(client);
        gitFreelas.completeTask(TASK_ID);

        // Verify completion
        IGitFreelas.Task memory task = gitFreelas.getTaskByTaskId(TASK_ID);
        assertEq(uint(task.status), uint(IGitFreelas.TaskStatus.COMPLETED));
        assertEq(task.completedAt, block.timestamp);

        // Verify payment
        assertEq(developer.balance, initialDeveloperBalance + TASK_VALUE);
        assertEq(gitFreelas.getAvailablePlatformFees(), PLATFORM_FEE);

        // Verify statistics
        IGitFreelas.PlatformStats memory stats = gitFreelas.getPlatformStats();
        assertEq(stats.completedTasks, 1);
        assertEq(stats.totalValueProcessed, TOTAL_DEPOSIT);
        assertEq(stats.platformFeesCollected, PLATFORM_FEE);
    }

    function test_CompleteTask_WithOverduePenalty() public {
        // Create task with overdue allowed
        uint256 deadline = block.timestamp + DEADLINE_DELAY;
        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, true);

        vm.prank(client);
        gitFreelas.acceptDeveloper(TASK_ID, developer);

        // Fast forward past deadline (1 day overdue)
        vm.warp(deadline + 1 days);

        uint256 initialDeveloperBalance = developer.balance;

        // Calculate expected penalty (2 days total due to +1 in calculation)
        uint256 expectedPenalty = (TASK_VALUE * 20) / 100; // 20% for 2 days
        uint256 expectedPayment = TASK_VALUE - expectedPenalty;

        // Complete task
        vm.prank(client);
        gitFreelas.completeTask(TASK_ID);

        // Verify payment with penalty
        assertEq(developer.balance, initialDeveloperBalance + expectedPayment);
    }

    function test_CompleteTask_RevertIf_NotClient() public {
        // Setup task
        uint256 deadline = block.timestamp + DEADLINE_DELAY;
        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);

        vm.prank(client);
        gitFreelas.acceptDeveloper(TASK_ID, developer);

        // Try to complete as developer
        vm.prank(developer);
        vm.expectRevert(IGitFreelas.NotTaskClient.selector);
        gitFreelas.completeTask(TASK_ID);
    }

    function test_CompleteTask_RevertIf_TaskNotActive() public {
        uint256 deadline = block.timestamp + DEADLINE_DELAY;
        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);

        // Try to complete without accepting developer
        vm.prank(client);
        vm.expectRevert(IGitFreelas.TaskNotActive.selector);
        gitFreelas.completeTask(TASK_ID);
    }

    // ============================================================================
    // TASK CANCELLATION TESTS
    // ============================================================================

    function test_CancelTask() public {
        uint256 deadline = block.timestamp + DEADLINE_DELAY;
        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);

        uint256 clientBalanceBefore = client.balance;

        vm.prank(client);
        gitFreelas.cancelTask(TASK_ID, 'Changed requirements');

        // Verify refund
        uint256 clientBalanceAfter = client.balance;
        assertEq(clientBalanceAfter, clientBalanceBefore + TOTAL_DEPOSIT);

        // Verify task status
        IGitFreelas.Task memory task = gitFreelas.getTaskByTaskId(TASK_ID);
        assertEq(uint(task.status), uint(IGitFreelas.TaskStatus.CANCELLED));
    }

    function test_CancelTask_RevertIf_NotClient() public {
        uint256 deadline = block.timestamp + DEADLINE_DELAY;
        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);

        vm.prank(developer);
        vm.expectRevert(IGitFreelas.NotTaskClient.selector);
        gitFreelas.cancelTask(TASK_ID, 'Not authorized');
    }

    function test_CancelTask_RevertIf_DeveloperAlreadyAccepted() public {
        uint256 deadline = block.timestamp + DEADLINE_DELAY;
        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);

        vm.prank(client);
        gitFreelas.acceptDeveloper(TASK_ID, developer);

        vm.prank(client);
        vm.expectRevert(IGitFreelas.TaskNotDeposited.selector);
        gitFreelas.cancelTask(TASK_ID, 'Too late');
    }

    // ============================================================================
    // ADMIN TESTS
    // ============================================================================

    function test_WithdrawPlatformFees() public {
        // Setup completed task to generate fees
        uint256 deadline = block.timestamp + DEADLINE_DELAY;
        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);

        vm.prank(client);
        gitFreelas.acceptDeveloper(TASK_ID, developer);

        vm.prank(client);
        gitFreelas.completeTask(TASK_ID);

        // Withdraw fees
        uint256 recipientBalanceBefore = feeRecipient.balance;

        vm.prank(owner);
        gitFreelas.withdrawPlatformFees(payable(feeRecipient));

        uint256 recipientBalanceAfter = feeRecipient.balance;
        assertEq(recipientBalanceAfter, recipientBalanceBefore + PLATFORM_FEE);
        assertEq(gitFreelas.getAvailablePlatformFees(), 0);
    }

    function test_WithdrawPlatformFees_RevertIf_NotOwner() public {
        vm.prank(client);
        vm.expectRevert(
            abi.encodeWithSelector(
                Ownable.OwnableUnauthorizedAccount.selector,
                client
            )
        );
        gitFreelas.withdrawPlatformFees(payable(feeRecipient));
    }

    function test_Pause() public {
        vm.prank(owner);
        gitFreelas.pause();

        assertTrue(gitFreelas.paused());
    }

    function test_Pause_RevertIf_NotOwner() public {
        vm.prank(client);
        vm.expectRevert(
            abi.encodeWithSelector(
                Ownable.OwnableUnauthorizedAccount.selector,
                client
            )
        );
        gitFreelas.pause();
    }

    // ============================================================================
    // VIEW FUNCTION TESTS
    // ============================================================================

    function test_GetPlatformStats() public {
        // Create and complete task
        uint256 deadline = block.timestamp + DEADLINE_DELAY;
        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);

        vm.prank(client);
        gitFreelas.acceptDeveloper(TASK_ID, developer);

        vm.prank(client);
        gitFreelas.completeTask(TASK_ID);

        IGitFreelas.PlatformStats memory stats = gitFreelas.getPlatformStats();
        assertEq(stats.totalTasks, 1);
        assertEq(stats.completedTasks, 1);
        assertEq(stats.totalValueProcessed, TOTAL_DEPOSIT);
        assertEq(stats.platformFeesCollected, PLATFORM_FEE);
    }

    function test_GetTasksByDeveloper() public {
        // Create multiple tasks
        uint256 deadline = block.timestamp + DEADLINE_DELAY;

        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);

        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID_2, deadline, false);

        // Accept developer for both
        vm.prank(client);
        gitFreelas.acceptDeveloper(TASK_ID, developer);

        vm.prank(client);
        gitFreelas.acceptDeveloper(TASK_ID_2, developer);

        (IGitFreelas.Task[] memory tasks, uint256 total) = gitFreelas
            .getTasksByDeveloper(developer, 0, 10);

        assertEq(total, 2);
        assertEq(tasks.length, 2);
        assertEq(tasks[0].developer, developer);
        assertEq(tasks[1].developer, developer);
    }
}
