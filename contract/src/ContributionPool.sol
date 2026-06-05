// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ContributionPool is Ownable, EIP712, ReentrancyGuard {
    using SafeERC20 for IERC20;

    error ContributionPool__InvalidSigner();
    error ContributionPool__InvalidToken();
    error ContributionPool__RoundAlreadyExists();
    error ContributionPool__RoundNotFound();
    error ContributionPool__RoundFinalized();
    error ContributionPool__ZeroAmount();
    error ContributionPool__ExpiredProof();
    error ContributionPool__InvalidContributor();
    error ContributionPool__ZeroScore();
    error ContributionPool__InvalidProofHash();
    error ContributionPool__ProofAlreadyUsed();
    error ContributionPool__InvalidSignature();
    error ContributionPool__NoFunds();
    error ContributionPool__NoContributions();
    error ContributionPool__NoClaimableAmount();

    bytes32 public constant CONTRIBUTION_TYPEHASH = keccak256(
        "ContributionProof(uint256 projectId,uint256 roundId,address contributor,uint256 score,bytes32 proofHash,bytes32 paymentIdHash,uint256 nonce,uint256 deadline)"
    );

    struct Round {
        address token;
        uint256 funded;
        uint256 totalScore;
        bool exists;
        bool finalized;
    }

    struct ContributionProof {
        uint256 projectId;
        uint256 roundId;
        address contributor;
        uint256 score;
        bytes32 proofHash;
        bytes32 paymentIdHash;
        uint256 nonce;
        uint256 deadline;
    }

    address public agentSigner;

    mapping(uint256 => mapping(uint256 => Round)) public rounds;
    mapping(uint256 => mapping(uint256 => mapping(address => uint256))) public scores;
    mapping(uint256 => mapping(uint256 => mapping(address => uint256))) public claimed;
    mapping(bytes32 => bool) public usedProofs;

    event AgentSignerUpdated(address indexed oldSigner, address indexed newSigner);
    event RoundCreated(uint256 indexed projectId, uint256 indexed roundId, address indexed token);
    event RoundFunded(uint256 indexed projectId, uint256 indexed roundId, uint256 amount);
    event ContributionRecorded(
        uint256 indexed projectId,
        uint256 indexed roundId,
        address indexed contributor,
        uint256 score,
        bytes32 proofHash,
        bytes32 paymentIdHash
    );
    event RoundFinalized(uint256 indexed projectId, uint256 indexed roundId);
    event Claimed(uint256 indexed projectId, uint256 indexed roundId, address indexed contributor, uint256 amount);

    constructor(address initialOwner, address initialAgentSigner)
        Ownable(initialOwner)
        EIP712("CGHubContributionPool", "1")
    {
        if (initialAgentSigner == address(0)) {
            revert ContributionPool__InvalidSigner();
        }

        agentSigner = initialAgentSigner;
    }

    function setAgentSigner(address newSigner) external onlyOwner {
        if (newSigner == address(0)) {
            revert ContributionPool__InvalidSigner();
        }

        emit AgentSignerUpdated(agentSigner, newSigner);
        agentSigner = newSigner;
    }

    function createRound(uint256 projectId, uint256 roundId, address token) external onlyOwner {
        if (token == address(0)) {
            revert ContributionPool__InvalidToken();
        }

        Round storage round = rounds[projectId][roundId];
        if (round.exists) {
            revert ContributionPool__RoundAlreadyExists();
        }

        round.token = token;
        round.exists = true;

        emit RoundCreated(projectId, roundId, token);
    }

    function fundRound(uint256 projectId, uint256 roundId, uint256 amount) external nonReentrant {
        Round storage round = rounds[projectId][roundId];
        if (!round.exists) {
            revert ContributionPool__RoundNotFound();
        }

        if (round.finalized) {
            revert ContributionPool__RoundFinalized();
        }

        if (amount == 0) {
            revert ContributionPool__ZeroAmount();
        }

        IERC20(round.token).safeTransferFrom(msg.sender, address(this), amount);
        round.funded += amount;

        emit RoundFunded(projectId, roundId, amount);
    }

    function recordContributionBySig(ContributionProof calldata proof, bytes calldata signature) external {
        Round storage round = rounds[proof.projectId][proof.roundId];
        if (!round.exists) {
            revert ContributionPool__RoundNotFound();
        }

        if (round.finalized) {
            revert ContributionPool__RoundFinalized();
        }

        if (block.timestamp > proof.deadline) {
            revert ContributionPool__ExpiredProof();
        }

        if (proof.contributor == address(0)) {
            revert ContributionPool__InvalidContributor();
        }

        if (proof.score == 0) {
            revert ContributionPool__ZeroScore();
        }

        if (proof.proofHash == bytes32(0)) {
            revert ContributionPool__InvalidProofHash();
        }

        if (usedProofs[proof.proofHash]) {
            revert ContributionPool__ProofAlreadyUsed();
        }

        address signer = _recoverSigner(proof, signature);
        if (signer != agentSigner) {
            revert ContributionPool__InvalidSignature();
        }

        usedProofs[proof.proofHash] = true;
        scores[proof.projectId][proof.roundId][proof.contributor] += proof.score;
        round.totalScore += proof.score;

        emit ContributionRecorded(
            proof.projectId,
            proof.roundId,
            proof.contributor,
            proof.score,
            proof.proofHash,
            proof.paymentIdHash
        );
    }

    function finalizeRound(uint256 projectId, uint256 roundId) external onlyOwner {
        Round storage round = rounds[projectId][roundId];
        if (!round.exists) {
            revert ContributionPool__RoundNotFound();
        }

        if (round.finalized) {
            revert ContributionPool__RoundFinalized();
        }

        if (round.funded == 0) {
            revert ContributionPool__NoFunds();
        }

        if (round.totalScore == 0) {
            revert ContributionPool__NoContributions();
        }

        round.finalized = true;

        emit RoundFinalized(projectId, roundId);
    }

    function pending(uint256 projectId, uint256 roundId, address contributor) public view returns (uint256) {
        Round storage round = rounds[projectId][roundId];
        if (!round.finalized || round.totalScore == 0) {
            return 0;
        }

        uint256 entitled = round.funded * scores[projectId][roundId][contributor] / round.totalScore;
        return entitled - claimed[projectId][roundId][contributor];
    }

    function claim(uint256 projectId, uint256 roundId) external nonReentrant {
        _claimFor(projectId, roundId, msg.sender);
    }

    function claimFor(uint256 projectId, uint256 roundId, address contributor) external nonReentrant {
        _claimFor(projectId, roundId, contributor);
    }

    function _recoverSigner(ContributionProof calldata proof, bytes calldata signature)
        internal
        view
        returns (address)
    {
        bytes32 digest = _hashTypedDataV4(_hashContributionProof(proof));
        return ECDSA.recover(digest, signature);
    }

    function _hashContributionProof(ContributionProof calldata proof) internal pure returns (bytes32) {
        return keccak256(
            abi.encode(
                CONTRIBUTION_TYPEHASH,
                proof.projectId,
                proof.roundId,
                proof.contributor,
                proof.score,
                proof.proofHash,
                proof.paymentIdHash,
                proof.nonce,
                proof.deadline
            )
        );
    }

    function _claimFor(uint256 projectId, uint256 roundId, address contributor) internal {
        uint256 amount = pending(projectId, roundId, contributor);
        if (amount == 0) {
            revert ContributionPool__NoClaimableAmount();
        }

        Round storage round = rounds[projectId][roundId];
        claimed[projectId][roundId][contributor] += amount;
        IERC20(round.token).safeTransfer(contributor, amount);

        emit Claimed(projectId, roundId, contributor, amount);
    }
}
