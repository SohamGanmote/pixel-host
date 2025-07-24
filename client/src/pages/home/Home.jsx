import { HardDrive, Pickaxe, Play, Server, Users } from "lucide-react"
import { useNavigate } from "react-router";
import Card from "../../components/ui/Card";

const Home = () => {
  const redirect = useNavigate();
  return <div className="space-y-6 p-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-green-500/20 rounded-lg">
          <Pickaxe className="w-8 h-8 text-green-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold ">Pixel Host</h1>
          <p className="text-slate-400">Manage all your Minecraft worlds</p>
        </div>
      </div>
      <button className="bg-white hover:bg-gray-100 text-gray-800 py-2 px-4 rounded text-sm font-semibold">
        Create New World
      </button>
    </div>

    {/* Stats Overview */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card title="Total Worlds" value="1" icon={Server} color="text-blue-400" />
      <Card title="Running Servers" value="1" icon={Play} color="text-green-400" />
      <Card title="Total Players" value="4" icon={Users} color="text-purple-400" />
      <Card title="Total Storage" value="9.1 GB" icon={HardDrive} color="text-orange-400" />
    </div>

    {/* Worlds Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-md p-4">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className=" text-lg">Daddy Harbhor SMP</div>
          <div className="flex items-center rounded-full font-bold px-3 py-1 text-xs bg-green-600 ">
            <div className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse" />
            ONLINE
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Players</p>
              <p className=" font-semibold text-sm">3/10</p>
            </div>
            <div>
              <p className="text-slate-400">Version</p>
              <p className=" font-semibold text-sm">1.20.1</p>
            </div>
            <div>
              <p className="text-slate-400">Size</p>
              <p className=" font-semibold text-sm">2.3 GB</p>
            </div>
            <div>
              <p className="text-slate-400">Last Played</p>
              <p className=" font-semibold text-sm">2025-07-18</p>
            </div>
          </div>

          <button className="w-full bg-[#4e4e4e] text-[#DFDEDF] py-2 px-4 border border-gray-700 rounded text-sm hover:bg-[#5c5c5c]"
            onClick={() => {
              redirect("/server/daddyharbhorsmp")
            }}>
            Manage
          </button>
        </div>
      </div>
    </div>
  </div>
}

export default Home;