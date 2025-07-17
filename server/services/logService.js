let logs = [];
let clients = [];

function broadcastLog(line) {
	logs.push(line);
	if (logs.length > 200) logs.shift();
	clients.forEach((res) => res.write(`data: ${line}\n\n`));
}

function attachLogStream(req, res) {
	res.set({
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache",
		Connection: "keep-alive",
	});
	res.flushHeaders();
	logs.forEach((line) => res.write(`data: ${line}\n\n`));
	clients.push(res);
	res.on("close", () => {
		clients = clients.filter((c) => c !== res);
	});
}

module.exports = {
	broadcastLog,
	attachLogStream,
};
