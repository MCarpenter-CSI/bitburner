import { scanall } from "/basic/scanner.js";

// Dumb hive doesn't have a queen and just blasts servers. Keeps "home" from
// biasing the swarm's numbers while taking advantage of its extra cores.
export async function main(ns) {
  const servers = await scanall(ns);
  const targets = servers.filter(s => !s.name.includes("pserv") && s.name !== "home"); // cleaner filtering

  let scriptram = ns.getScriptRam("/hive/worker.js", "home");
  let usedram = 0;
  let port = 1;
  let ports = [];
  let flipflop = true;

  while (true) {
    // Recalculate free RAM each loop for accuracy
    const freeram = ns.getServerMaxRam("home") - ns.getServerUsedRam("home");

    // Only spawn more workers if there's enough room for at least two scripts
    if (usedram < freeram - scriptram * 2) {
      for (let i = 0; i < targets.length; ++i) {
        const action = flipflop ? "weaken" : "grow";
        ports.push(port);
        ns.exec("/hive/worker.js", "home", 1, action, targets[i].name, port);
        port += 1;
        usedram += scriptram;
      }

      // Flip the operation for the next cycle
      flipflop = !flipflop;

      await ns.sleep(200);
    }

    // Check for completed workers via ports
    if (ports.length > 10) {
      for (let i = ports.length - 1; i >= 0; --i) {
        const callback = ns.readPort(ports[i]);
        if (callback !== "NULL PORT DATA") {
          usedram -= scriptram;
          ports.splice(i, 1);
          await ns.sleep(200);
        }
      }
    }

    // Avoid CPU spin
    await ns.sleep(50);
  }
}