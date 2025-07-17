// Frontend: MinecraftServerUI.jsx
import { useState, useEffect, useRef } from "react";
import {
	Server,
	Play,
	StopCircle,
	RefreshCcw,
	Settings,
	SquareChevronRight,
	Trash2,
	MemoryStick,
	Cpu,
	Clock,
} from "lucide-react";
import Swal from 'sweetalert2';

export default function MinecraftServerUI() {
	const logsEndRef = useRef(null);
	const [logs, setLogs] = useState([]);
	const [serverStatus, setServerStatus] = useState("stopped"); //running,  stopped,starting
	const [serverName, setServerName] = useState("SurvivalCraft Server");
	const [maxPlayers, setMaxPlayers] = useState(20);
	const [onlineMode, setOnlineMode] = useState(true);
	const [command, setCommand] = useState("");
	const [metrics, setMetrics] = useState({
		memory: { percent: 0 },
		cpu: { percent: 0 },
		uptime: { hours: 0, minutes: 0 }
	});

	useEffect(() => {
		fetch("/server/status")
			.then((res) => res.json())
			.then((data) => setServerStatus(data.running ? "running" : "stopped"));
	}, []);

	useEffect(() => {
		const eventSource = new EventSource("/logs");
		eventSource.onmessage = (event) => {
			const raw = event.data;
			const timestamp = new Date().toLocaleTimeString();
			let level = "INFO";

			if (raw.includes("[MC-ERR]")) level = "ERROR";
			else if (raw.includes("[CMD-ERR]")) level = "ERROR";
			else if (raw.includes("WARN")) level = "WARN";
			else if (raw.includes("DEBUG")) level = "DEBUG";

			setLogs((prev) => {
				const updated = [
					...prev.slice(-199),
					{ timestamp, level, message: raw },
				];
				setTimeout(() => {
					logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
				}, 0);
				return updated;
			});
		};
		return () => eventSource.close();
	}, []);

	useEffect(() => {
		fetch("/settings")
			.then((res) => res.json())
			.then((data) => {
				if (data["motd"]) setServerName(data["motd"]);
				if (data["max-players"]) setMaxPlayers(Number(data["max-players"]));
				if (data["online-mode"]) setOnlineMode(data["online-mode"] === "true");
			});
	}, []);

	useEffect(() => {
		const source = new EventSource("/metrics");

		source.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				setMetrics((prev) => ({ ...prev, ...data }));
			} catch (err) {
				console.error("Failed to parse metrics:", err);
			}
		};

		return () => source.close();
	}, []);

	const getLogColor = (level) => {
		switch (level) {
			case "ERROR":
				return "text-red-400";
			case "WARN":
				return "text-yellow-400";
			case "INFO":
				return "text-green-400";
			case "DEBUG":
				return "text-blue-400";
			default:
				return "text-gray-400";
		}
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "running":
				return "bg-green-500";
			case "starting":
				return "bg-yellow-500";
			case "stopped":
				return "bg-red-500";
			default:
				return "bg-gray-500";
		}
	};

	const handleStart = () => {
		fetch("/server/start", { method: "POST" })
			.then((res) => res.json())
			.then(() => setServerStatus("running"));
	};

	const handleStop = () => {
		fetch("/server/stop", { method: "POST" })
			.then((res) => res.json())
			.then(() => setServerStatus("stopped"));
	};

	const handleRestart = () => {
		Swal.fire({
			title: 'Restart Server?',
			text: 'The server will restart in 5 seconds if you continue.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes, restart it!',
			cancelButtonText: 'Cancel',
			background: '#1f2937', // Dark background
			color: '#f9fafb',       // Light text
			confirmButtonColor: '#4f46e5',
			cancelButtonColor: '#d33',
		}).then((result) => {
			if (result.isConfirmed) {
				let countdown = 5;
				const countdownInterval = setInterval(() => {
					Swal.update({
						title: 'Restarting...',
						html: `Server will restart in <b>${countdown}</b> second${countdown !== 1 ? 's' : ''}...`,
						background: '#1f2937',
						color: '#f9fafb',
						showConfirmButton: false,
					});
					countdown--;

					if (countdown < 0) {
						clearInterval(countdownInterval);
						Swal.close();
						handleStop();
						setTimeout(() => handleStart(), 100); // Small delay between stop and start
					}
				}, 1000);

				Swal.fire({
					title: 'Restarting...',
					html: `Server will restart in <b>5</b> seconds...`,
					timer: 5000,
					didOpen: () => {
						Swal.showLoading();
					},
					background: '#1f2937',
					color: '#f9fafb',
					showConfirmButton: false,
				});
			}
		});
	};

	const handleCommand = (e) => {
		e.preventDefault();
		if (!command.trim()) return;

		fetch("/command", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ command }),
		}).then(() => setCommand(""));
	};

	const handleSaveSettings = () => {
		const payload = {
			motd: serverName,
			"max-players": maxPlayers.toString(),
			"online-mode": onlineMode.toString(),
		};

		fetch("/settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});
	};

	const handleDeleteWorld = async () => {
		Swal.fire({
			title: 'Are you sure?',
			text: 'Do you really want to delete the current Minecraft world? This is an irreversible process!',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#4f46e5', // Indigo (or choose any)
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, delete it!',
			cancelButtonText: 'Cancel',
			background: '#1f2937', // Dark gray (Tailwind slate-800)
			color: '#f9fafb',       // Light text (Tailwind gray-100)
		}).then((result) => {
			if (result.isConfirmed) {
				fetch("/command", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						command: "rm -rf /home/fezzy/shared-drive/minecraft/minecraft/world",
						type: "shell",
					}),
				}).then(() => {
					Swal.fire('Deleted!', 'Your Minecraft world has been permanently deleted.', 'success');
				});
			} else {
				console.log('Cancelled');
			}
		});
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
			<div className="max-w-6xl mx-auto space-y-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="p-3 bg-green-500/20 rounded-lg">
							<Server className="w-8 h-8 text-green-400" />
						</div>
						<div>
							<h1 className="text-3xl font-bold">Minecraft Server</h1>
							<p className="text-slate-400">Server Management Console</p>
						</div>
					</div>
					<div
						className={`flex items-center rounded-full font-bold px-4 py-1 ${getStatusColor(
							serverStatus
						)}`}
					>
						<div className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse" />
						{serverStatus.toUpperCase()}
					</div>
				</div>

				{/* Stats Grid */} 


				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					{/* Logs */}
					<div className="lg:col-span-3 bg-slate-800/50">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
							<div className="bg-slate-800/50 border border-slate-700 rounded">
								<div className="p-6">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-slate-400 text-sm">Memory Usage</p>
											<p className="text-2xl font-bold text-white">{metrics.memory.percent ?? "--"}%</p>
										</div>
										<MemoryStick className="w-8 h-8 text-blue-400" />
									</div>
								</div>
							</div>

							<div className="bg-slate-800/50 border border-slate-700 rounded">
								<div className="p-6">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-slate-400 text-sm">CPU Usage</p>
											<p className="text-2xl font-bold text-white">{metrics.cpu.percent ?? "--"}%</p>
										</div>
										<Cpu className="w-8 h-8 text-purple-400" />
									</div>
								</div>
							</div>

							<div className="bg-slate-800/50 border border-slate-700 rounded">
								<div className="p-6">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-slate-400 text-sm">Uptime</p>
											<p className="text-2xl font-bold text-white">{metrics.uptime.hours}h {metrics.uptime.minutes}m</p>
										</div>
										<Clock className="w-8 h-8 text-orange-400" />
									</div>
								</div>
							</div>
						</div>
						<div className="border border-slate-700 shadow-2xl p-4 rounded">
							<div className="flex justify-between items-center mb-4">
								<div className="flex items-center gap-2 text-lg font-medium">
									<SquareChevronRight className="w-5 h-5 text-yellow-400" />
									Server Logs
								</div>
							</div>
							<div className="space-y-1 font-mono text-sm h-[400px] overflow-y-auto">
								{logs.map((log, index) => (
									<div
										key={index}
										className="flex gap-3 py-1 hover:bg-slate-700/30 px-3 rounded transition-colors"
									>
										<span className="text-slate-500 shrink-0 font-medium">
											[{log.timestamp}]
										</span>
										<span
											className={`shrink-0 font-bold ${getLogColor(
												log.level
											)} min-w-[50px]`}
										>
											{log.level}
										</span>
										<span className="text-slate-300 leading-relaxed">
											{log.message}
										</span>
									</div>
								))}
								<div ref={logsEndRef} />
							</div>
							<form
								onSubmit={handleCommand}
								className="flex gap-2 border-t border-slate-700 pt-4 mt-4"
							>
								<input
									value={command}
									onChange={(e) => setCommand(e.target.value)}
									placeholder="Enter server command..."
									disabled={serverStatus === "stopped"}
									className="bg-slate-900 border border-slate-600 text-white placeholder:text-slate-400 font-mono flex-1 px-3 py-2 rounded"
								/>
								<button
									type="submit"
									disabled={serverStatus === "stopped" || !command.trim()}
									className="bg-blue-600 hover:bg-blue-700 px-3 py-2 text-white rounded"
								>
									Send
								</button>
							</form>
							<p className="text-xs text-slate-500 mt-1">
								Type commands like: /say Hello, /time set day, /gamemode creative
							</p>
						</div>
					</div>

					{/* Controls */}
					<div className="space-y-6">
						<div className="bg-slate-800/50 border border-slate-700 shadow-2xl p-4 rounded">
							<h2 className="text-white text-lg font-medium mb-3 flex items-center gap-2">
								Server Controls
							</h2>
							{serverStatus === "stopped" ?
								<button
									className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded"
									disabled={serverStatus !== "stopped"}
									onClick={handleStart}
								>
									<Play className="w-4 h-4 mr-2" />
									Start Server
								</button>
								:
								<button
									className="w-full mt-2 bg-red-600/20 border border-red-600 text-red-400 hover:bg-red-600 hover:text-white font-semibold py-3 rounded"
									disabled={serverStatus === "stopped"}
									onClick={handleStop}
								>
									<StopCircle className="w-4 h-4 mr-2" />
									Stop Server
								</button>}
							<button
								className="w-full mt-2 bg-slate-700 border border-slate-600 text-white hover:bg-slate-600 font-semibold py-3 rounded"
								disabled={serverStatus === "stopped"}
								onClick={handleRestart}
							>
								<RefreshCcw className="w-4 h-4 mr-2" />
								Restart Server
							</button>
						</div>
						<div className="bg-slate-800/50 border border-slate-700 shadow-2xl p-4 rounded">
							<h2 className="text-white text-lg mb-3 font-medium flex items-center gap-2">
								<Settings className="w-5 h-5 text-blue-400" />
								Server Settings
							</h2>
							<div className="space-y-4">
								<div>
									<label
										htmlFor="server-name"
										className="text-white block mb-1"
									>
										Server Name
									</label>
									<input
										id="server-name"
										value={serverName}
										onChange={(e) => setServerName(e.target.value)}
										disabled={serverStatus === "running"}
										className="bg-slate-900 border border-slate-600 text-white w-full px-3 py-2 rounded"
									/>
								</div>
								<div>
									<label
										htmlFor="max-players"
										className="text-white block mb-1"
									>
										Max Players
									</label>
									<input
										id="max-players"
										type="number"
										min="1"
										max="100"
										value={maxPlayers}
										onChange={(e) =>
											setMaxPlayers(Number.parseInt(e.target.value) || 20)
										}
										disabled={serverStatus === "running"}
										className="bg-slate-900 border border-slate-600 text-white w-full px-3 py-2 rounded"
									/>
								</div>
								<div className="flex items-center justify-between">
									<label htmlFor="online-mode" className="text-white mr-4">
										Cracked Server
									</label>
									<div className="relative">
										<input
											type="checkbox"
											id="online-mode"
											checked={!onlineMode} // invert here
											onChange={(e) => setOnlineMode(!e.target.checked)} // invert here
											disabled={serverStatus === "running"}
											className="sr-only"
										/>
										<div
											onClick={() => {
												if (serverStatus !== "running")
													setOnlineMode(onlineMode);
											}}
											className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${!onlineMode ? "bg-green-500" : "bg-gray-500"
												} ${serverStatus === "running"
													? "opacity-50 cursor-not-allowed"
													: "cursor-pointer"
												}`}
										>
											<div
												className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${!onlineMode ? "translate-x-6" : "translate-x-0"
													}`}
											/>
										</div>
									</div>
								</div>
								<button
									onClick={handleDeleteWorld}
									disabled={serverStatus === "running"}
									className="w-full mt-2 bg-red-700 hover:bg-red-800 py-2 rounded flex items-center justify-center gap-2"
								>
									<Trash2 className="w-4 h-4" /> Delete World
								</button>
								<button
									className="w-full bg-slate-700 border border-slate-600 text-white hover:bg-slate-600 py-2 rounded"
									disabled={serverStatus === "running"}
									onClick={handleSaveSettings}
								>
									Save Settings
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
