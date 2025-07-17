const os = require("os");

let metricsClients = [];
let serverStartTime = null;

function startUptime() {
	serverStartTime = Date.now();
}

function stopUptime() {
	serverStartTime = null;
}

function broadcastMetrics() {
	const totalMem = os.totalmem();
	const freeMem = os.freemem();
	const usedMem = totalMem - freeMem;
	const memUsagePercent = ((usedMem / totalMem) * 100).toFixed(2);

	const load = os.loadavg()[0];
	const cpuCount = os.cpus().length;
	const cpuLoadPercent = ((load / cpuCount) * 100).toFixed(2);

	let uptimeHours = 0;
	let uptimeMinutes = 0;

	if (serverStartTime) {
		const diffSec = Math.floor((Date.now() - serverStartTime) / 1000);
		uptimeHours = Math.floor(diffSec / 3600);
		uptimeMinutes = Math.floor((diffSec % 3600) / 60);
	}

	const payload = {
		memory: { percent: parseFloat(memUsagePercent) },
		cpu: { percent: parseFloat(cpuLoadPercent) },
		uptime: { hours: uptimeHours, minutes: uptimeMinutes },
	};

	const data = `data: ${JSON.stringify(payload)}\n\n`;
	metricsClients.forEach((res) => res.write(data));
}

function attachMetricsStream(req, res) {
	res.set({
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache",
		Connection: "keep-alive",
	});
	res.flushHeaders();
	metricsClients.push(res);
	res.on("close", () => {
		metricsClients = metricsClients.filter((c) => c !== res);
	});
}

module.exports = {
	broadcastMetrics,
	attachMetricsStream,
	startUptime,
	stopUptime,
};
