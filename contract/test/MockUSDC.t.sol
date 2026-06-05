// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {MockUSDC} from "../src/mocks/MockUSDC.sol";

contract MockContributionPool {
    using SafeERC20 for IERC20;

    IERC20 public immutable ASSET;

    constructor(IERC20 asset_) {
        ASSET = asset_;
    }

    function fundFrom(address from, uint256 amount) external {
        ASSET.safeTransferFrom(from, address(this), amount);
    }
}

contract MockUSDCTest is Test {
    MockUSDC private usdc;
    MockContributionPool private pool;

    address private project = address(0xA11CE);

    function setUp() public {
        usdc = new MockUSDC();
        pool = new MockContributionPool(IERC20(address(usdc)));
    }

    function testMetadataUsesMockUSDCValues() public view {
        assertEq(usdc.name(), "Mock USDC");
        assertEq(usdc.symbol(), "mUSDC");
        assertEq(usdc.decimals(), 6);
    }

    function testCanMintOneHundredUSDCToProject() public {
        usdc.mint(project, 100e6);

        assertEq(usdc.balanceOf(project), 100e6);
        assertEq(usdc.totalSupply(), 100e6);
    }

    function testProjectCanApprovePool() public {
        usdc.mint(project, 100e6);

        vm.prank(project);
        bool approved = usdc.approve(address(pool), 100e6);

        assertTrue(approved);
        assertEq(usdc.allowance(project, address(pool)), 100e6);
    }

    function testPoolCanReceiveFundsWithSafeTransferFrom() public {
        usdc.mint(project, 100e6);

        vm.prank(project);
        usdc.approve(address(pool), 100e6);

        pool.fundFrom(project, 100e6);

        assertEq(usdc.balanceOf(project), 0);
        assertEq(usdc.balanceOf(address(pool)), 100e6);
    }
}
