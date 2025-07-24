import { Clock, Cpu, MemoryStick } from "lucide-react";
import Card from "../../../components/ui/Card";
import { useEffect, useState } from "react";

const Metrics = () => {
  const [metrics, setMetrics] = useState({
    memory: { percent: 0 },
    cpu: { percent: 0 },
    uptime: { hours: 0, minutes: 0 }
  });

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

  return <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <Card title="Memory Usage" value={`${metrics.memory.percent}%`} icon={MemoryStick} color="text-blue-400" />
      <Card title="CPU Usage" value={`${metrics.cpu.percent}%`} icon={Cpu} color="text-purple-400" />
      <Card title="Uptime" value={`${metrics.uptime.hours}h ${metrics.uptime.minutes}m`} icon={Clock} color="text-orange-400" />
    </div>
  </>
}
export default Metrics;