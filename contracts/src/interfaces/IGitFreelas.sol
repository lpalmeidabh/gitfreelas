// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title IGitFreelas
 * @dev Interface for the GitFreelas freelancing platform
 * @notice This contract manages crypto payments for GitHub-based development tasks
 */
interface IGitFreelas {
    // ============================================================================
    // ENUMS
    // ============================================================================

    /**
     * @dev Task status enum - represents the current state of a task
     */
    enum TaskStatus {
        DEPOSITED, // Task created and value deposited, waiting for developer
        ACTIVE, // Developer applied and accepted, work in progress
        OVERDUE, // Deadline passed, overdue period active (if allowed)
        COMPLETED, // Task completed and payment released
        CANCELLED, // Task cancelled and refunded (before developer applied)
        EXPIRED // Task expired definitively (overdue period ended)
    }

    // ============================================================================
    // STRUCTS
    // ============================================================================

    /**
     * @dev Main task structure stored on-chain
     * @notice Only essential data is stored to minimize gas costs
     */
    struct Task {
        string taskId; // External task ID (reference to frontend database)
        address client; // Client wallet address
        address developer; // Developer wallet address (address(0) if not applied)
        uint256 taskValue; // Task value in wei (without platform fee)
        uint256 totalDeposited; // Total deposited amount (taskValue + 3% platform fee)
        uint256 deadline; // Task deadline timestamp
        bool allowOverdue; // Whether task allows 3 extra days with penalty
        TaskStatus status; // Current task status
        uint256 createdAt; // Task creation timestamp
        uint256 completedAt; // Task completion timestamp (0 if not completed)
    }

    /**
     * @dev Platform statistics structure
     */
    struct PlatformStats {
        uint256 totalTasks; // Total number of tasks created
        uint256 completedTasks; // Number of completed tasks
        uint256 totalValueLocked; // Total ETH currently locked in tasks
        uint256 totalValueProcessed; // Total ETH processed through platform
        uint256 platformFeesCollected; // Total platform fees collected
    }

    // ============================================================================
    // EVENTS
    // ============================================================================

    /**
     * @dev Emitted when a new task is created and value is deposited
     */
    event TaskCreated(
        uint256 indexed internalTaskId,
        string indexed taskId,
        address indexed client,
        uint256 taskValue,
        uint256 totalDeposited,
        uint256 deadline,
        bool allowOverdue
    );

    /**
     * @dev Emitted when a developer applies to a task
     */
    event DeveloperApplied(
        uint256 indexed internalTaskId,
        string indexed taskId,
        address indexed developer,
        address client
    );

    /**
     * @dev Emitted when a task is completed and payment is released
     */
    event TaskCompleted(
        uint256 indexed internalTaskId,
        string indexed taskId,
        address indexed developer,
        address client,
        uint256 paymentAmount,
        uint256 platformFee
    );

    /**
     * @dev Emitted when a task is cancelled and refunded
     */
    event TaskCancelled(
        uint256 indexed internalTaskId,
        string indexed taskId,
        address indexed client,
        uint256 refundAmount,
        string reason
    );

    /**
     * @dev Emitted when a task enters overdue period
     */
    event TaskOverdue(
        uint256 indexed internalTaskId,
        string indexed taskId,
        address indexed developer,
        uint256 overdueStartTime
    );

    /**
     * @dev Emitted when a task expires definitively
     */
    event TaskExpired(
        uint256 indexed internalTaskId,
        string indexed taskId,
        address indexed client,
        uint256 refundAmount
    );

    /**
     * @dev Emitted when platform fees are withdrawn
     */
    event PlatformFeesWithdrawn(address indexed recipient, uint256 amount);

    // ============================================================================
    // ERRORS
    // ============================================================================

    // Task Creation Errors
    error InvalidTaskValue();
    error InvalidDeadline();
    error TaskAlreadyExists();
    error InsufficientDeposit();

    // Task State Errors
    error TaskNotFound();
    error TaskNotActive();
    error TaskNotDeposited();
    error TaskAlreadyHasDeveloper();
    error TaskAlreadyCompleted();
    error TaskHasExpired();

    // Permission Errors
    error NotTaskClient();
    error NotTaskDeveloper();
    error NotAuthorized();
    error InvalidAddress();

    // Timing Errors
    error DeadlineNotReached();
    error OverdueNotAllowed();
    error OverduePeriodEnded();

    // Payment Errors
    error PaymentFailed();
    error InsufficientBalance();
    error NoFeesToWithdraw();

    // ============================================================================
    // CONSTANTS & CONFIGURATION
    // ============================================================================

    /**
     * @dev Platform fee percentage (3%)
     */
    function PLATFORM_FEE_PERCENTAGE() external pure returns (uint256);

    /**
     * @dev Overdue period duration in seconds (3 days)
     */
    function OVERDUE_PERIOD() external pure returns (uint256);

    /**
     * @dev Overdue penalty percentage per day (10%)
     */
    function OVERDUE_PENALTY_PER_DAY() external pure returns (uint256);

    /**
     * @dev Minimum task value in wei
     */
    function MINIMUM_TASK_VALUE() external pure returns (uint256);

    // ============================================================================
    // VIEW FUNCTIONS
    // ============================================================================

    /**
     * @dev Get task by internal ID
     */
    function getTask(
        uint256 internalTaskId
    ) external view returns (Task memory);

    /**
     * @dev Get task by external task ID
     */
    function getTaskByTaskId(
        string calldata taskId
    ) external view returns (Task memory);

    /**
     * @dev Get internal task ID by external task ID
     */
    function getInternalTaskId(
        string calldata taskId
    ) external view returns (uint256);

    /**
     * @dev Check if task exists
     */
    function taskExists(string calldata taskId) external view returns (bool);

    /**
     * @dev Calculate total deposit amount (task value + platform fee)
     */
    function calculateTotalDeposit(
        uint256 taskValue
    ) external pure returns (uint256);

    /**
     * @dev Calculate overdue penalty for a task
     */
    function calculateOverduePenalty(
        uint256 internalTaskId
    ) external view returns (uint256);

    /**
     * @dev Check if task is overdue
     */
    function isTaskOverdue(uint256 internalTaskId) external view returns (bool);

    /**
     * @dev Check if task has expired (overdue period ended)
     */
    function isTaskExpired(uint256 internalTaskId) external view returns (bool);

    /**
     * @dev Get platform statistics
     */
    function getPlatformStats() external view returns (PlatformStats memory);

    /**
     * @dev Get total platform fees available for withdrawal
     */
    function getAvailablePlatformFees() external view returns (uint256);

    /**
     * @dev Get task count
     */
    function getTaskCount() external view returns (uint256);

    // ============================================================================
    // MAIN FUNCTIONS
    // ============================================================================

    /**
     * @dev Create a new task and deposit funds
     * @param taskId External task ID from frontend database
     * @param deadline Task deadline timestamp
     * @param allowOverdue Whether to allow 3 extra days with penalty
     */
    function createTask(
        string calldata taskId,
        uint256 deadline,
        bool allowOverdue
    ) external payable;

    function acceptDeveloper(
        string calldata taskId,
        address developerAddress
    ) external;
    /**
     * @dev Mark task as completed and release payment
     * @param taskId External task ID
     */
    function completeTask(string calldata taskId) external;

    /**
     * @dev Cancel task and refund client (only before developer applies)
     * @param taskId External task ID
     * @param reason Cancellation reason
     */
    function cancelTask(
        string calldata taskId,
        string calldata reason
    ) external;

    // ============================================================================
    // ADMIN FUNCTIONS
    // ============================================================================

    /**
     * @dev Withdraw accumulated platform fees (only owner)
     * @param recipient Address to receive the fees
     */
    function withdrawPlatformFees(address payable recipient) external;

    /**
     * @dev Emergency function to mark expired tasks and refund clients
     * @param taskIds Array of external task IDs to check
     */
    function processExpiredTasks(string[] calldata taskIds) external;

    /**
     * @dev Pause contract (emergency only)
     */
    function pause() external;

    /**
     * @dev Unpause contract
     */
    function unpause() external;

    // ============================================================================
    // EMERGENCY FUNCTIONS
    // ============================================================================

    /**
     * @dev Emergency withdrawal for specific task (only if contract is paused)
     * @param taskId External task ID
     */
    function emergencyWithdraw(string calldata taskId) external;
}
