/** @param {NS} ns */
export async function main(ns) {
    const filename = "early-hack-template.js"; // The file you want to update
    const visited = new Set();
    const queue = ["home"];
  
    // Breadth-first search to find all connected servers
    while (queue.length > 0) {
      const current = queue.shift();
      if (visited.has(current)) continue;
      visited.add(current);
  
      const neighbors = ns.scan(current);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) queue.push(neighbor);
      }
    }
  
    const servers = Array.from(visited).filter(s => s !== "home");
  
    // Add purchased servers to the list of servers to update
    const purchasedServers = ns.getPurchasedServers();
    purchasedServers.forEach(purchasedServer => {
      if (!visited.has(purchasedServer)) {
        servers.push(purchasedServer);
      }
    });
  
    // Loop through each server to delete and update the file
    for (const server of servers) {
      // Remove old version of the file if it exists
      if (ns.fileExists(filename, server)) {
        ns.rm(filename, server);
        ns.tprint(`❌ Deleted ${filename} from ${server}`);
      }
      // Copy the updated file to the server
      await ns.scp(filename, server);
      ns.tprint(`✅ Updated ${filename} on ${server}`);
    }
  }
  