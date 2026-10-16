// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title FixBoard - E-Commerce Seller Demand Board
 * @notice On-chain voting, pledging, and audit trail for seller chore requests.
 *         Deployed on Sepolia testnet (free to use with test ETH).
 */
contract FixBoard {
    struct Chore {
        bytes32 choreHash;       // keccak256 of off-chain chore data
        address creator;
        uint256 totalVotes;
        uint256 totalPledged;    // in wei
        uint256 createdAt;
        bool exists;
    }

    struct AuditEntry {
        string action;           // "CHORE_CREATED" | "VOTE_CAST" | "PLEDGE_MADE" | "COMMENT_ADDED"
        string choreId;
        address actor;
        uint256 value;           // pledge amount or vote delta
        uint256 timestamp;
        bytes32 dataHash;        // hash of associated data for integrity
    }

    mapping(string => Chore) public chores;
    mapping(string => mapping(address => bool)) public hasVoted;
    mapping(string => mapping(address => uint256)) public pledges;
    
    AuditEntry[] public auditLog;
    string[] public choreIds;

    // Events for frontend indexing
    event ChoreRegistered(string indexed choreId, bytes32 choreHash, address creator, uint256 timestamp);
    event VoteCast(string indexed choreId, address voter, uint256 newTotal, uint256 timestamp);
    event VoteRevoked(string indexed choreId, address voter, uint256 newTotal, uint256 timestamp);
    event PledgeMade(string indexed choreId, address backer, uint256 amount, uint256 newTotal, uint256 timestamp);
    event CommentRecorded(string indexed choreId, address commenter, bytes32 commentHash, uint256 timestamp);
    event AuditRecorded(uint256 indexed entryIndex, string action, string choreId, address actor, uint256 timestamp);

    modifier choreExists(string memory _choreId) {
        require(chores[_choreId].exists, "Chore does not exist");
        _;
    }

    /**
     * @notice Register a new chore on-chain with a hash of its off-chain data.
     * @param _choreId Unique string ID from the frontend
     * @param _dataHash keccak256 hash of the chore's full JSON data for tamper-proof verification
     */
    function registerChore(string memory _choreId, bytes32 _dataHash) external {
        require(!chores[_choreId].exists, "Chore already registered");

        chores[_choreId] = Chore({
            choreHash: _dataHash,
            creator: msg.sender,
            totalVotes: 1,      // creator auto-votes
            totalPledged: 0,
            createdAt: block.timestamp,
            exists: true
        });

        hasVoted[_choreId][msg.sender] = true;
        choreIds.push(_choreId);

        _addAudit("CHORE_CREATED", _choreId, msg.sender, 0, _dataHash);
        emit ChoreRegistered(_choreId, _dataHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Cast an upvote for a chore. One vote per wallet address.
     */
    function vote(string memory _choreId) external choreExists(_choreId) {
        require(!hasVoted[_choreId][msg.sender], "Already voted");

        hasVoted[_choreId][msg.sender] = true;
        chores[_choreId].totalVotes += 1;

        _addAudit("VOTE_CAST", _choreId, msg.sender, 1, bytes32(0));
        emit VoteCast(_choreId, msg.sender, chores[_choreId].totalVotes, block.timestamp);
    }

    /**
     * @notice Revoke a previously cast vote.
     */
    function revokeVote(string memory _choreId) external choreExists(_choreId) {
        require(hasVoted[_choreId][msg.sender], "Not voted");

        hasVoted[_choreId][msg.sender] = false;
        if (chores[_choreId].totalVotes > 0) {
            chores[_choreId].totalVotes -= 1;
        }

        _addAudit("VOTE_REVOKED", _choreId, msg.sender, 1, bytes32(0));
        emit VoteRevoked(_choreId, msg.sender, chores[_choreId].totalVotes, block.timestamp);
    }

    /**
     * @notice Pledge ETH toward a chore fix. Uses test ETH on Sepolia.
     */
    function pledge(string memory _choreId) external payable choreExists(_choreId) {
        require(msg.value > 0, "Must pledge > 0");

        pledges[_choreId][msg.sender] += msg.value;
        chores[_choreId].totalPledged += msg.value;

        _addAudit("PLEDGE_MADE", _choreId, msg.sender, msg.value, bytes32(0));
        emit PledgeMade(_choreId, msg.sender, msg.value, chores[_choreId].totalPledged, block.timestamp);
    }

    /**
     * @notice Record a comment hash on-chain for audit purposes (content stays off-chain).
     */
    function recordComment(string memory _choreId, bytes32 _commentHash) external choreExists(_choreId) {
        _addAudit("COMMENT_ADDED", _choreId, msg.sender, 0, _commentHash);
        emit CommentRecorded(_choreId, msg.sender, _commentHash, block.timestamp);
    }

    /**
     * @notice Get full chore data from chain.
     */
    function getChore(string memory _choreId) external view returns (
        bytes32 choreHash,
        address creator,
        uint256 totalVotes,
        uint256 totalPledged,
        uint256 createdAt
    ) {
        Chore memory c = chores[_choreId];
        require(c.exists, "Not found");
        return (c.choreHash, c.creator, c.totalVotes, c.totalPledged, c.createdAt);
    }

    /**
     * @notice Get total number of audit log entries.
     */
    function getAuditLogLength() external view returns (uint256) {
        return auditLog.length;
    }

    /**
     * @notice Get a paginated slice of the audit log (most recent first).
     */
    function getAuditLogPage(uint256 _offset, uint256 _limit) external view returns (AuditEntry[] memory) {
        uint256 total = auditLog.length;
        if (_offset >= total) {
            return new AuditEntry[](0);
        }
        uint256 end = _offset + _limit;
        if (end > total) end = total;
        uint256 count = end - _offset;
        AuditEntry[] memory page = new AuditEntry[](count);
        for (uint256 i = 0; i < count; i++) {
            // Return newest first
            page[i] = auditLog[total - 1 - _offset - i];
        }
        return page;
    }

    /**
     * @notice Get the total number of registered chores.
     */
    function getChoreCount() external view returns (uint256) {
        return choreIds.length;
    }

    /**
     * @notice Check if a wallet has voted on a chore.
     */
    function hasWalletVoted(string memory _choreId, address _wallet) external view returns (bool) {
        return hasVoted[_choreId][_wallet];
    }

    // Internal: append to audit log
    function _addAudit(
        string memory _action,
        string memory _choreId,
        address _actor,
        uint256 _value,
        bytes32 _dataHash
    ) internal {
        auditLog.push(AuditEntry({
            action: _action,
            choreId: _choreId,
            actor: _actor,
            value: _value,
            timestamp: block.timestamp,
            dataHash: _dataHash
        }));
        emit AuditRecorded(auditLog.length - 1, _action, _choreId, _actor, block.timestamp);
    }
}
