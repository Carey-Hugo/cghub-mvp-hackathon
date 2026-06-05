// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {ContributionPool} from "../src/ContributionPool.sol";
import {MockUSDC} from "../src/mocks/MockUSDC.sol";

contract LocalDemo is Script {
    error LocalDemo__UnexpectedValue(bytes32 label, uint256 actual, uint256 expected);

    uint256 private constant PROJECT_ID = 1;
    uint256 private constant ROUND_ID = 1;
    uint256 private constant FUNDED = 100e6;

    uint256 private constant OWNER_KEY = 0xA11CE;
    uint256 private constant AGENT_KEY = 0xB0B;
    uint256 private constant PROJECT_KEY = 0xF00D;
    uint256 private constant COBO_KEY = 0xC0B0;
    uint256 private constant ALICE_KEY = 0xA11;
    uint256 private constant BOB_KEY = 0xB0B0;
    uint256 private constant CAROL_KEY = 0xCA201;

    bytes32 private constant EIP712_DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 private constant EIP712_NAME_HASH = keccak256("CGHubContributionPool");
    bytes32 private constant EIP712_VERSION_HASH = keccak256("1");

    function run() external {
        address owner = vm.addr(OWNER_KEY);
        address agentSigner = vm.addr(AGENT_KEY);
        address project = vm.addr(PROJECT_KEY);
        address cobo = vm.addr(COBO_KEY);
        address alice = vm.addr(ALICE_KEY);
        address bob = vm.addr(BOB_KEY);
        address carol = vm.addr(CAROL_KEY);

        _label(owner, agentSigner, project, cobo, alice, bob, carol);

        vm.startPrank(owner);
        MockUSDC usdc = new MockUSDC();
        ContributionPool pool = new ContributionPool(owner, agentSigner);
        pool.createRound(PROJECT_ID, ROUND_ID, address(usdc));
        usdc.mint(project, FUNDED);
        vm.stopPrank();

        vm.startPrank(project);
        usdc.approve(address(pool), FUNDED);
        pool.fundRound(PROJECT_ID, ROUND_ID, FUNDED);
        vm.stopPrank();

        ContributionPool.ContributionProof memory aliceProof =
            _proof(alice, 50, "alice proof", "alice payment", 1);
        ContributionPool.ContributionProof memory bobProof =
            _proof(bob, 30, "bob proof", "bob payment", 2);
        ContributionPool.ContributionProof memory carolProof =
            _proof(carol, 20, "carol proof", "carol payment", 3);

        vm.startPrank(cobo);
        pool.recordContributionBySig(aliceProof, _signProof(pool, aliceProof));
        pool.recordContributionBySig(bobProof, _signProof(pool, bobProof));
        pool.recordContributionBySig(carolProof, _signProof(pool, carolProof));
        vm.stopPrank();

        vm.prank(owner);
        pool.finalizeRound(PROJECT_ID, ROUND_ID);

        _assertEq(pool.pending(PROJECT_ID, ROUND_ID, alice), 50e6, "alicePending");
        _assertEq(pool.pending(PROJECT_ID, ROUND_ID, bob), 30e6, "bobPending");
        _assertEq(pool.pending(PROJECT_ID, ROUND_ID, carol), 20e6, "carolPending");

        vm.startPrank(cobo);
        pool.claimFor(PROJECT_ID, ROUND_ID, alice);
        pool.claimFor(PROJECT_ID, ROUND_ID, bob);
        pool.claimFor(PROJECT_ID, ROUND_ID, carol);
        vm.stopPrank();

        _assertEq(usdc.balanceOf(alice), 50e6, "aliceBalance");
        _assertEq(usdc.balanceOf(bob), 30e6, "bobBalance");
        _assertEq(usdc.balanceOf(carol), 20e6, "carolBalance");
        _assertEq(usdc.balanceOf(address(pool)), 0, "poolBalance");

        console2.log("Local demo completed");
        console2.log("MockUSDC", address(usdc));
        console2.log("ContributionPool", address(pool));
        console2.log("Alice balance", usdc.balanceOf(alice));
        console2.log("Bob balance", usdc.balanceOf(bob));
        console2.log("Carol balance", usdc.balanceOf(carol));
    }

    function _label(
        address owner,
        address agentSigner,
        address project,
        address cobo,
        address alice,
        address bob,
        address carol
    ) private {
        vm.label(owner, "Owner");
        vm.label(agentSigner, "AgentSigner");
        vm.label(project, "Project");
        vm.label(cobo, "CoboCaller");
        vm.label(alice, "Alice");
        vm.label(bob, "Bob");
        vm.label(carol, "Carol");
    }

    function _proof(
        address contributor,
        uint256 score,
        string memory proofSalt,
        string memory paymentSalt,
        uint256 nonce
    ) private view returns (ContributionPool.ContributionProof memory) {
        return ContributionPool.ContributionProof({
            projectId: PROJECT_ID,
            roundId: ROUND_ID,
            contributor: contributor,
            score: score,
            proofHash: keccak256(bytes(proofSalt)),
            paymentIdHash: keccak256(bytes(paymentSalt)),
            nonce: nonce,
            deadline: block.timestamp + 1 days
        });
    }

    function _signProof(ContributionPool pool, ContributionPool.ContributionProof memory proof)
        private
        view
        returns (bytes memory)
    {
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
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(AGENT_KEY, digest);

        return abi.encodePacked(r, s, v);
    }

    function _assertEq(uint256 actual, uint256 expected, bytes32 label) private pure {
        if (actual != expected) {
            revert LocalDemo__UnexpectedValue(label, actual, expected);
        }
    }
}
