const express = require("express");
const cors = require("cors");
const path = require("path");
const { broadcastMetrics } = require("./services/metricsService");
const { PORT } = require("./config/constants");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", require("./routes/serverRoutes"));

// Broadcast system metrics every 3 seconds
setInterval(broadcastMetrics, 3000);

app.listen(PORT, "0.0.0.0", () => {
	console.log(`✅ Minecraft Control Server running on http://0.0.0.0:${PORT}`);
});
