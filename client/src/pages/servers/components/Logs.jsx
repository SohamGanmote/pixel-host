import { Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// const testLogs = [
//   { timestamp: "14:23:15", level: "INFO", message: "[Server thread/INFO]: Steve joined the game" },
//   { timestamp: "14:23:32", level: "WARN", message: "[Server thread/WARN]: Can't keep up! Is the server overloaded?" },
//   { timestamp: "14:23:55", level: "ERROR", message: "[Server thread/WARN]: Server crashed!" },
//   { timestamp: "14:23:55", level: "DEBUG", message: "[Server thread/WARN]: Server debug mode!" },
// ]

const Logs = ({ serverStatus }) => {
  const logsEndRef = useRef(null);
  const [logs, setLogs] = useState([]);
  const [command, setCommand] = useState("");

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

  const handleCommand = (e) => {
    e.preventDefault();
    if (!command.trim()) return;

    fetch("/command", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command }),
    }).then(() => setCommand(""));
  };

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

  return <>
    <div className="border border-[#3a3a3a] shadow-2xl p-4 rounded">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Zap className="w-5 h-5 text-yellow-400" />
          Server Logs
        </div>
      </div>
      <div className="space-y-1 font-mono text-sm h-[400px] overflow-y-auto">
        {logs.map((log, index) => (
          <div
            key={index}
            className="flex gap-3 hover:bg-slate-700/30 px-3 rounded transition-colors"
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
          className="bg-[#2a2a2a] border border-[#3a3a3a] text-white placeholder:text-slate-400 font-mono flex-1 px-3 py-2 rounded"
        />
        <button
          type="submit"
          disabled={serverStatus === "stopped" || !command.trim()}
          className="bg-[#4e4e4e] text-[#DFDEDF] hover:bg-[#5c5c5c] px-3 py-2  rounded"
        >
          Send
        </button>
      </form>
      <p className="text-xs text-slate-500 mt-1">
        Type commands like: /say Hello, /time set day, /gamemode creative
      </p>
    </div>

  </>
}
export default Logs;