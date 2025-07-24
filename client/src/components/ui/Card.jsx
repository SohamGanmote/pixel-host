const Card = ({ title, value, icon: Icon, color }) => {
  return (
    <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-md">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </div>
    </div>
  );
};

export default Card;
