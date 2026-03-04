// /** @param {NS} ns */
// export async function main(ns) {
//     // Array of all servers that don't need any ports opened
//     // to gain root access. These have 16 GB of RAM
//     const servers0Port16 = ["sigma-cosmetics",
//       "joesguns",
//       "foodnstuff",
//       "nectar-net",
//       "hong-fang-tea",
//       "harakiri-sushi"];
  
//     // Array of all servers that only need 1 port opened
//     // to gain root access. These have 32 GB of RAM
//     const servers1Port32 = ["neo-net",
//       "zer0",
//       "max-hardware",
//       "iron-gym"];
  
//     // Array of all servers that only need 2 ports opened
//     // to gain root access. These have 32 BG of RAM
//     const servers2Port32 = ["phantasy",
//       "omega-net"];
  
//     // Array of all servers that only need 2 ports opened
//     // to gain root access. These have 64 BG of RAM
//     const servers2Port64 = ["silver-helix"];
  
//     // Copy our scripts onto each server that requires 0 ports
//     // to gain root access. Then use nuke() to gain admin access and
//     // run the scripts.
//     for (let i = 0; i < servers0Port16.length; ++i) {
//       const serv = servers0Port16[i];
  
//       ns.scp("early-hack-template.js", serv);
//       ns.nuke(serv);
//       ns.exec("early-hack-template.js", serv, 6);
//     }
  
//     // Wait until we acquire the "BruteSSH.exe" program
//     while (!ns.fileExists("BruteSSH.exe")) {
//       await ns.sleep(60000);
//     }
  
//     // Copy our scripts onto each server that requires 1 port
//     // to gain root access. Then use brutessh() and nuke()
//     // to gain admin access and run the scripts.
//     // 32 GB of RAM = 12 threads
//     for (let i = 0; i < servers1Port32.length; ++i) {
//       const serv = servers1Port32[i];
  
//       ns.scp("early-hack-template.js", serv);
//       ns.brutessh(serv);
//       ns.nuke(serv);
//       ns.exec("early-hack-template.js", serv, 12);
//     }
  
//     // Wait until we acquire the "FTPCrack.exe" program
//     while (!ns.fileExists("FTPCrack.exe")) {
//       await ns.sleep(60000);
//     }
  
//     // Copy our scripts onto each server that requires 2 ports
//     // to gain root access. Then use brutessh(), ftpcrack(), and nuke()
//     // to gain admin access and run the scripts.
//     // 32 GB of RAM = 12 threads
//     for (let i = 0; i < servers2Port32.length; ++i) {
//       const serv = servers2Port32[i];
  
//       ns.scp("early-hack-template.js", serv);
//       ns.brutessh(serv);
//       ns.ftpcrack(serv);
//       ns.nuke(serv);
//       ns.exec("early-hack-template.js", serv, 12);
//     }
  
//     // Copy our scripts onto each server that requires 2 ports
//     // to gain root access. Then use brutessh(), ftpcrack(), and nuke()
//     // to gain admin access and run the scripts.
//     // 64 GB of RAM = 24 threads
//     for (let i = 0; i < servers2Port64.length; ++i) {
//       const serv = servers2Port64[i];
  
//       ns.scp("early-hack-template.js", serv);
//       ns.brutessh(serv);
//       ns.ftpcrack(serv);
//       ns.nuke(serv);
//       ns.exec("early-hack-template.js", serv, 24);
//     }
//   }


/** @param {NS} ns */
export async function main(ns) {
    const targetScript = "early-hack-template.js";
    const root = "home";
    const maxDepth = 5;
    const visited = new Set();
    const queue = [{ name: root, depth: 0 }];
  
    while (queue.length > 0) {
      const { name: server, depth } = queue.shift();
      if (visited.has(server) || depth > maxDepth) continue;
      visited.add(server);
  
      const neighbors = ns.scan(server);
      for (const neighbor of neighbors) {
        queue.push({ name: neighbor, depth: depth + 1 });
      }
  
      if (server === "home" || ns.getServerMaxRam(server) < 2) continue;
  
      // Try to gain root
      tryRoot(ns, server);
  
      if (ns.hasRootAccess(server)) {
        const maxRam = ns.getServerMaxRam(server);
        const usedRam = ns.getServerUsedRam(server);
        const scriptRam = ns.getScriptRam(targetScript);
        const availableRam = maxRam - usedRam;
        const threads = Math.floor(availableRam / scriptRam);
  
        if (threads > 0) {
          await ns.scp(targetScript, server);
          ns.exec(targetScript, server, threads);
          ns.tprint(`✅ Running ${targetScript} on ${server} with ${threads} threads`);
        }
      }
    }
  }
  
  /** @param {NS} ns */
  function tryRoot(ns, server) {
    if (ns.hasRootAccess(server)) return;
  
    const programs = [
      { file: "BruteSSH.exe", fn: ns.brutessh },
      { file: "FTPCrack.exe", fn: ns.ftpcrack },
      { file: "relaySMTP.exe", fn: ns.relaysmtp },
      { file: "HTTPWorm.exe", fn: ns.httpworm },
      { file: "SQLInject.exe", fn: ns.sqlinject },
    ];
  
    for (const { file, fn } of programs) {
      if (ns.fileExists(file)) {
        try {
          fn(server);
        } catch { /* already opened or not needed */ }
      }
    }
  
    try {
      ns.nuke(server);
    } catch { /* can't nuke yet */ }
  }
  