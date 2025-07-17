const fs = require("fs");
const { PROPERTIES_PATH } = require("../config/constants");

function readProperties(callback) {
	fs.readFile(PROPERTIES_PATH, "utf8", (err, data) => {
		if (err) return callback(err);
		const parsed = {};
		data.split("\n").forEach((line) => {
			if (!line.startsWith("#") && line.includes("=")) {
				const [key, ...val] = line.split("=");
				parsed[key.trim()] = val.join("=").trim();
			}
		});
		callback(null, parsed);
	});
}

function writeProperties(settings, callback) {
	const lines = Object.entries(settings).map(([k, v]) => `${k}=${v}`);
	fs.writeFile(PROPERTIES_PATH, lines.join("\n"), "utf8", callback);
}

module.exports = {
	readProperties,
	writeProperties,
};
