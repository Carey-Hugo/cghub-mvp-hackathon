// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ContributionPool} from "../../src/ContributionPool.sol";
import {MockUSDC} from "../../src/mocks/MockUSDC.sol";

contract ContributionPoolHarness is ContributionPool {
    constructor(address initialOwner, address initialAgentSigner)
        ContributionPool(initialOwner, initialAgentSigner)
    {}

    function markRoundFinalized(uint256 projectId, uint256 roundId) external {
        rounds[projectId][roundId].finalized = true;
    }

    function setScore(uint256 projectId, uint256 roundId, address contributor, uint256 score) external {
        scores[projectId][roundId][contributor] = score;
    }

    function setClaimed(uint256 projectId, uint256 roundId, address contributor, uint256 amount) external {
        claimed[projectId][roundId][contributor] = amount;
    }

    function markProofUsed(bytes32 proofHash) external {
        usedProofs[proofHash] = true;
    }

    function recoverSigner(ContributionProof calldata proof, bytes calldata signature)
        external
        view
        returns (address)
    {
        return _recoverSigner(proof, signature);
    }

    function hashTypedData(ContributionProof calldata proof) external view returns (bytes32) {
        return _hashTypedDataV4(_hashContributionProof(proof));
    }
}

contract ContributionPoolTest is Test {
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

    ContributionPoolHarness private pool;
    MockUSDC private usdc;

    address private owner = address(0xA11CE);
    address private agentSigner;
    address private newAgentSigner = address(0xCAFE);
    address private nonOwner = address(0xE0E);
    address private project = address(0xF00D);
    address private contributor = address(0xC011AB);
    address private secondContributor = address(0xBEEF);
    address private thirdContributor = address(0xCA201);
    address private otherSigner;
    address private token;

    uint256 private agentSignerPrivateKey = 0xB0B;
    uint256 private otherSignerPrivateKey = 0xBAD;
    uint256 private projectId = 1;
    uint256 private roundId = 1;
    uint256 private amount = 100e6;

    function setUp() public {
        agentSigner = vm.addr(agentSignerPrivateKey);
        otherSigner = vm.addr(otherSignerPrivateKey);
        usdc = new MockUSDC();
        token = address(usdc);
        pool = new ContributionPoolHarness(owner, agentSigner);
    }

    function testConstructorStoresOwnerAndAgentSigner() public view {
        assertEq(pool.owner(), owner);
        assertEq(pool.agentSigner(), agentSigner);
    }

    function testEIP712DomainIsConfigured() public view {
        (
            bytes1 fields,
            string memory name,
            string memory version,
            uint256 chainId,
            address verifyingContract,
            bytes32 salt,
            uint256[] memory extensions
        ) = pool.eip712Domain();

        assertEq(fields, hex"0f");
        assertEq(name, "CGHubContributionPool");
        assertEq(version, "1");
        assertEq(chainId, block.chainid);
        assertEq(verifyingContract, address(pool));
        assertEq(salt, bytes32(0));
        assertEq(extensions.length, 0);
    }

    function testContributionTypehashMatchesAgentEIP712Type() public view {
        bytes32 expectedTypehash = keccak256(
            "ContributionProof(uint256 projectId,uint256 roundId,address contributor,uint256 score,bytes32 proofHash,bytes32 paymentIdHash,uint256 nonce,uint256 deadline)"
        );

        assertEq(pool.CONTRIBUTION_TYPEHASH(), expectedTypehash);
    }

    function testFoundryAgentSigningExampleUsesSameEIP712Fields() public view {
        ContributionPool.ContributionProof memory proof = ContributionPool.ContributionProof({
            projectId: projectId,
            roundId: roundId,
            contributor: contributor,
            score: 50,
            proofHash: keccak256(bytes("manual-test-proof")),
            paymentIdHash: keccak256(bytes("payment-001")),
            nonce: 1,
            deadline: block.timestamp + 1 days
        });
        bytes memory signature = _signProof(pool, agentSignerPrivateKey, proof);

        assertEq(pool.recoverSigner(proof, signature), agentSigner);
    }

    function testContributionProofStructFieldsMatchAgentType() public view {
        ContributionPool.ContributionProof memory proof = ContributionPool.ContributionProof({
            projectId: projectId,
            roundId: roundId,
            contributor: contributor,
            score: 42,
            proofHash: keccak256("proof"),
            paymentIdHash: keccak256("payment"),
            nonce: 7,
            deadline: block.timestamp + 1 days
        });

        assertEq(proof.projectId, projectId);
        assertEq(proof.roundId, roundId);
        assertEq(proof.contributor, contributor);
        assertEq(proof.score, 42);
        assertEq(proof.proofHash, keccak256("proof"));
        assertEq(proof.paymentIdHash, keccak256("payment"));
        assertEq(proof.nonce, 7);
        assertEq(proof.deadline, block.timestamp + 1 days);
    }

    function testConstructorRevertsWhenAgentSignerIsZero() public {
        vm.expectRevert(ContributionPool.ContributionPool__InvalidSigner.selector);

        new ContributionPool(owner, address(0));
    }

    function testOwnerCanUpdateAgentSigner() public {
        vm.prank(owner);
        pool.setAgentSigner(newAgentSigner);

        assertEq(pool.agentSigner(), newAgentSigner);
    }

    function testNonOwnerCannotUpdateAgentSigner() public {
        vm.prank(nonOwner);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, nonOwner));

        pool.setAgentSigner(newAgentSigner);
    }

    function testSetAgentSignerRevertsWhenNewSignerIsZero() public {
        vm.prank(owner);
        vm.expectRevert(ContributionPool.ContributionPool__InvalidSigner.selector);

        pool.setAgentSigner(address(0));
    }

    function testSetAgentSignerEmitsEvent() public {
        vm.expectEmit(true, true, false, false, address(pool));
        emit AgentSignerUpdated(agentSigner, newAgentSigner);

        vm.prank(owner);
        pool.setAgentSigner(newAgentSigner);
    }

    function testOwnerCanCreateRound() public {
        vm.prank(owner);
        pool.createRound(projectId, roundId, token);

        (
            address roundToken,
            uint256 funded,
            uint256 totalScore,
            bool exists,
            bool finalized
        ) = pool.rounds(projectId, roundId);

        assertEq(roundToken, token);
        assertEq(funded, 0);
        assertEq(totalScore, 0);
        assertTrue(exists);
        assertFalse(finalized);
    }

    function testNonOwnerCannotCreateRound() public {
        vm.prank(nonOwner);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, nonOwner));

        pool.createRound(projectId, roundId, token);
    }

    function testCannotCreateDuplicatedRound() public {
        vm.prank(owner);
        pool.createRound(projectId, roundId, token);

        vm.prank(owner);
        vm.expectRevert(ContributionPool.ContributionPool__RoundAlreadyExists.selector);

        pool.createRound(projectId, roundId, token);
    }

    function testCannotCreateRoundWithZeroToken() public {
        vm.prank(owner);
        vm.expectRevert(ContributionPool.ContributionPool__InvalidToken.selector);

        pool.createRound(projectId, roundId, address(0));
    }

    function testCreateRoundEmitsEvent() public {
        vm.expectEmit(true, true, true, false, address(pool));
        emit RoundCreated(projectId, roundId, token);

        vm.prank(owner);
        pool.createRound(projectId, roundId, token);
    }

    function testCannotFundMissingRound() public {
        vm.prank(project);
        vm.expectRevert(ContributionPool.ContributionPool__RoundNotFound.selector);

        pool.fundRound(projectId, roundId, amount);
    }

    function testCannotFundFinalizedRound() public {
        _createRound();
        pool.markRoundFinalized(projectId, roundId);
        _mintAndApproveProject(amount);

        vm.prank(project);
        vm.expectRevert(ContributionPool.ContributionPool__RoundFinalized.selector);

        pool.fundRound(projectId, roundId, amount);
    }

    function testCannotFundZeroAmount() public {
        _createRound();

        vm.prank(project);
        vm.expectRevert(ContributionPool.ContributionPool__ZeroAmount.selector);

        pool.fundRound(projectId, roundId, 0);
    }

    function testCannotFundWithoutApproval() public {
        _createRound();
        usdc.mint(project, amount);

        vm.prank(project);
        vm.expectRevert();

        pool.fundRound(projectId, roundId, amount);
    }

    function testCanFundRound() public {
        _createRound();
        _mintAndApproveProject(amount);

        vm.prank(project);
        pool.fundRound(projectId, roundId, amount);

        (, uint256 funded,,,) = pool.rounds(projectId, roundId);

        assertEq(usdc.balanceOf(project), 0);
        assertEq(usdc.balanceOf(address(pool)), amount);
        assertEq(funded, amount);
    }

    function testFundRoundEmitsEvent() public {
        _createRound();
        _mintAndApproveProject(amount);

        vm.expectEmit(true, true, false, true, address(pool));
        emit RoundFunded(projectId, roundId, amount);

        vm.prank(project);
        pool.fundRound(projectId, roundId, amount);
    }

    function testProofHashCanBeUsedAsDuplicateKey() public {
        bytes32 proofHash = keccak256("proof");

        assertFalse(pool.usedProofs(proofHash));

        pool.markProofUsed(proofHash);

        assertTrue(pool.usedProofs(proofHash));
    }

    function testScoresCanBeReadByProjectRoundAndContributor() public {
        pool.setScore(projectId, roundId, contributor, 42);

        assertEq(pool.scores(projectId, roundId, contributor), 42);
    }

    function testClaimedCanBeReadByProjectRoundAndContributor() public {
        pool.setClaimed(projectId, roundId, contributor, amount);

        assertEq(pool.claimed(projectId, roundId, contributor), amount);
    }

    function testRecoverSignerWithAgentSignature() public view {
        ContributionPool.ContributionProof memory proof = _defaultProof();
        bytes memory signature = _signProof(pool, agentSignerPrivateKey, proof);

        address recoveredSigner = pool.recoverSigner(proof, signature);

        assertEq(recoveredSigner, agentSigner);
    }

    function testRecoverSignerWithOtherPrivateKeyDoesNotMatchAgentSigner() public view {
        ContributionPool.ContributionProof memory proof = _defaultProof();
        bytes memory signature = _signProof(pool, otherSignerPrivateKey, proof);

        address recoveredSigner = pool.recoverSigner(proof, signature);

        assertEq(recoveredSigner, otherSigner);
        assertNotEq(recoveredSigner, agentSigner);
    }

    function testModifiedProofInvalidatesSignature() public view {
        ContributionPool.ContributionProof memory proof = _defaultProof();
        bytes memory signature = _signProof(pool, agentSignerPrivateKey, proof);

        proof.score = proof.score + 1;

        address recoveredSigner = pool.recoverSigner(proof, signature);

        assertNotEq(recoveredSigner, agentSigner);
    }

    function testSignatureCannotBeReusedAcrossContracts() public {
        ContributionPoolHarness otherPool = new ContributionPoolHarness(owner, agentSigner);
        ContributionPool.ContributionProof memory proof = _defaultProof();
        bytes memory signature = _signProof(pool, agentSignerPrivateKey, proof);

        address recoveredSigner = otherPool.recoverSigner(proof, signature);

        assertNotEq(recoveredSigner, agentSigner);
    }

    function testSignatureCannotBeReusedAcrossChainIds() public {
        uint256 originalChainId = block.chainid;
        ContributionPool.ContributionProof memory proof = _defaultProof();
        bytes memory signature = _signProof(pool, agentSignerPrivateKey, proof);

        vm.chainId(originalChainId + 1);
        address recoveredSigner = pool.recoverSigner(proof, signature);
        vm.chainId(originalChainId);

        assertNotEq(recoveredSigner, agentSigner);
    }

    function testCanRecordContributionWithAgentSignature() public {
        _createRound();
        ContributionPool.ContributionProof memory proof = _defaultProof();
        bytes memory signature = _signProof(pool, agentSignerPrivateKey, proof);

        vm.prank(nonOwner);
        pool.recordContributionBySig(proof, signature);

        (,, uint256 totalScore,,) = pool.rounds(projectId, roundId);

        assertEq(pool.scores(projectId, roundId, contributor), proof.score);
        assertEq(totalScore, proof.score);
        assertTrue(pool.usedProofs(proof.proofHash));
    }

    function testCannotRecordWithInvalidSigner() public {
        _createRound();
        ContributionPool.ContributionProof memory proof = _defaultProof();
        bytes memory signature = _signProof(pool, otherSignerPrivateKey, proof);

        vm.expectRevert(ContributionPool.ContributionPool__InvalidSignature.selector);

        pool.recordContributionBySig(proof, signature);
    }

    function testCannotReplayProofHash() public {
        _createRound();
        ContributionPool.ContributionProof memory proof = _defaultProof();
        bytes memory signature = _signProof(pool, agentSignerPrivateKey, proof);

        pool.recordContributionBySig(proof, signature);

        vm.expectRevert(ContributionPool.ContributionPool__ProofAlreadyUsed.selector);

        pool.recordContributionBySig(proof, signature);
    }

    function testCannotRecordExpiredProof() public {
        _createRound();
        ContributionPool.ContributionProof memory proof = _defaultProof();
        proof.deadline = block.timestamp - 1;
        bytes memory signature = _signProof(pool, agentSignerPrivateKey, proof);

        vm.expectRevert(ContributionPool.ContributionPool__ExpiredProof.selector);

        pool.recordContributionBySig(proof, signature);
    }

    function testCannotRecordAfterFinalize() public {
        _createRound();
        pool.markRoundFinalized(projectId, roundId);
        ContributionPool.ContributionProof memory proof = _defaultProof();
        bytes memory signature = _signProof(pool, agentSignerPrivateKey, proof);

        vm.expectRevert(ContributionPool.ContributionPool__RoundFinalized.selector);

        pool.recordContributionBySig(proof, signature);
    }

    function testCannotRecordMissingRound() public {
        ContributionPool.ContributionProof memory proof = _defaultProof();
        bytes memory signature = _signProof(pool, agentSignerPrivateKey, proof);

        vm.expectRevert(ContributionPool.ContributionPool__RoundNotFound.selector);

        pool.recordContributionBySig(proof, signature);
    }

    function testCannotRecordZeroContributor() public {
        _createRound();
        ContributionPool.ContributionProof memory proof = _defaultProof();
        proof.contributor = address(0);
        bytes memory signature = _signProof(pool, agentSignerPrivateKey, proof);

        vm.expectRevert(ContributionPool.ContributionPool__InvalidContributor.selector);

        pool.recordContributionBySig(proof, signature);
    }

    function testCannotRecordZeroScore() public {
        _createRound();
        ContributionPool.ContributionProof memory proof = _defaultProof();
        proof.score = 0;
        bytes memory signature = _signProof(pool, agentSignerPrivateKey, proof);

        vm.expectRevert(ContributionPool.ContributionPool__ZeroScore.selector);

        pool.recordContributionBySig(proof, signature);
    }

    function testCannotRecordZeroProofHash() public {
        _createRound();
        ContributionPool.ContributionProof memory proof = _defaultProof();
        proof.proofHash = bytes32(0);
        bytes memory signature = _signProof(pool, agentSignerPrivateKey, proof);

        vm.expectRevert(ContributionPool.ContributionPool__InvalidProofHash.selector);

        pool.recordContributionBySig(proof, signature);
    }

    function testCanAccumulateMultipleContributionsForSameContributor() public {
        _createRound();
        ContributionPool.ContributionProof memory firstProof = _defaultProof();
        ContributionPool.ContributionProof memory secondProof = _defaultProof();
        secondProof.score = 8;
        secondProof.proofHash = keccak256("second proof");
        secondProof.paymentIdHash = keccak256("second payment");
        secondProof.nonce = 8;

        pool.recordContributionBySig(firstProof, _signProof(pool, agentSignerPrivateKey, firstProof));
        pool.recordContributionBySig(secondProof, _signProof(pool, agentSignerPrivateKey, secondProof));

        (,, uint256 totalScore,,) = pool.rounds(projectId, roundId);

        assertEq(pool.scores(projectId, roundId, contributor), 50);
        assertEq(totalScore, 50);
        assertTrue(pool.usedProofs(firstProof.proofHash));
        assertTrue(pool.usedProofs(secondProof.proofHash));
    }

    function testRecordContributionEmitsEvent() public {
        _createRound();
        ContributionPool.ContributionProof memory proof = _defaultProof();
        bytes memory signature = _signProof(pool, agentSignerPrivateKey, proof);

        vm.expectEmit(true, true, true, true, address(pool));
        emit ContributionRecorded(
            proof.projectId,
            proof.roundId,
            proof.contributor,
            proof.score,
            proof.proofHash,
            proof.paymentIdHash
        );

        pool.recordContributionBySig(proof, signature);
    }

    function testCanFinalizeRound() public {
        _prepareFinalizableRound();

        vm.prank(owner);
        pool.finalizeRound(projectId, roundId);

        (,,,, bool finalized) = pool.rounds(projectId, roundId);

        assertTrue(finalized);
    }

    function testNonOwnerCannotFinalizeRound() public {
        _prepareFinalizableRound();

        vm.prank(nonOwner);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, nonOwner));

        pool.finalizeRound(projectId, roundId);
    }

    function testCannotFinalizeMissingRound() public {
        vm.prank(owner);
        vm.expectRevert(ContributionPool.ContributionPool__RoundNotFound.selector);

        pool.finalizeRound(projectId, roundId);
    }

    function testCannotFinalizeWithoutFunds() public {
        _createRound();
        _recordContribution(_contributionProof(contributor, 50, "proof", "payment", 7));

        vm.prank(owner);
        vm.expectRevert(ContributionPool.ContributionPool__NoFunds.selector);

        pool.finalizeRound(projectId, roundId);
    }

    function testCannotFinalizeWithoutContributions() public {
        _createAndFundRound();

        vm.prank(owner);
        vm.expectRevert(ContributionPool.ContributionPool__NoContributions.selector);

        pool.finalizeRound(projectId, roundId);
    }

    function testCannotFinalizeTwice() public {
        _prepareFinalizableRound();

        vm.prank(owner);
        pool.finalizeRound(projectId, roundId);

        vm.prank(owner);
        vm.expectRevert(ContributionPool.ContributionPool__RoundFinalized.selector);

        pool.finalizeRound(projectId, roundId);
    }

    function testFinalizeRoundEmitsEvent() public {
        _prepareFinalizableRound();

        vm.expectEmit(true, true, false, false, address(pool));
        emit RoundFinalized(projectId, roundId);

        vm.prank(owner);
        pool.finalizeRound(projectId, roundId);
    }

    function testPendingBeforeFinalizeIsZero() public {
        _prepareFinalizableRound();

        assertEq(pool.pending(projectId, roundId, contributor), 0);
    }

    function testPendingAfterFinalizeCalculatesAmount() public {
        _prepareFinalizableRound();

        vm.prank(owner);
        pool.finalizeRound(projectId, roundId);

        assertEq(pool.pending(projectId, roundId, contributor), 50e6);
        assertEq(pool.pending(projectId, roundId, secondContributor), 50e6);
    }

    function testClaimByScore() public {
        _prepareClaimableRound();

        vm.prank(contributor);
        pool.claim(projectId, roundId);

        vm.prank(secondContributor);
        pool.claim(projectId, roundId);

        vm.prank(thirdContributor);
        pool.claim(projectId, roundId);

        assertEq(usdc.balanceOf(contributor), 50e6);
        assertEq(usdc.balanceOf(secondContributor), 30e6);
        assertEq(usdc.balanceOf(thirdContributor), 20e6);
        assertEq(usdc.balanceOf(address(pool)), 0);
        assertEq(pool.claimed(projectId, roundId, contributor), 50e6);
        assertEq(pool.claimed(projectId, roundId, secondContributor), 30e6);
        assertEq(pool.claimed(projectId, roundId, thirdContributor), 20e6);
    }

    function testCannotDoubleClaim() public {
        _prepareClaimableRound();

        vm.prank(contributor);
        pool.claim(projectId, roundId);

        vm.prank(contributor);
        vm.expectRevert(ContributionPool.ContributionPool__NoClaimableAmount.selector);

        pool.claim(projectId, roundId);
    }

    function testClaimForCanBeCalledByAnyAddress() public {
        _prepareClaimableRound();

        vm.prank(nonOwner);
        pool.claimFor(projectId, roundId, contributor);

        assertEq(usdc.balanceOf(contributor), 50e6);
        assertEq(usdc.balanceOf(nonOwner), 0);
        assertEq(pool.claimed(projectId, roundId, contributor), 50e6);
    }

    function testClaimForSendsFundsToContributor() public {
        _prepareClaimableRound();

        vm.prank(project);
        pool.claimFor(projectId, roundId, secondContributor);

        assertEq(usdc.balanceOf(secondContributor), 30e6);
        assertEq(usdc.balanceOf(project), 0);
        assertEq(pool.claimed(projectId, roundId, secondContributor), 30e6);
    }

    function testCannotClaimWhenNoClaimableAmount() public {
        _prepareFinalizableRound();

        vm.prank(contributor);
        vm.expectRevert(ContributionPool.ContributionPool__NoClaimableAmount.selector);

        pool.claim(projectId, roundId);
    }

    function testClaimEmitsEvent() public {
        _prepareClaimableRound();

        vm.expectEmit(true, true, true, true, address(pool));
        emit Claimed(projectId, roundId, contributor, 50e6);

        vm.prank(contributor);
        pool.claim(projectId, roundId);
    }

    function _createRound() private {
        vm.prank(owner);
        pool.createRound(projectId, roundId, token);
    }

    function _createAndFundRound() private {
        _createRound();
        _mintAndApproveProject(amount);

        vm.prank(project);
        pool.fundRound(projectId, roundId, amount);
    }

    function _prepareFinalizableRound() private {
        _createAndFundRound();
        _recordContribution(_contributionProof(contributor, 50, "first proof", "first payment", 7));
        _recordContribution(_contributionProof(secondContributor, 50, "second proof", "second payment", 8));
    }

    function _prepareClaimableRound() private {
        _createAndFundRound();
        _recordContribution(_contributionProof(contributor, 50, "first proof", "first payment", 7));
        _recordContribution(_contributionProof(secondContributor, 30, "second proof", "second payment", 8));
        _recordContribution(_contributionProof(thirdContributor, 20, "third proof", "third payment", 9));

        vm.prank(owner);
        pool.finalizeRound(projectId, roundId);
    }

    function _mintAndApproveProject(uint256 mintAmount) private {
        usdc.mint(project, mintAmount);

        vm.prank(project);
        usdc.approve(address(pool), mintAmount);
    }

    function _defaultProof() private view returns (ContributionPool.ContributionProof memory) {
        return ContributionPool.ContributionProof({
            projectId: projectId,
            roundId: roundId,
            contributor: contributor,
            score: 42,
            proofHash: keccak256("proof"),
            paymentIdHash: keccak256("payment"),
            nonce: 7,
            deadline: block.timestamp + 1 days
        });
    }

    function _contributionProof(
        address proofContributor,
        uint256 score,
        string memory proofSalt,
        string memory paymentSalt,
        uint256 nonce
    ) private view returns (ContributionPool.ContributionProof memory) {
        return ContributionPool.ContributionProof({
            projectId: projectId,
            roundId: roundId,
            contributor: proofContributor,
            score: score,
            proofHash: keccak256(bytes(proofSalt)),
            paymentIdHash: keccak256(bytes(paymentSalt)),
            nonce: nonce,
            deadline: block.timestamp + 1 days
        });
    }

    function _recordContribution(ContributionPool.ContributionProof memory proof) private {
        pool.recordContributionBySig(proof, _signProof(pool, agentSignerPrivateKey, proof));
    }

    function _signProof(
        ContributionPoolHarness targetPool,
        uint256 privateKey,
        ContributionPool.ContributionProof memory proof
    ) private view returns (bytes memory) {
        bytes32 digest = targetPool.hashTypedData(proof);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, digest);

        return abi.encodePacked(r, s, v);
    }
}
