// /** @param {NS} ns **/
// export async function main(ns) {
//     const PHASE_ONE_MAX_LEVEL = 60; // Maximum level for Hacknet Nodes in Phase 1
//     const PHASE_ONE_MAX_RAM = 2;    // Maximum RAM for Hacknet Nodes in Phase 1
//     const PHASE_ONE_MAX_CORES = 2;  // Maximum number of cores for Hacknet Nodes in Phase 1

//     const PHASE_TWO_MAX_LEVEL = 200; // Maximum level for Hacknet Nodes in Phase 2
//     const PHASE_TWO_MAX_RAM = 64;    // Maximum RAM for Hacknet Nodes in Phase 2
//     const PHASE_TWO_MAX_CORES = 16;  // Maximum number of cores for Hacknet Nodes in Phase 2

//     const PHASE_ONE_SLEEP = 90000; // Sleep time for phase one
//     const PHASE_ONE_DURATION = 20000; // Duration for phase one

//     const PHASE_TWO_SLEEP = 180000; // Sleep time for phase two
//     const PHASE_TWO_DURATION = 20000; // Duration for phase two

//     while (true) {
//         let nodes = ns.hacknet.numNodes();

//         if (nodes < 10) {
//             // Phase One
//             await phaseOne(ns, PHASE_ONE_MAX_LEVEL, PHASE_ONE_MAX_RAM, PHASE_ONE_MAX_CORES, PHASE_ONE_SLEEP, PHASE_ONE_DURATION);
//         } else {
//             // Phase Two
//             await phaseTwo(ns, PHASE_TWO_MAX_LEVEL, PHASE_TWO_MAX_RAM, PHASE_TWO_MAX_CORES, PHASE_TWO_SLEEP, PHASE_TWO_DURATION);
//         }
//     }
// }

// async function phaseOne(ns, maxLevel, maxRam, maxCores, sleepTime, duration) {
//     // Sleep before starting the upgrade/purchase process
//     await ns.sleep(sleepTime);

//     // Start the window for purchases and upgrades
//     let startTime = Date.now();
//     let endTime = startTime + duration;

//     while (Date.now() < endTime) {
//         await upgradeNodes(ns, maxLevel, maxRam, maxCores);
//         await ns.sleep(100); // Small sleep to avoid spamming the game
//     }
// }

// async function phaseTwo(ns, maxLevel, maxRam, maxCores, sleepTime, duration) {
//     // Sleep before starting the upgrade/purchase process
//     await ns.sleep(sleepTime);

//     // Start the window for purchases and upgrades
//     let startTime = Date.now();
//     let endTime = startTime + duration;

//     while (Date.now() < endTime) {
//         await upgradeNodes(ns, maxLevel, maxRam, maxCores);
//         await ns.sleep(100); // Small sleep to avoid spamming the game
//     }
// }

// async function upgradeNodes(ns, maxLevel, maxRam, maxCores) {
//     let playerMoney = ns.getPlayer().money;

//     let allNodesMaxed = true;
//     let nodes = ns.hacknet.numNodes();

//     // Calculate EPS for each node and find the one with the lowest EPS
//     let lowestEarningNode = -1;
//     let lowestEps = Infinity;

//     for (let i = 0; i < nodes; i++) {
//         let nodeStats = ns.hacknet.getNodeStats(i);
//         let eps = nodeStats.production;

//         if (eps < lowestEps) {
//             lowestEps = eps;
//             lowestEarningNode = i;
//         }

//         // Check if the current node is fully upgraded
//         if (nodeStats.level < maxLevel || nodeStats.ram < maxRam || nodeStats.cores < maxCores) {
//             allNodesMaxed = false;
//         }
//     }

//     // If a node with the lowest EPS was found, try to upgrade it
//     if (lowestEarningNode !== -1) {
//         let nodeStats = ns.hacknet.getNodeStats(lowestEarningNode);

//         let levelUpgradeCost = ns.hacknet.getLevelUpgradeCost(lowestEarningNode, 1);
//         let ramUpgradeCost = ns.hacknet.getRamUpgradeCost(lowestEarningNode, 1);
//         let coreUpgradeCost = ns.hacknet.getCoreUpgradeCost(lowestEarningNode, 1);

//         // Buy level upgrade if there is enough money
//         if (playerMoney >= levelUpgradeCost && nodeStats.level < maxLevel) {
//             ns.hacknet.upgradeLevel(lowestEarningNode, 1);
//             playerMoney -= levelUpgradeCost;
//         }

//         // Buy RAM upgrade if there is enough money
//         if (playerMoney >= ramUpgradeCost && nodeStats.ram < maxRam) {
//             ns.hacknet.upgradeRam(lowestEarningNode, 1);
//             playerMoney -= ramUpgradeCost;
//         }

//         // Buy core upgrade if there is enough money
//         if (playerMoney >= coreUpgradeCost && nodeStats.cores < maxCores) {
//             ns.hacknet.upgradeCore(lowestEarningNode, 1);
//             playerMoney -= coreUpgradeCost;
//         }
//     }

//     // If all nodes are fully upgraded, try to buy a new Hacknet Node
//     if (allNodesMaxed && playerMoney >= ns.hacknet.getPurchaseNodeCost()) {
//         ns.hacknet.purchaseNode();
//     }
// }

/** @param {NS} ns **/
export async function main(ns) {
    const PHASE_ONE = { maxLevel: 60, maxRam: 2, maxCores: 2, sleep: 90000, duration: 20000 };
    const PHASE_TWO = { maxLevel: 200, maxRam: 64, maxCores: 16, sleep: 180000, duration: 20000 };

    while (true) {
        let nodes = ns.hacknet.numNodes();
        let phase = nodes < 10 ? PHASE_ONE : PHASE_TWO;

        await ns.sleep(phase.sleep);
        const end = Date.now() + phase.duration;

        while (Date.now() < end) {
            await upgradeNodes(ns, phase.maxLevel, phase.maxRam, phase.maxCores);
            await ns.sleep(100);
        }
    }
}

async function upgradeNodes(ns, maxLevel, maxRam, maxCores) {
    let playerMoney = ns.getPlayer().money;
    const nodeCount = ns.hacknet.numNodes();
    let allNodesMaxed = true;

    let bestValue = Infinity;
    let bestUpgrade = null;

    for (let i = 0; i < nodeCount; i++) {
        const stats = ns.hacknet.getNodeStats(i);

        if (stats.level < maxLevel) {
            const cost = ns.hacknet.getLevelUpgradeCost(i, 1);
            if (cost < bestValue) {
                bestValue = cost;
                bestUpgrade = () => ns.hacknet.upgradeLevel(i, 1);
            }
            allNodesMaxed = false;
        }

        if (stats.ram < maxRam) {
            const cost = ns.hacknet.getRamUpgradeCost(i, 1);
            if (cost < bestValue) {
                bestValue = cost;
                bestUpgrade = () => ns.hacknet.upgradeRam(i, 1);
            }
            allNodesMaxed = false;
        }

        if (stats.cores < maxCores) {
            const cost = ns.hacknet.getCoreUpgradeCost(i, 1);
            if (cost < bestValue) {
                bestValue = cost;
                bestUpgrade = () => ns.hacknet.upgradeCore(i, 1);
            }
            allNodesMaxed = false;
        }
    }

    if (bestUpgrade && playerMoney >= bestValue) {
        bestUpgrade();
    } else if (allNodesMaxed) {
        const cost = ns.hacknet.getPurchaseNodeCost();
        if (playerMoney >= cost) {
            ns.hacknet.purchaseNode();
        } else {
            await ns.sleep(5000); // Avoid spamming when fully maxed and no money
        }
    }
}
