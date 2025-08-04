// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import './abstract/GitFreelasBase.sol';
import './GitFreelasToken.sol';

/**
 * @title GitFreelas
 * @dev Main GitFreelas contract implementing the freelancing platform
 * @notice This contract handles crypto payments for GitHub-based development tasks
 * @author GitFreelas Team
 */
contract GitFreelas is GitFreelasBase {
    // ============================================================================
    // STATE VARIABLES
    // ============================================================================

    GitFreelasToken public immutable gftToken;
    uint256 public constant GFT_REWARD_AMOUNT = 100 * 10**18; // 100 GFT tokens
    uint256 public constant VIGILANCE_BADGE_COST = 50 * 10**18; // 50 GFT tokens
    uint256 public constant VIGILANCE_BADGE_DURATION = 72 hours; // 72 hours

    // Mapping to track vigilance badge holders
    mapping(address => uint256) public vigilanceBadgeExpiry;

    // ============================================================================
    // EVENTS
    // ============================================================================

    /**
     * @dev Emitted when contract is deployed
     */
    event GitFreelasPlatformDeployed(
        address indexed owner,
        uint256 platformFeePercentage,
        uint256 minimumTaskValue,
        uint256 timestamp
    );

    /**
     * @dev Event for completion requests
     */
    event DeveloperRequestedCompletion(
        uint256 indexed internalTaskId,
        string indexed taskId,
        address indexed developer,
        address client
    );

    /**
     * @dev Emitted when GFT tokens are distributed
     */
    event GFTTokensDistributed(
        address indexed recipient,
        uint256 amount,
        string indexed taskId
    );

    /**
     * @dev Emitted when vigilance badge is acquired
     */
    event VigilanceBadgeAcquired(
        address indexed user,
        uint256 expiryTime
    );

    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================

    /**
     * @dev Deploy the GitFreelas contract
     * @param initialOwner Address that will own the contract (can pause, withdraw fees)
     * @param gftTokenAddress Address of the GFT token contract
     */
        constructor(
        address initialOwner,
        address gftTokenAddress
    ) GitFreelasBase(initialOwner) {
        gftToken = GitFreelasToken(gftTokenAddress);

        // Update the token's GitFreelas address to point to this contract
        gftToken.updateGitFreelasAddress(address(this));

        // Emit deployment event for indexing
        emit GitFreelasPlatformDeployed(
            initialOwner,
            PLATFORM_FEE_PERCENTAGE,
            MINIMUM_TASK_VALUE,
            block.timestamp
        );
    }

    // ============================================================================
    // MAIN FUNCTIONS IMPLEMENTATION
    // ============================================================================

    /**
     * @dev Create a new task and deposit funds
     * @param taskId External task ID from frontend database
     * @param deadline Task deadline timestamp
     * @param allowOverdue Whether to allow 3 extra days with penalty
     * @notice msg.value should be taskValue + 3% platform fee
     */
    function createTask(
        string calldata taskId,
        uint256 deadline,
        bool allowOverdue
    )
        external
        payable
        override
        nonReentrant
        whenNotPaused
        validDeadline(deadline)
    {
        // Verificar se msg.value é suficiente para pelo menos o valor mínimo + taxa
        uint256 minimumTotalDeposit = calculateTotalDeposit(MINIMUM_TASK_VALUE);
        if (msg.value < minimumTotalDeposit) revert InvalidTaskValue();

        // Calcular taskValue a partir do valor total depositado
        // msg.value = taskValue + (taskValue * 3 / 100) = taskValue * 103 / 100
        // taskValue = msg.value * 100 / 103
        uint256 taskValue = (msg.value * 100) / (100 + PLATFORM_FEE_PERCENTAGE);

        // Verificar se o taskValue calculado ainda atende ao mínimo
        if (taskValue < MINIMUM_TASK_VALUE) revert InvalidTaskValue();

        // Criar a tarefa
        _createTask(taskId, deadline, allowOverdue, taskValue);

        // Refund qualquer excesso
        uint256 exactTotalDeposit = calculateTotalDeposit(taskValue);
        uint256 excess = msg.value - exactTotalDeposit;
        if (excess > 0) {
            (bool success, ) = payable(msg.sender).call{value: excess}('');
            if (!success) revert PaymentFailed();
        }
    }

    /**
     * @dev Accept a developer for a task (called by client)
     * @param taskId External task ID
     * @param developerAddress Address of the developer to accept
     */
    function acceptDeveloper(
        string calldata taskId,
        address developerAddress
    ) external override nonReentrant whenNotPaused onlyTaskClient(taskId) {
        uint256 internalId = _taskIdToIndex[taskId];
        Task storage task = _tasks[internalId];

        // Task client must be the one calling this function
        if (msg.sender != task.client) revert NotAuthorized();

        // Task must be in DEPOSITED status (no developer assigned yet)
        if (task.status != TaskStatus.DEPOSITED) revert TaskNotDeposited();

        // Ensure no developer has been assigned yet
        if (task.developer != address(0)) revert TaskAlreadyHasDeveloper();

        // Validate developer address
        if (developerAddress == address(0)) revert InvalidAddress();

        // Client cannot accept themselves
        if (developerAddress == task.client) revert NotAuthorized();

        // Accept the developer - calls internal function
        _acceptDeveloper(taskId, developerAddress);
    }

    /**
     * @dev Mark task as completed and release payment
     * @param taskId External task ID
     */
    function completeTask(
        string calldata taskId
    ) external override nonReentrant whenNotPaused onlyTaskClient(taskId) {
        uint256 internalId = _taskIdToIndex[taskId];
        Task storage task = _tasks[internalId];

        // Task must be ACTIVE or OVERDUE to be completed
        if (
            task.status != TaskStatus.ACTIVE &&
            task.status != TaskStatus.OVERDUE
        ) {
            revert TaskNotActive();
        }

        // Check if task should transition to overdue first
        if (
            task.status == TaskStatus.ACTIVE &&
            block.timestamp > task.deadline &&
            task.allowOverdue &&
            block.timestamp <= task.deadline + OVERDUE_PERIOD
        ) {
            // Transition to overdue status
            task.status = TaskStatus.OVERDUE;
            emit TaskOverdue(
                internalId,
                taskId,
                task.developer,
                block.timestamp
            );
        }

        // Complete the task
        _completeTask(taskId);

        // Distribute GFT tokens to developer
        _distributeGFTTokens(task.developer, taskId);
    }

    /**
     * @dev Cancel task and refund client (only before developer applies)
     * @param taskId External task ID
     * @param reason Cancellation reason
     */
    function cancelTask(
        string calldata taskId,
        string calldata reason
    ) external override nonReentrant whenNotPaused onlyTaskClient(taskId) {
        uint256 internalId = _taskIdToIndex[taskId];
        Task storage task = _tasks[internalId];

        // Task must be in DEPOSITED status (no developer applied)
        if (task.status != TaskStatus.DEPOSITED) revert TaskNotDeposited();

        // Ensure no developer has applied
        if (task.developer != address(0)) revert TaskAlreadyHasDeveloper();

        // Cancel the task
        _cancelTask(taskId, reason);
    }

    // ============================================================================
    // AUTOMATIC TASK STATUS UPDATES
    // ============================================================================

    /**
     * @dev Update task status to overdue if deadline has passed
     * @param taskId External task ID
     * @notice This can be called by anyone to update task status
     */
    function updateTaskToOverdue(
        string calldata taskId
    ) external taskNotExpired(taskId) {
        uint256 internalId = _taskIdToIndex[taskId];
        Task storage task = _tasks[internalId];

        // Only update if task is ACTIVE and past deadline
        if (task.status != TaskStatus.ACTIVE) return;
        if (block.timestamp <= task.deadline) return;
        if (!task.allowOverdue) return;

        // Update to overdue status
        task.status = TaskStatus.OVERDUE;
        emit TaskOverdue(internalId, taskId, task.developer, block.timestamp);
    }

    /**
     * @dev Batch update multiple tasks to overdue status
     * @param taskIds Array of external task IDs to update
     */
    function batchUpdateTasksToOverdue(string[] calldata taskIds) external {
        for (uint256 i = 0; i < taskIds.length; i++) {
            if (
                _taskExists(taskIds[i]) &&
                !_isTaskExpired(_taskIdToIndex[taskIds[i]])
            ) {
                uint256 internalId = _taskIdToIndex[taskIds[i]];
                Task storage task = _tasks[internalId];

                if (
                    task.status == TaskStatus.ACTIVE &&
                    block.timestamp > task.deadline &&
                    task.allowOverdue
                ) {
                    task.status = TaskStatus.OVERDUE;
                    emit TaskOverdue(
                        internalId,
                        taskIds[i],
                        task.developer,
                        block.timestamp
                    );
                }
            }
        }
    }

    // ============================================================================
    // DEVELOPER UTILITY FUNCTIONS
    // ============================================================================

    /**
     * @dev Submit task completion request (for frontend integration)
     * @param taskId External task ID
     * @notice This function allows developers to signal completion without actually completing
     */
    function requestTaskCompletion(
        string calldata taskId
    ) external onlyTaskDeveloper(taskId) {
        uint256 internalId = _taskIdToIndex[taskId];
        Task storage task = _tasks[internalId];

        // Task must be ACTIVE or OVERDUE
        if (
            task.status != TaskStatus.ACTIVE &&
            task.status != TaskStatus.OVERDUE
        ) {
            revert TaskNotActive();
        }

        // Emit event for frontend to catch
        emit DeveloperRequestedCompletion(
            internalId,
            taskId,
            msg.sender,
            task.client
        );
    }

    // ============================================================================
    // VIEW FUNCTIONS FOR FRONTEND INTEGRATION
    // ============================================================================

    /**
     * @dev Get tasks by client address
     * @param client Client address
     * @param offset Starting index
     * @param limit Maximum number of tasks to return
     */
    function getTasksByClient(
        address client,
        uint256 offset,
        uint256 limit
    ) external view returns (Task[] memory tasks, uint256 total) {
        // Count total tasks for this client
        uint256 count = 0;
        for (uint256 i = 1; i <= _taskCounter; i++) {
            if (_tasks[i].client == client) count++;
        }

        total = count;

        // Return empty array if no tasks or invalid offset
        if (count == 0 || offset >= count) {
            return (new Task[](0), total);
        }

        // Calculate actual limit
        uint256 actualLimit = limit;
        if (offset + limit > count) {
            actualLimit = count - offset;
        }

        // Fill results array
        tasks = new Task[](actualLimit);
        uint256 found = 0;
        uint256 skipped = 0;

        for (uint256 i = 1; i <= _taskCounter && found < actualLimit; i++) {
            if (_tasks[i].client == client) {
                if (skipped >= offset) {
                    tasks[found] = _tasks[i];
                    found++;
                } else {
                    skipped++;
                }
            }
        }
    }

    /**
     * @dev Get tasks by developer address
     * @param developer Developer address
     * @param offset Starting index
     * @param limit Maximum number of tasks to return
     */
    function getTasksByDeveloper(
        address developer,
        uint256 offset,
        uint256 limit
    ) external view returns (Task[] memory tasks, uint256 total) {
        // Count total tasks for this developer
        uint256 count = 0;
        for (uint256 i = 1; i <= _taskCounter; i++) {
            if (_tasks[i].developer == developer) count++;
        }

        total = count;

        // Return empty array if no tasks or invalid offset
        if (count == 0 || offset >= count) {
            return (new Task[](0), total);
        }

        // Calculate actual limit
        uint256 actualLimit = limit;
        if (offset + limit > count) {
            actualLimit = count - offset;
        }

        // Fill results array
        tasks = new Task[](actualLimit);
        uint256 found = 0;
        uint256 skipped = 0;

        for (uint256 i = 1; i <= _taskCounter && found < actualLimit; i++) {
            if (_tasks[i].developer == developer) {
                if (skipped >= offset) {
                    tasks[found] = _tasks[i];
                    found++;
                } else {
                    skipped++;
                }
            }
        }
    }

    /**
     * @dev Get available tasks (DEPOSITED status)
     * @param offset Starting index
     * @param limit Maximum number of tasks to return
     */
    function getAvailableTasks(
        uint256 offset,
        uint256 limit
    ) external view returns (Task[] memory tasks, uint256 total) {
        // Count available tasks
        uint256 count = 0;
        for (uint256 i = 1; i <= _taskCounter; i++) {
            if (
                _tasks[i].status == TaskStatus.DEPOSITED && !_isTaskExpired(i)
            ) {
                count++;
            }
        }

        total = count;

        // Return empty array if no tasks or invalid offset
        if (count == 0 || offset >= count) {
            return (new Task[](0), total);
        }

        // Calculate actual limit
        uint256 actualLimit = limit;
        if (offset + limit > count) {
            actualLimit = count - offset;
        }

        // Fill results array
        tasks = new Task[](actualLimit);
        uint256 found = 0;
        uint256 skipped = 0;

        for (uint256 i = 1; i <= _taskCounter && found < actualLimit; i++) {
            if (
                _tasks[i].status == TaskStatus.DEPOSITED && !_isTaskExpired(i)
            ) {
                if (skipped >= offset) {
                    tasks[found] = _tasks[i];
                    found++;
                } else {
                    skipped++;
                }
            }
        }
    }

    // ============================================================================
    // GFT TOKEN FUNCTIONS
    // ============================================================================

    /**
     * @dev Distribute GFT tokens to developer when task is completed
     * @param developer Developer address
     * @param taskId Task ID for event
     */
    function _distributeGFTTokens(
        address developer,
        string calldata taskId
    ) internal {
        // Mint tokens for developer only
        gftToken.mint(developer, GFT_REWARD_AMOUNT);
        emit GFTTokensDistributed(developer, GFT_REWARD_AMOUNT, taskId);
    }

    /**
     * @dev Acquire vigilance badge by burning GFT tokens
     * @notice Costs 50 GFT tokens and lasts for 72 hours
     */
    function acquireVigilanceBadge() external {
        // Check if user has enough tokens
        if (gftToken.balanceOf(msg.sender) < VIGILANCE_BADGE_COST) {
            revert InsufficientGFTBalance();
        }

        // Burn tokens
        gftToken.burnFrom(msg.sender, VIGILANCE_BADGE_COST);

        // Set badge expiry
        vigilanceBadgeExpiry[msg.sender] = block.timestamp + VIGILANCE_BADGE_DURATION;

        emit VigilanceBadgeAcquired(msg.sender, block.timestamp + VIGILANCE_BADGE_DURATION);
    }

    /**
     * @dev Check if user has active vigilance badge
     * @param user User address to check
     * @return True if user has active badge
     */
    function hasVigilanceBadge(address user) external view returns (bool) {
        return vigilanceBadgeExpiry[user] > block.timestamp;
    }

    /**
     * @dev Get vigilance badge expiry time for user
     * @param user User address
     * @return Expiry timestamp (0 if no badge)
     */
    function getVigilanceBadgeExpiry(address user) external view returns (uint256) {
        return vigilanceBadgeExpiry[user];
    }

    // ============================================================================
    // RECEIVE FUNCTION
    // ============================================================================

    /**
     * @dev Receive function to accept direct ETH transfers
     * @notice Direct transfers are considered donations to the platform
     */
    receive() external payable {
        _availablePlatformFees += msg.value;
        emit PlatformFeesWithdrawn(address(this), msg.value);
    }

    /**
     * @dev Fallback function
     */
    fallback() external payable {
        revert('Function does not exist');
    }
}
