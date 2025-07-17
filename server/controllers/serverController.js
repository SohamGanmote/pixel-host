const { spawn } = require("child_process");
const { broadcastLog } = require("../services/logService");
const {
	startUptime,
	stopUptime,
} = require("../services/metricsService");
const { readProperties, writeProperties } = require("../utils/fileUtils");
const { SERVER_DIR, SERVER_JAR } = require("../config/constants");

let mcProcess = null;

function startServer(req, res) {
	if (mcProcess) return res.json({ message: "Server already running." });

	mcProcess = spawn("bash", [
		"-c",
		`cd ${SERVER_DIR} && java -Xms1024M -Xmx1024M -jar ${SERVER_JAR} nogui`,
	]);

	startUptime();

	mcProcess.stdout.on("data", (data) =>
		broadcastLog(`[MC] ${data.toString()}`)
	);
	mcProcess.stderr.on("data", (data) =>
		broadcastLog(`[MC-ERR] ${data.toString()}`)
	);
	mcProcess.on("exit", (code) => {
		broadcastLog(`[MC] Minecraft exited with code ${code}`);
		mcProcess = null;
		stopUptime();
	});

	res.json({ message: "Server started." });
}

function stopServer(req, res) {
	if (!mcProcess) return res.json({ message: "Server not running." });
	mcProcess.kill("SIGINT");
	res.json({ message: "Server stopping..." });
}

function sendCommand(req, res) {
	const { command, type = "mc" } = req.body;
	if (!command)
		return res.status(400).json({ message: "No command provided." });

	if (type === "shell") {
		const proc = spawn("bash", ["-c", command]);
		proc.stdout.on("data", (data) => broadcastLog(`[CMD] ${data.toString()}`));
		proc.stderr.on("data", (data) =>
			broadcastLog(`[CMD-ERR] ${data.toString()}`)
		);
		proc.on("exit", (code) =>
			broadcastLog(`Shell command exited with code ${code}`)
		);
		return res.json({ message: `Running shell command: ${command}` });
	}

	if (type === "mc") {
		if (!mcProcess)
			return res.status(400).json({ message: "Server not running." });
		mcProcess.stdin.write(command + "\n");
		broadcastLog(`[MC-CMD] ${command}`);
		return res.json({ message: `Sent to server: ${command}` });
	}

	res.status(400).json({ message: "Invalid command type." });
}

function getServerStatus(req, res) {
	res.json({ running: !!mcProcess });
}

function getSettings(req, res) {
	readProperties((err, data) => {
		if (err)
			return res.status(500).json({ message: "Failed to read settings." });
		res.json(data);
	});
}

function saveSettings(req, res) {
	writeProperties(req.body, (err) => {
		if (err)
			return res.status(500).json({ message: "Failed to save settings." });
		res.json({ message: "Settings saved successfully." });
	});
}

module.exports = {
	startServer,
	stopServer,
	sendCommand,
	getServerStatus,
	getSettings,
	saveSettings,
};
