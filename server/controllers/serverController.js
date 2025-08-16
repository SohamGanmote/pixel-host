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
		`cd ${SERVER_DIR} && java -Xms4096M -Xmx4096M -jar ${SERVER_JAR} nogui`,
	]);

	startUptime();

	mcProcess.stdout.on("data", (data) =>
		broadcastLog(`[MC] ${data.toString()}`)
	);

		mcProcess.stdout.on("data", (data) => {
		const output = data.toString();

		// Detect ask prompt
		const match = output.match(/<([^>]+)>\s+ask\s+(.+)/i);
		if (match) {
			const player = match[1];
			const prompt = match[2].trim();
			console.log(`Received ask command from ${player}: ${prompt}`);

			const escapedPrompt = prompt.replace(/"/g, '\\"');
			const llamaCmd = `/home/fezzy/shared-drive/LLM/llama.cpp/build/bin/llama-cli \
  			-m /home/fezzy/shared-drive/LLM/llama.cpp/models/phi-2.gguf \
  			-p "User: Answer briefly in one short sentence: ${escapedPrompt} in minecraft\\nAssistant:" \
  			--n-predict 50 \
  			--ctx-size 256 \
  			--threads 2
			`;

			const llama = spawn("bash", ["-c", llamaCmd]);

			let answer = "";

			llama.stdout.on("data", (data) => {
				const chunk = data.toString();
				console.log(`[llama output] ${chunk}`);
				answer += chunk;
			});

			llama.stderr.on("data", (data) => {
				console.error(`llama stderr: ${data}`);
			});

			llama.on("error", (err) => {
				console.error(`Failed to start llama process: ${err.message}`);
			});

			llama.on("close", () => {
				const cleanAnswer = answer
					.split("Assistant:")
					.pop() // Keep only content after 'Assistant:'
					.replace(/\[.*?\]/g, "") // Remove bracketed tags like [llama output]
					.replace(/\s+/g, " ") // Normalize whitespace
					.replace(/[^a-zA-Z0-9\s.,!?'"()-]/g, "") // Strip non-printables
					.trim();

				console.log(`Final answer: ${cleanAnswer}`);
				mcProcess.stdin.write(
					`/tellraw @a {"text":"${
						cleanAnswer || "Sorry, I couldn't generate a response."
					}","color":"green"}\n`
				);
			});
		}
	});
	
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

