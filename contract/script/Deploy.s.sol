// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Script, console2} from "forge-std/Script.sol";
import {ContributionPool} from "../src/ContributionPool.sol";
import {MockUSDC} from "../src/mocks/MockUSDC.sol";

contract Deploy is Script {
    using SafeERC20 for IERC20;

    error Deploy__InvalidOwner();
    error Deploy__InvalidAgentSigner();
    error Deploy__InvalidToken();
    error Deploy__InvalidPrivateKey();
    error Deploy__MainnetDeployDisabled();
    error Deploy__AmbiguousTokenConfig();
    error Deploy__FundRequiresRound();
    error Deploy__ZeroFundAmount();
    error Deploy__RoundNotCreated();
    error Deploy__RoundTokenMismatch(address actual, address expected);
    error Deploy__UnexpectedFundedAmount(uint256 actual, uint256 expected);

    struct DeploymentConfig {
        uint256 deployerKey;
        address initialOwner;
        address agentSigner;
        address token;
        uint256 projectId;
        uint256 roundId;
        uint256 initialFundAmount;
        bool deployMockUsdc;
        bool createRound;
        bool fundRound;
    }

    uint256 private constant LOCAL_CHAIN_ID = 31_337;
    uint256 private constant ETHEREUM_MAINNET_CHAIN_ID = 1;
    uint256 private constant DEFAULT_PROJECT_ID = 1;
    uint256 private constant DEFAULT_ROUND_ID = 1;
    uint256 private constant DEFAULT_INITIAL_FUND_AMOUNT = 100e6;
    uint256 private constant DEFAULT_ANVIL_PRIVATE_KEY =
        0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
    uint256 private constant DEFAULT_LOCAL_AGENT_SIGNER_KEY = 0xB0B;

    function run() external returns (ContributionPool, address) {
        DeploymentConfig memory config = _readConfig();
        address deployer = vm.addr(config.deployerKey);
        address token = config.token;
        bool ownershipTransferred = false;

        vm.startBroadcast(config.deployerKey);

        if (config.deployMockUsdc) {
            MockUSDC mockUsdc = new MockUSDC();
            token = address(mockUsdc);
        }

        address setupOwner = config.createRound ? deployer : config.initialOwner;
        ContributionPool pool = new ContributionPool(setupOwner, config.agentSigner);

        if (config.createRound) {
            pool.createRound(config.projectId, config.roundId, token);

            if (config.fundRound) {
                if (config.deployMockUsdc) {
                    MockUSDC(token).mint(deployer, config.initialFundAmount);
                }

                IERC20(token).forceApprove(address(pool), config.initialFundAmount);
                pool.fundRound(config.projectId, config.roundId, config.initialFundAmount);
            }

            if (config.initialOwner != deployer) {
                pool.transferOwnership(config.initialOwner);
                ownershipTransferred = true;
            }
        }

        vm.stopBroadcast();

        _validateRound(pool, token, config);
        _logDeployment(pool, token, deployer, ownershipTransferred, config);

        return (pool, token);
    }

    function _readConfig() private view returns (DeploymentConfig memory config) {
        bool isLocal = block.chainid == LOCAL_CHAIN_ID;
        if (block.chainid == ETHEREUM_MAINNET_CHAIN_ID && !vm.envOr("ALLOW_MAINNET_DEPLOY", false)) {
            revert Deploy__MainnetDeployDisabled();
        }

        uint256 deployerKey =
            isLocal ? vm.envOr("PRIVATE_KEY", DEFAULT_ANVIL_PRIVATE_KEY) : vm.envOr("PRIVATE_KEY", uint256(0));
        if (deployerKey == 0) {
            revert Deploy__InvalidPrivateKey();
        }

        address deployer = vm.addr(deployerKey);
        address initialOwner = vm.envOr("INITIAL_OWNER", deployer);
        address agentSigner =
            vm.envOr("INITIAL_AGENT_SIGNER", isLocal ? vm.addr(DEFAULT_LOCAL_AGENT_SIGNER_KEY) : address(0));
        address configuredToken = vm.envOr("USDC_ADDRESS", address(0));
        bool deployMockUsdc = vm.envOr("DEPLOY_MOCK_USDC", isLocal && configuredToken == address(0));
        bool createRound = vm.envOr("CREATE_ROUND", true);
        uint256 defaultFundAmount = deployMockUsdc && isLocal ? DEFAULT_INITIAL_FUND_AMOUNT : 0;
        uint256 initialFundAmount = vm.envOr("INITIAL_FUND_AMOUNT", defaultFundAmount);
        bool fundRound = vm.envOr("FUND_ROUND", initialFundAmount > 0);

        if (initialOwner == address(0)) {
            revert Deploy__InvalidOwner();
        }

        if (agentSigner == address(0)) {
            revert Deploy__InvalidAgentSigner();
        }

        if (deployMockUsdc && configuredToken != address(0)) {
            revert Deploy__AmbiguousTokenConfig();
        }

        if (!deployMockUsdc && configuredToken == address(0)) {
            revert Deploy__InvalidToken();
        }

        if (fundRound && !createRound) {
            revert Deploy__FundRequiresRound();
        }

        if (fundRound && initialFundAmount == 0) {
            revert Deploy__ZeroFundAmount();
        }

        config = DeploymentConfig({
            deployerKey: deployerKey,
            initialOwner: initialOwner,
            agentSigner: agentSigner,
            token: configuredToken,
            projectId: vm.envOr("PROJECT_ID", DEFAULT_PROJECT_ID),
            roundId: vm.envOr("ROUND_ID", DEFAULT_ROUND_ID),
            initialFundAmount: initialFundAmount,
            deployMockUsdc: deployMockUsdc,
            createRound: createRound,
            fundRound: fundRound
        });
    }

    function _validateRound(ContributionPool pool, address token, DeploymentConfig memory config) private view {
        if (!config.createRound) {
            return;
        }

        (address roundToken, uint256 funded,, bool exists,) = pool.rounds(config.projectId, config.roundId);
        if (!exists) {
            revert Deploy__RoundNotCreated();
        }

        if (roundToken != token) {
            revert Deploy__RoundTokenMismatch(roundToken, token);
        }

        if (config.fundRound && funded != config.initialFundAmount) {
            revert Deploy__UnexpectedFundedAmount(funded, config.initialFundAmount);
        }
    }

    function _logDeployment(
        ContributionPool pool,
        address token,
        address deployer,
        bool ownershipTransferred,
        DeploymentConfig memory config
    ) private pure {
        console2.log("ContributionPool", address(pool));
        if (config.deployMockUsdc) {
            console2.log("MockUSDC", token);
        } else {
            console2.log("USDC", token);
        }

        console2.log("Deployer", deployer);
        console2.log("Final owner", config.initialOwner);
        console2.log("Agent signer", config.agentSigner);
        console2.log("Project id", config.projectId);
        console2.log("Round id", config.roundId);
        console2.log("Initial fund amount", config.initialFundAmount);

        if (config.createRound) {
            console2.log("Round created");
        } else {
            console2.log("Round creation skipped");
        }

        if (config.fundRound) {
            console2.log("Round funded");
        }

        if (ownershipTransferred) {
            console2.log("Ownership transferred to final owner");
        }
    }
}
