// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from 'forge-std/Test.sol';
import {console} from 'forge-std/console.sol';
import '../src/GitFreelas.sol';

/**
 * @title GitFreelas Test Suite
 * @dev Comprehensive tests for GitFreelas contract
 */
contract GitFreelasTe is Test {
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

    event DeveloperApplied(
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

    function test_Deployment() public {
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

    function test_CalculateTotalDeposit() public {
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

    function test_CreateTask_RefundsExcess() public {
        uint256 deadline = block.timestamp + DEADLINE_DELAY;
        uint256 excess = 0.1 ether;
        uint256 initialBalance = client.balance;

        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT + excess}(
            TASK_ID,
            deadline,
            false
        );

        // Should refund excess
        assertEq(client.balance, initialBalance - TOTAL_DEPOSIT);
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

    function test_CreateTask_RevertIf_InsufficientValue() public {
        uint256 deadline = block.timestamp + DEADLINE_DELAY;

        vm.prank(client);
        vm.expectRevert(IGitFreelas.InvalidTaskValue.selector);
        gitFreelas.createTask{value: 0.0001 ether}(TASK_ID, deadline, false);
    }

    function test_CreateTask_RevertIf_InsufficientDeposit() public {
        uint256 deadline = block.timestamp + DEADLINE_DELAY;

        vm.prank(client);
        vm.expectRevert(IGitFreelas.InsufficientDeposit.selector);
        gitFreelas.createTask{value: TASK_VALUE}(TASK_ID, deadline, false); // Missing platform fee
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
        vm.expectRevert('Pausable: paused');
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);
    }

    // ============================================================================
    // TASK APPLICATION TESTS
    // ============================================================================

    function test_ApplyToTask() public {
        // Create task first
        uint256 deadline = block.timestamp + DEADLINE_DELAY;
        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);

        // Expect event
        vm.expectEmit(true, true, true, true);
        emit DeveloperApplied(1, TASK_ID, developer, client);

        // Apply to task
        vm.prank(developer);
        gitFreelas.applyToTask(TASK_ID);

        // Verify application
        IGitFreelas.Task memory task = gitFreelas.getTaskByTaskId(TASK_ID);
        assertEq(task.developer, developer);
        assertEq(uint(task.status), uint(IGitFreelas.TaskStatus.ACTIVE));
    }

    function test_ApplyToTask_RevertIf_TaskNotFound() public {
        vm.prank(developer);
        vm.expectRevert(IGitFreelas.TaskNotFound.selector);
        gitFreelas.applyToTask('nonexistent');
    }

    function test_ApplyToTask_RevertIf_NotDeposited() public {
        // Create and apply to task first
        uint256 deadline = block.timestamp + DEADLINE_DELAY;
        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);

        vm.prank(developer);
        gitFreelas.applyToTask(TASK_ID);

        // Try to apply again
        vm.prank(otherUser);
        vm.expectRevert(IGitFreelas.TaskNotDeposited.selector);
        gitFreelas.applyToTask(TASK_ID);
    }

    function test_ApplyToTask_RevertIf_ClientTriesToApply() public {
        uint256 deadline = block.timestamp + DEADLINE_DELAY;
        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);

        vm.prank(client);
        vm.expectRevert(IGitFreelas.NotAuthorized.selector);
        gitFreelas.applyToTask(TASK_ID);
    }

    function test_ApplyToTask_RevertIf_TaskExpired() public {
        uint256 deadline = block.timestamp + DEADLINE_DELAY;
        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);

        // Fast forward past deadline + overdue period
        vm.warp(deadline + 4 days);

        vm.prank(developer);
        vm.expectRevert(IGitFreelas.TaskHasExpired.selector);
        gitFreelas.applyToTask(TASK_ID);
    }

    // ============================================================================
    // TASK COMPLETION TESTS
    // ============================================================================

    function test_CompleteTask() public {
        // Setup: Create task and apply
        uint256 deadline = block.timestamp + DEADLINE_DELAY;
        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);

        vm.prank(developer);
        gitFreelas.applyToTask(TASK_ID);

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

        vm.prank(developer);
        gitFreelas.applyToTask(TASK_ID);

        // Fast forward past deadline (1 day overdue)
        vm.warp(deadline + 1 days);

        uint256 initialDeveloperBalance = developer.balance;
        uint256 expectedPenalty = (TASK_VALUE * 10) / 100; // 10% for 1 day
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

        vm.prank(developer);
        gitFreelas.applyToTask(TASK_ID);

        // Try to complete as developer
        vm.prank(developer);
        vm.expectRevert(IGitFreelas.NotTaskClient.selector);
        gitFreelas.completeTask(TASK_ID);
    }

    function test_CompleteTask_RevertIf_TaskNotActive() public {
        uint256 deadline = block.timestamp + DEADLINE_DELAY;
        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);

        // Try to complete without developer
        vm.prank(client);
        vm.expectRevert(IGitFreelas.TaskNotActive.selector);
        gitFreelas.completeTask(TASK_ID);
    }

    // ============================================================================
    // TASK CANCELLATION TESTS
    // ============================================================================

    function test_CancelTask() public {
        uint256 deadline = block.timestamp + DEADLINE_DELAY;
        uint256 initialClientBalance = client.balance;

        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);

        // Cancel task
        vm.prank(client);
        gitFreelas.cancelTask(TASK_ID, 'Changed requirements');

        // Verify cancellation
        IGitFreelas.Task memory task = gitFreelas.getTaskByTaskId(TASK_ID);
        assertEq(uint(task.status), uint(IGitFreelas.TaskStatus.CANCELLED));

        // Verify refund
        assertEq(client.balance, initialClientBalance);
    }

    function test_CancelTask_RevertIf_DeveloperApplied() public {
        uint256 deadline = block.timestamp + DEADLINE_DELAY;
        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);

        vm.prank(developer);
        gitFreelas.applyToTask(TASK_ID);

        // Try to cancel after developer applied
        vm.prank(client);
        vm.expectRevert(IGitFreelas.TaskAlreadyHasDeveloper.selector);
        gitFreelas.cancelTask(TASK_ID, 'Too late');
    }

    // ============================================================================
    // OVERDUE TESTS
    // ============================================================================

    function test_UpdateTaskToOverdue() public {
        // Create task with overdue allowed
        uint256 deadline = block.timestamp + DEADLINE_DELAY;
        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, true);

        vm.prank(developer);
        gitFreelas.applyToTask(TASK_ID);

        // Fast forward past deadline
        vm.warp(deadline + 1 hours);

        // Update task to overdue
        gitFreelas.updateTaskToOverdue(TASK_ID);

        // Verify status change
        IGitFreelas.Task memory task = gitFreelas.getTaskByTaskId(TASK_ID);
        assertEq(uint(task.status), uint(IGitFreelas.TaskStatus.OVERDUE));
    }

    function test_CalculateOverduePenalty() public {
        // Create task and get to overdue state
        uint256 deadline = block.timestamp + DEADLINE_DELAY;
        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, true);

        vm.prank(developer);
        gitFreelas.applyToTask(TASK_ID);

        // Move to overdue
        vm.warp(deadline + 1 hours);
        gitFreelas.updateTaskToOverdue(TASK_ID);

        // Check penalty calculation
        uint256 penalty = gitFreelas.calculateOverduePenalty(1);
        uint256 expectedPenalty = (TASK_VALUE * 10) / 100; // 10% for 1 day
        assertEq(penalty, expectedPenalty);

        // Test 2 days overdue
        vm.warp(deadline + 2 days + 1 hours);
        penalty = gitFreelas.calculateOverduePenalty(1);
        expectedPenalty = (TASK_VALUE * 20) / 100; // 20% for 2 days
        assertEq(penalty, expectedPenalty);

        // Test max penalty (3 days)
        vm.warp(deadline + 5 days);
        penalty = gitFreelas.calculateOverduePenalty(1);
        expectedPenalty = (TASK_VALUE * 30) / 100; // 30% max
        assertEq(penalty, expectedPenalty);
    }

    // ============================================================================
    // ADMIN TESTS
    // ============================================================================

    function test_WithdrawPlatformFees() public {
        // Generate some fees by completing a task
        uint256 deadline = block.timestamp + DEADLINE_DELAY;
        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);

        vm.prank(developer);
        gitFreelas.applyToTask(TASK_ID);

        vm.prank(client);
        gitFreelas.completeTask(TASK_ID);

        uint256 initialBalance = feeRecipient.balance;

        // Withdraw fees
        vm.prank(owner);
        gitFreelas.withdrawPlatformFees(payable(feeRecipient));

        // Verify withdrawal
        assertEq(feeRecipient.balance, initialBalance + PLATFORM_FEE);
        assertEq(gitFreelas.getAvailablePlatformFees(), 0);
    }

    function test_WithdrawPlatformFees_RevertIf_NotOwner() public {
        vm.prank(client);
        vm.expectRevert('Ownable: caller is not the owner');
        gitFreelas.withdrawPlatformFees(payable(feeRecipient));
    }

    function test_Pause() public {
        vm.prank(owner);
        gitFreelas.pause();

        assertTrue(gitFreelas.paused());

        // Try to create task while paused
        uint256 deadline = block.timestamp + DEADLINE_DELAY;
        vm.prank(client);
        vm.expectRevert('Pausable: paused');
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);
    }

    function test_Unpause() public {
        vm.prank(owner);
        gitFreelas.pause();

        vm.prank(owner);
        gitFreelas.unpause();

        assertFalse(gitFreelas.paused());
    }

    // ============================================================================
    // VIEW FUNCTION TESTS
    // ============================================================================

    function test_GetTasksByClient() public {
        // Create multiple tasks
        uint256 deadline = block.timestamp + DEADLINE_DELAY;

        vm.startPrank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID_2, deadline, false);
        vm.stopPrank();

        // Get tasks by client
        (IGitFreelas.Task[] memory tasks, uint256 total) = gitFreelas
            .getTasksByClient(client, 0, 10);

        assertEq(total, 2);
        assertEq(tasks.length, 2);
        assertEq(tasks[0].client, client);
        assertEq(tasks[1].client, client);
    }

    function test_GetAvailableTasks() public {
        uint256 deadline = block.timestamp + DEADLINE_DELAY;

        // Create tasks
        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);

        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID_2, deadline, false);

        // Apply to one task
        vm.prank(developer);
        gitFreelas.applyToTask(TASK_ID);

        // Get available tasks
        (IGitFreelas.Task[] memory tasks, uint256 total) = gitFreelas
            .getAvailableTasks(0, 10);

        assertEq(total, 1); // Only one should be available
        assertEq(tasks[0].taskId, TASK_ID_2);
        assertEq(uint(tasks[0].status), uint(IGitFreelas.TaskStatus.DEPOSITED));
    }

    // ============================================================================
    // HELPER FUNCTIONS
    // ============================================================================

    function createTaskAndApply() internal returns (uint256 deadline) {
        deadline = block.timestamp + DEADLINE_DELAY;

        vm.prank(client);
        gitFreelas.createTask{value: TOTAL_DEPOSIT}(TASK_ID, deadline, false);

        vm.prank(developer);
        gitFreelas.applyToTask(TASK_ID);
    }

    // ============================================================================
    // FUZZ TESTS
    // ============================================================================

    function testFuzz_CreateTask(
        uint256 taskValue,
        uint256 deadlineDelay
    ) public {
        // Bound inputs
        taskValue = bound(
            taskValue,
            gitFreelas.MINIMUM_TASK_VALUE(),
            100 ether
        );
        deadlineDelay = bound(deadlineDelay, 1 hours, 365 days);

        uint256 deadline = block.timestamp + deadlineDelay;
        uint256 totalDeposit = gitFreelas.calculateTotalDeposit(taskValue);

        vm.deal(client, totalDeposit + 1 ether);

        vm.prank(client);
        gitFreelas.createTask{value: totalDeposit}(
            'fuzz-task',
            deadline,
            false
        );

        IGitFreelas.Task memory task = gitFreelas.getTaskByTaskId('fuzz-task');
        assertEq(task.taskValue, taskValue);
        assertEq(task.totalDeposited, totalDeposit);
        assertEq(task.deadline, deadline);
    }
}
