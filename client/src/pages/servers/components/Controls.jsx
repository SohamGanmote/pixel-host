import { Play, RefreshCcw, StopCircle } from "lucide-react";

const Controls = ({ serverStatus, setServerStatus }) => {

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

  return <>
    <div className="space-y-6">
      <div className="bg-[#2a2a2a] border border-[#3a3a3a] shadow-2xl p-4 rounded">
        <h2 className="text-white text-lg font-medium mb-3 flex items-center gap-2">
          Server Controls
        </h2>
        {serverStatus === "stopped" ?
          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium text-sm py-2 rounded flex items-center justify-center"
            disabled={serverStatus !== "stopped"}
            onClick={handleStart}
          >
            <Play className="w-4 h-4 mr-2" />
            Start Server
          </button>
          :
          <button
            className="w-full mt-2 bg-red-600/20 border border-red-600 text-red-400 hover:bg-red-600 hover:text-white font-medium text-sm py-2 rounded flex items-center justify-center"
            disabled={serverStatus === "stopped"}
            onClick={handleStop}
          >
            <StopCircle className="w-4 h-4 mr-2" />
            Stop Server
          </button>}
        <button
          className="w-full mt-2 bg-slate-700 border border-slate-600 text-white hover:bg-slate-600 font-medium text-sm py-2 rounded flex items-center justify-center"
          disabled={serverStatus === "stopped"}
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Restart Server
        </button>
      </div>
    </div>
  </>
}

export default Controls;