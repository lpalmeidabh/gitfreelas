// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import '@openzeppelin/contracts/utils/Pausable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '../interfaces/IGitFreelas.sol';

/**
 * @title GitFreelasBase
 * @dev Abstract base contract implementing core GitFreelas functionality
 * @notice Contains shared logic, modifiers, and state management
 */
abstract contract GitFreelasBase is
    IGitFreelas,
    ReentrancyGuard,
    Pausable,
    Ownable
{
    // ============================================================================
    // CONSTANTS
    // ============================================================================

    uint256 public constant PLATFORM_FEE_PERCENTAGE = 3; // 3%
    uint256 public constant OVERDUE_PERIOD = 3 days;
    uint256 public constant OVERDUE_PENALTY_PER_DAY = 10; // 10% per day
    uint256 public constant MINIMUM_TASK_VALUE = 0.001 ether;

    // ============================================================================
    // STATE VARIABLES
    // ============================================================================

    // Task storage
    mapping(uint256 => Task) internal _tasks;
    mapping(string => uint256) internal _taskIdToIndex;
    uint256 internal _taskCounter;

    // Platform statistics
    uint256 internal _totalValueLocked;
    uint256 internal _totalValueProcessed;
    uint256 internal _platformFeesCollected;
    uint256 internal _completedTasks;

    // Platform fees available for withdrawal
    uint256 internal _availablePlatformFees;

    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================

    constructor(address initialOwner) Ownable(initialOwner) {
        // Contract starts unpaused
    }

    // ============================================================================
    // MODIFIERS
    // ============================================================================

    /**
     * @dev Modifier to check if task has specific status
     */
    modifier taskHasStatus(string calldata taskId, TaskStatus expectedStatus) {
        uint256 internalId = _taskIdToIndex[taskId];
        if (internalId == 0) revert TaskNotFound();
        if (_tasks[internalId].status != expectedStatus) {
            if (expectedStatus == TaskStatus.DEPOSITED)
                revert TaskNotDeposited();
            if (expectedStatus == TaskStatus.ACTIVE) revert TaskNotActive();
            if (expectedStatus == TaskStatus.COMPLETED)
                revert TaskAlreadyCompleted();
        }
        _;
    }

    /**
     * @dev Modifier to check if caller is task client
     */
    modifier onlyTaskClient(string calldata taskId) {
        uint256 internalId = _taskIdToIndex[taskId];
        if (internalId == 0) revert TaskNotFound();
        if (_tasks[internalId].client != msg.sender) revert NotTaskClient();
        _;
    }

    /**
     * @dev Modifier to check if caller is task developer
     */
    modifier onlyTaskDeveloper(string calldata taskId) {
        uint256 internalId = _taskIdToIndex[taskId];
        if (internalId == 0) revert TaskNotFound();
        if (_tasks[internalId].developer != msg.sender)
            revert NotTaskDeveloper();
        _;
    }

    /**
     * @dev Modifier to check if task hasn't expired
     */
    modifier taskNotExpired(string calldata taskId) {
        uint256 internalId = _taskIdToIndex[taskId];
        if (internalId == 0) revert TaskNotFound();
        if (_isTaskExpired(internalId)) revert TaskHasExpired();
        _;
    }

    /**
     * @dev Modifier to validate deadline
     */
    modifier validDeadline(uint256 deadline) {
        if (deadline <= block.timestamp) revert InvalidDeadline();
        _;
    }

    /**
     * @dev Modifier to validate task value
     */
    modifier validTaskValue(uint256 value) {
        if (value < MINIMUM_TASK_VALUE) revert InvalidTaskValue();
        _;
    }

    // ============================================================================
    // VIEW FUNCTIONS IMPLEMENTATION
    // ============================================================================

    function getTask(
        uint256 internalTaskId
    ) external view returns (Task memory) {
        if (internalTaskId == 0 || internalTaskId > _taskCounter)
            revert TaskNotFound();
        return _tasks[internalTaskId];
    }

    function getTaskByTaskId(
        string calldata taskId
    ) external view returns (Task memory) {
        uint256 internalId = _taskIdToIndex[taskId];
        if (internalId == 0) revert TaskNotFound();
        return _tasks[internalId];
    }

    function getInternalTaskId(
        string calldata taskId
    ) external view returns (uint256) {
        uint256 internalId = _taskIdToIndex[taskId];
        if (internalId == 0) revert TaskNotFound();
        return internalId;
    }

    /**
     * @dev Public implementation of taskExists (implements interface)
     */
    function taskExists(string calldata taskId) external view returns (bool) {
        return _taskExists(taskId);
    }

    function calculateTotalDeposit(
        uint256 taskValue
    ) public pure returns (uint256) {
        return taskValue + (taskValue * PLATFORM_FEE_PERCENTAGE) / 100;
    }

    function calculateOverduePenalty(
        uint256 internalTaskId
    ) public view returns (uint256) {
        if (internalTaskId == 0 || internalTaskId > _taskCounter)
            revert TaskNotFound();

        Task storage task = _tasks[internalTaskId];

        // Only calculate penalty if task allows overdue and is past deadline
        if (!task.allowOverdue || block.timestamp <= task.deadline) {
            return 0;
        }

        // Calculate overdue time
        uint256 overdueTime = block.timestamp - task.deadline;
        uint256 overdueDays = (overdueTime / 1 days) + 1; // +1 to count partial days

        // Cap at 3 days (30% max penalty)
        if (overdueDays > 3) overdueDays = 3;

        uint256 penaltyPercentage = overdueDays * OVERDUE_PENALTY_PER_DAY;
        return (task.taskValue * penaltyPercentage) / 100;
    }

    function isTaskOverdue(
        uint256 internalTaskId
    ) external view returns (bool) {
        if (internalTaskId == 0 || internalTaskId > _taskCounter) return false;

        Task storage task = _tasks[internalTaskId];
        return
            task.status == TaskStatus.ACTIVE && block.timestamp > task.deadline;
    }

    function isTaskExpired(
        uint256 internalTaskId
    ) external view returns (bool) {
        return _isTaskExpired(internalTaskId);
    }

    function getPlatformStats() external view returns (PlatformStats memory) {
        return
            PlatformStats({
                totalTasks: _taskCounter,
                completedTasks: _completedTasks,
                totalValueLocked: _totalValueLocked,
                totalValueProcessed: _totalValueProcessed,
                platformFeesCollected: _platformFeesCollected
            });
    }

    function getAvailablePlatformFees() external view returns (uint256) {
        return _availablePlatformFees;
    }

    function getTaskCount() external view returns (uint256) {
        return _taskCounter;
    }

    // ============================================================================
    // INTERNAL HELPER FUNCTIONS
    // ============================================================================

    /**
     * @dev Internal function to check if task exists
     */
    function _taskExists(string calldata taskId) internal view returns (bool) {
        return _taskIdToIndex[taskId] != 0;
    }

    /**
     * @dev Internal function to check if task has expired
     */
    function _isTaskExpired(
        uint256 internalTaskId
    ) internal view returns (bool) {
        if (internalTaskId == 0 || internalTaskId > _taskCounter) return false;

        Task storage task = _tasks[internalTaskId];

        // Task is expired if:
        // 1. It's in ACTIVE status and deadline has passed (if no overdue allowed)
        // 2. It's in ACTIVE status and deadline + overdue period has passed (if overdue allowed)
        // 3. It's in OVERDUE status and overdue period has ended
        if (task.status == TaskStatus.ACTIVE) {
            if (task.allowOverdue) {
                return block.timestamp > task.deadline + OVERDUE_PERIOD;
            } else {
                return block.timestamp > task.deadline;
            }
        }

        if (task.status == TaskStatus.OVERDUE) {
            return block.timestamp > task.deadline + OVERDUE_PERIOD;
        }

        return false;
    }

    /**
     * @dev Internal function to create a new task
     */
    function _createTask(
        string calldata taskId,
        uint256 deadline,
        bool allowOverdue,
        uint256 taskValue
    ) internal returns (uint256) {
        // Check if task already exists
        if (_taskExists(taskId)) revert TaskAlreadyExists();

        // Increment counter and create internal ID
        _taskCounter++;
        uint256 internalTaskId = _taskCounter;

        // Calculate total deposited amount
        uint256 totalDeposited = calculateTotalDeposit(taskValue);

        // Create task
        _tasks[internalTaskId] = Task({
            taskId: taskId,
            client: msg.sender,
            developer: address(0),
            taskValue: taskValue,
            totalDeposited: totalDeposited,
            deadline: deadline,
            allowOverdue: allowOverdue,
            status: TaskStatus.DEPOSITED,
            createdAt: block.timestamp,
            completedAt: 0
        });

        // Map external ID to internal ID
        _taskIdToIndex[taskId] = internalTaskId;

        // Update statistics
        _totalValueLocked += totalDeposited;

        // Emit event
        emit TaskCreated(
            internalTaskId,
            taskId,
            msg.sender,
            taskValue,
            totalDeposited,
            deadline,
            allowOverdue
        );

        return internalTaskId;
    }

    /**
     * @dev Internal function to accept developer for task
     */
    function _acceptDeveloper(
        string calldata taskId,
        address developerAddress
    ) internal {
        uint256 internalId = _taskIdToIndex[taskId];
        Task storage task = _tasks[internalId];

        // Assign developer and change status
        task.developer = developerAddress;
        task.status = TaskStatus.ACTIVE;

        // Emit event
        emit DeveloperAccepted(
            internalId,
            taskId,
            developerAddress,
            task.client
        );
    }

    /**
     * @dev Internal function to complete task and release payment
     */
    function _completeTask(string calldata taskId) internal {
        uint256 internalId = _taskIdToIndex[taskId];
        Task storage task = _tasks[internalId];

        // Calculate payment amounts
        uint256 penalty = calculateOverduePenalty(internalId);
        uint256 paymentAmount = task.taskValue - penalty;
        uint256 platformFee = (task.taskValue * PLATFORM_FEE_PERCENTAGE) / 100;

        // Update task status
        task.status = TaskStatus.COMPLETED;
        task.completedAt = block.timestamp;

        // Update statistics
        _totalValueLocked -= task.totalDeposited;
        _totalValueProcessed += task.totalDeposited;
        _completedTasks++;
        _platformFeesCollected += platformFee;
        _availablePlatformFees += platformFee;

        // Transfer payment to developer
        (bool success, ) = payable(task.developer).call{value: paymentAmount}(
            ''
        );
        if (!success) revert PaymentFailed();

        // Emit event
        emit TaskCompleted(
            internalId,
            taskId,
            task.developer,
            task.client,
            paymentAmount,
            platformFee
        );
    }

    /**
     * @dev Internal function to cancel task and refund client
     */
    function _cancelTask(
        string calldata taskId,
        string calldata reason
    ) internal {
        uint256 internalId = _taskIdToIndex[taskId];
        Task storage task = _tasks[internalId];

        // Calculate refund (full amount since no developer was paid)
        uint256 refundAmount = task.totalDeposited;

        // Update task status
        task.status = TaskStatus.CANCELLED;

        // Update statistics
        _totalValueLocked -= task.totalDeposited;

        // Refund client
        (bool success, ) = payable(task.client).call{value: refundAmount}('');
        if (!success) revert PaymentFailed();

        // Emit event
        emit TaskCancelled(
            internalId,
            taskId,
            task.client,
            refundAmount,
            reason
        );
    }

    /**
     * @dev Internal function to expire task and refund client
     */
    function _expireTask(uint256 internalId) internal {
        Task storage task = _tasks[internalId];

        // Calculate refund amount
        uint256 refundAmount;
        if (task.developer == address(0)) {
            // No developer applied, refund full amount
            refundAmount = task.totalDeposited;
        } else {
            // Developer applied but didn't complete, refund task value only
            refundAmount = task.taskValue;
            // Platform keeps the fee
            _platformFeesCollected +=
                (task.taskValue * PLATFORM_FEE_PERCENTAGE) /
                100;
            _availablePlatformFees +=
                (task.taskValue * PLATFORM_FEE_PERCENTAGE) /
                100;
        }

        // Update task status
        task.status = TaskStatus.EXPIRED;

        // Update statistics
        _totalValueLocked -= task.totalDeposited;

        // Refund client
        (bool success, ) = payable(task.client).call{value: refundAmount}('');
        if (!success) revert PaymentFailed();

        // Emit event
        emit TaskExpired(internalId, task.taskId, task.client, refundAmount);
    }

    // ============================================================================
    // ADMIN FUNCTIONS IMPLEMENTATION
    // ============================================================================

    function withdrawPlatformFees(
        address payable recipient
    ) external onlyOwner {
        if (_availablePlatformFees == 0) revert NoFeesToWithdraw();

        uint256 amount = _availablePlatformFees;
        _availablePlatformFees = 0;

        (bool success, ) = recipient.call{value: amount}('');
        if (!success) revert PaymentFailed();

        emit PlatformFeesWithdrawn(recipient, amount);
    }

    function processExpiredTasks(string[] calldata taskIds) external onlyOwner {
        for (uint256 i = 0; i < taskIds.length; i++) {
            uint256 internalId = _taskIdToIndex[taskIds[i]];
            if (internalId != 0 && _isTaskExpired(internalId)) {
                Task storage task = _tasks[internalId];
                if (
                    task.status == TaskStatus.ACTIVE ||
                    task.status == TaskStatus.OVERDUE
                ) {
                    _expireTask(internalId);
                }
            }
        }
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdraw(
        string calldata taskId
    ) external onlyOwner whenPaused {
        uint256 internalId = _taskIdToIndex[taskId];
        if (internalId == 0) revert TaskNotFound();

        Task storage task = _tasks[internalId];

        // Only client or developer can emergency withdraw
        if (msg.sender != task.client && msg.sender != task.developer) {
            revert NotAuthorized();
        }

        uint256 amount;
        if (msg.sender == task.client) {
            // Client gets refund
            amount = task.status == TaskStatus.DEPOSITED
                ? task.totalDeposited
                : task.taskValue;
        } else {
            // Developer gets payment (only if task was active)
            if (
                task.status != TaskStatus.ACTIVE &&
                task.status != TaskStatus.OVERDUE
            ) {
                revert NotAuthorized();
            }
            amount = task.taskValue;
        }

        // Mark as cancelled to prevent double withdrawal
        task.status = TaskStatus.CANCELLED;
        _totalValueLocked -= task.totalDeposited;

        (bool success, ) = payable(msg.sender).call{value: amount}('');
        if (!success) revert PaymentFailed();
    }
}
