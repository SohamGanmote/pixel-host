import { Server } from "lucide-react";

const ServerHeader = ({ serverStatus }) => {
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

  return <>
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
  </>
}
export default ServerHeader;