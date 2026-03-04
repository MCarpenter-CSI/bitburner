/** @param {NS} ns **/
export async function main(ns) {
    const visited = new Set();
    const serversToScan = ["home"];
    const contracts = [];

    // Breadth-first scan
    while (serversToScan.length > 0) {
        const current = serversToScan.pop();
        if (visited.has(current)) continue;
        visited.add(current);

        const neighbors = ns.scan(current);
        serversToScan.push(...neighbors);

        const files = ns.ls(current, ".cct");
        if (files.length > 0) {
            for (const file of files) {
                contracts.push({ server: current, file });
            }
        }
    }

    // Output contracts found
    if (contracts.length === 0) {
        ns.tprint("No hacking contracts found.");
    } else {
        ns.tprint("Found the following hacking contracts:");
        for (const { server, file } of contracts) {
            ns.tprint(`- ${file} on ${server}`);
        }
    }
}
