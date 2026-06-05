// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {ContributionPool} from "../src/ContributionPool.sol";

contract RecordDemoContribution is Script {
    error RecordDemoContribution__MissingPoolAddress();
    error RecordDemoContribution__MissingAgentPrivateKey();
    error RecordDemoContribution__MissingExecutorPrivateKey();
    error RecordDemoContribution__AgentSignerMismatch(address actual, address expected);

    uint256 private constant DEFAULT_PROJECT_ID = 1;
    uint256 private constant DEFAULT_ROUND_ID = 1;
    uint256 private constant DEFAULT_SCORE = 50;
    uint256 private constant DEFAULT_CONTRIBUTOR_KEY = 0xC011AB;

    bytes32 private constant EIP712_DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 private constant EIP712_NAME_HASH = keccak256("CGHubContributionPool");
    bytes32 private constant EIP712_VERSION_HASH = keccak256("1");

    function run() external {
        ContributionPool pool = ContributionPool(_readPoolAddress());
        uint256 agentPrivateKey = vm.envOr("AGENT_PRIVATE_KEY", uint256(0));
        uint256 executorPrivateKey = vm.envOr("EXECUTOR_PRIVATE_KEY", vm.envOr("PRIVATE_KEY", uint256(0)));

        if (agentPrivateKey == 0) {
            revert RecordDemoContribution__MissingAgentPrivateKey();
        }

        if (executorPrivateKey == 0) {
            revert RecordDemoContribution__MissingExecutorPrivateKey();
        }

        address actualAgentSigner = vm.addr(agentPrivateKey);
        address expectedAgentSigner = pool.agentSigner();
        if (actualAgentSigner != expectedAgentSigner) {
            revert RecordDemoContribution__AgentSignerMismatch(actualAgentSigner, expectedAgentSigner);
        }

        ContributionPool.ContributionProof memory proof = _demoProof();
        bytes memory signature = _signProof(pool, proof, agentPrivateKey);

        _logDemoData(pool, proof, signature, actualAgentSigner, vm.addr(executorPrivateKey));

        vm.startBroadcast(executorPrivateKey);
        pool.recordContributionBySig(proof, signature);
        vm.stopBroadcast();
    }

    function _readPoolAddress() private view returns (address poolAddress) {
        poolAddress = vm.envOr("POOL_ADDRESS", address(0));
        if (poolAddress == address(0)) {
            poolAddress = vm.envOr("POOL", address(0));
        }

        if (poolAddress == address(0)) {
            revert RecordDemoContribution__MissingPoolAddress();
        }
    }

    function _demoProof() private view returns (ContributionPool.ContributionProof memory) {
        uint256 projectId = vm.envOr("PROJECT_ID", DEFAULT_PROJECT_ID);
        uint256 roundId = vm.envOr("ROUND_ID", DEFAULT_ROUND_ID);
        address contributor = vm.envOr("CONTRIBUTOR_ADDRESS", vm.addr(DEFAULT_CONTRIBUTOR_KEY));
        uint256 score = vm.envOr("SCORE", DEFAULT_SCORE);
        uint256 nonce = vm.envOr("PROOF_NONCE", block.timestamp);
        uint256 deadline = vm.envOr("PROOF_DEADLINE", block.timestamp + 1 days);
        string memory proofSalt = vm.envOr("PROOF_SALT", string("demo-proof"));
        string memory paymentId = vm.envOr("PAYMENT_ID", string("demo-payment"));

        return ContributionPool.ContributionProof({
            projectId: projectId,
            roundId: roundId,
            contributor: contributor,
            score: score,
            proofHash: keccak256(abi.encodePacked(proofSalt, projectId, roundId, contributor, nonce)),
            paymentIdHash: keccak256(abi.encodePacked(paymentId, projectId, roundId, contributor, nonce)),
            nonce: nonce,
            deadline: deadline
        });
    }

    function _signProof(
        ContributionPool pool,
        ContributionPool.ContributionProof memory proof,
        uint256 agentPrivateKey
    ) private view returns (bytes memory) {
        bytes32 domainSeparator = keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                EIP712_NAME_HASH,
                EIP712_VERSION_HASH,
                block.chainid,
                address(pool)
            )
        );
        bytes32 structHash = keccak256(
            abi.encode(
                pool.CONTRIBUTION_TYPEHASH(),
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
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(agentPrivateKey, digest);

        return abi.encodePacked(r, s, v);
    }

    function _logDemoData(
        ContributionPool pool,
        ContributionPool.ContributionProof memory proof,
        bytes memory signature,
        address agentSigner,
        address executor
    ) private pure {
        console2.log("ContributionPool", address(pool));
        console2.log("Agent signer", agentSigner);
        console2.log("Executor", executor);
        console2.log("Project id", proof.projectId);
        console2.log("Round id", proof.roundId);
        console2.log("Contributor", proof.contributor);
        console2.log("Score", proof.score);
        console2.log("Nonce", proof.nonce);
        console2.log("Deadline", proof.deadline);
        console2.log("Proof hash");
        console2.logBytes32(proof.proofHash);
        console2.log("Payment id hash");
        console2.logBytes32(proof.paymentIdHash);
        console2.log("Signature");
        console2.logBytes(signature);
    }
}
