// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import './abstract/GitFreelasBase.sol';

/**
 * @title GitFreelas
 * @dev Main GitFreelas contract implementing the freelancing platform
 * @notice This contract handles crypto payments for GitHub-based development tasks
 * @author GitFreelas Team
 */
contract GitFreelas is GitFreelasBase {
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

    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================

    /**
     * @dev Deploy the GitFreelas contract
     * @param initialOwner Address that will own the contract (can pause, withdraw fees)
     */
    constructor(address initialOwner) GitFreelasBase(initialOwner) {
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
        // Para evitar problemas de precisão com divisão, vamos trabalhar com msg.value diretamente
        // Verificar se msg.value é suficiente para pelo menos o valor mínimo + taxa
        uint256 minimumTotalDeposit = calculateTotalDeposit(MINIMUM_TASK_VALUE);
        if (msg.value < minimumTotalDeposit) revert InvalidTaskValue();

        // Calcular taskValue a partir do valor total depositado
        // msg.value = taskValue + (taskValue * 3 / 100) = taskValue * 103 / 100
        // taskValue = msg.value * 100 / 103
        uint256 taskValue = (msg.value * 100) / (100 + PLATFORM_FEE_PERCENTAGE);

        // Verificar se o taskValue calculado ainda atende ao mínimo
        if (taskValue < MINIMUM_TASK_VALUE) revert InvalidTaskValue();

        // Calcular o depósito exato necessário para esse taskValue
        uint256 exactTotalDeposit = calculateTotalDeposit(taskValue);

        // Verificar se temos valor suficiente
        if (msg.value < exactTotalDeposit) revert InsufficientDeposit();

        // Criar a tarefa
        _createTask(taskId, deadline, allowOverdue, taskValue);

        // Refund qualquer excesso
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

        // Task must be in DEPOSITED status (no developer assigned yet)
        if (task.status != TaskStatus.DEPOSITED) revert TaskNotDeposited();

        // Ensure no developer has been assigned yet
        if (task.developer != address(0)) revert TaskAlreadyHasDeveloper();

        // Validate developer address
        if (developerAddress == address(0)) revert InvalidAddress();

        // Client cannot accept themselves
        if (developerAddress == task.client) revert NotAuthorized();

        // Accept the developer
        task.developer = developerAddress;
        task.status = TaskStatus.ACTIVE;

        // Emit event
        emit DeveloperApplied(
            internalId,
            taskId,
            developerAddress,
            task.client
        );
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
