export default function IntrusionAlert({ intrusion }) {
  return (
    <div 
      className={`p-6 rounded-2xl border transition-all duration-300 ${
        intrusion 
          ? "border-red-500 bg-red-900/30 shadow-lg shadow-red-500/50 animate-pulse" 
          : "border-gray-800 bg-gray-900"
      }`}
    >
      <h2 className="text-2xl font-semibold text-blue-400 mb-3 flex items-center gap-2">
        <span>🛡️</span> Security Status
      </h2>
      
      <div className="flex items-center gap-3">
        {intrusion ? (
          <>
            <div className="w-4 h-4 bg-red-500 rounded-full animate-ping absolute"></div>
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <div>
              <p className="text-red-400 font-bold text-lg">⚠️ INTRUSION DETECTED!</p>
              <p className="text-red-300 text-sm">Unknown person identified</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-green-400 font-semibold text-lg">✅ Area Secure</p>
              <p className="text-gray-400 text-sm">All clear</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}