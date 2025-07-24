import { useEffect, useState } from "react";
import ServerHeader from "./components/ServerHeader";
import Metrics from "./components/Metrics";
import Logs from "./components/Logs";
import Controls from "./components/Controls";

const Servers = () => {
  const [serverStatus, setServerStatus] = useState("stopped");

  useEffect(() => {
    fetch("/server/status")
      .then((res) => res.json())
      .then((data) => setServerStatus(data.running ? "running" : "stopped"));
  }, []);

  return <>
    <div className="space-y-6 p-6">
      <ServerHeader serverStatus={serverStatus} />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Metrics />
          <Logs serverStatus={serverStatus} />
        </div>
        <Controls serverStatus={serverStatus} setServerStatus={setServerStatus} />
      </div>
    </div>
  </>
}
export default Servers;