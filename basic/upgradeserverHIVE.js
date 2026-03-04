/** @param {NS} ns */
export async function main(ns) {
    const maxRamLimit = 4096;

    while (true) {
        const servers = ns.getPurchasedServers();

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
                }
            }
        }

        await ns.sleep(20000); // Wait 20s before checking again
    }
}
