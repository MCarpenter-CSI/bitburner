// /** @param {NS} ns */
// export async function main(ns) {
//     const servers = ns.getPurchasedServers();
  
//     while (true) {
//       for (let i = 0; i < servers.length; i++) {
//         const server = servers[i];
//         const currentRam = ns.getServerMaxRam(server);
//         const nextRam = currentRam * 2;
  
//         // Only upgrade if under 2048GB and enough money is available
//         if (
//           nextRam <= 2048 &&
//           ns.getServerMoneyAvailable("home") > ns.getPurchasedServerUpgradeCost(server, nextRam)
//         ) {
//           const upgraded = ns.upgradePurchasedServer(server, nextRam);
//           if (upgraded) {
//             ns.tprint(`[UPGRADE] ${server} upgraded to ${nextRam}GB RAM`);
  
//             // Redeploy early-hack-template.js
//             const script = "early-hack-template.js";
//             const target = "harakiri-sushi"; // Change target if needed
//             const ramPerThread = ns.getScriptRam(script);
//             const maxThreads = Math.floor(ns.getServerMaxRam(server) / ramPerThread);
  
//             if (maxThreads > 0) {
//               ns.killall(server);
//               await ns.sleep(100); // Ensure the server is cleared before redeploy
//               ns.scp(script, server, "home");
//               ns.exec(script, server, maxThreads, target);
//               ns.tprint(`[DEPLOY] ${script} deployed to ${server} using ${maxThreads} threads`);
//             } else {
//               ns.tprint(`[SKIP] Not enough RAM to run ${script} on ${server}`);
//             }
//           }
//         }
//       }
  
//       await ns.sleep(20000); // Wait 20s before checking again
//     }
//   }
  
/** @param {NS} ns */
export async function main(ns) {
  const script = "early-hack-template.js";
  const maxRamLimit = 2048;

  while (true) {
      const servers = ns.getPurchasedServers();
      const target = getBestTarget(ns); // Dynamically select best target

      for (const server of servers) {
          const currentRam = ns.getServerMaxRam(server);
          const nextRam = currentRam * 2;

          if (
              nextRam <= maxRamLimit &&
              ns.getServerMoneyAvailable("home") > ns.getPurchasedServerUpgradeCost(server, nextRam)
          ) {
              const upgraded = ns.upgradePurchasedServer(server, nextRam);
              if (upgraded) {
                  ns.tprint(`[UPGRADE] ${server} upgraded to ${nextRam}GB RAM`);

                  // Redeploy only if upgraded
                  const ramPerThread = ns.getScriptRam(script);
                  const maxThreads = Math.floor(ns.getServerMaxRam(server) / ramPerThread);

                  if (maxThreads > 0) {
                      ns.killall(server);
                      await ns.sleep(100);
                      ns.scp(script, server, "home");
                      ns.exec(script, server, maxThreads, target);
                      ns.tprint(`[DEPLOY] ${script} deployed to ${server} targeting ${target} with ${maxThreads} threads`);
                  } else {
                      ns.tprint(`[SKIP] Not enough RAM to run ${script} on ${server}`);
                  }
              }
          }
      }

      await ns.sleep(20000); // Wait 20s before checking again
  }
}

/** Dynamically find the best hackable target with root access */
function getBestTarget(ns) {
  const serversToCheck = getAllServers(ns);
  let bestTarget = "n00dles";
  let bestScore = 0;

  for (const server of serversToCheck) {
      if (!ns.hasRootAccess(server)) continue;
      if (ns.getServerMaxMoney(server) === 0) continue;

      const money = ns.getServerMaxMoney(server);
      const sec = ns.getServerMinSecurityLevel(server);
      const score = money / sec;

      if (score > bestScore) {
          bestScore = score;
          bestTarget = server;
      }
  }

  return bestTarget;
}

/** Recursively scan all servers */
function getAllServers(ns, root = "home", found = new Set()) {
  found.add(root);
  for (const server of ns.scan(root)) {
      if (!found.has(server)) {
          getAllServers(ns, server, found);
      }
  }
  return [...found];
}

