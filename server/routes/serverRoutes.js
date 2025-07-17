const express = require("express");
const router = express.Router();
const controller = require("../controllers/serverController");
const { attachLogStream } = require("../services/logService");
const { attachMetricsStream } = require("../services/metricsService");

// Event Streams
router.get("/logs", attachLogStream);
router.get("/metrics", attachMetricsStream);

// APIs
router.get("/server/status", controller.getServerStatus);
router.post("/server/start", controller.startServer);
router.post("/server/stop", controller.stopServer);
router.post("/command", controller.sendCommand);
router.get("/settings", controller.getSettings);
router.post("/settings", controller.saveSettings);

module.exports = router;
