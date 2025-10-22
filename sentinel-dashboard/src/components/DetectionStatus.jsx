export default function DetectionStatus({ status, time }) {
  const isIntruder = status === "intruder";

  return (
    <div className="flex flex-col items-center mb-4">
      <h2
        className={`text-3xl font-bold mb-2 ${
          isIntruder ? "text-red-500" : "text-green-400"
        }`}
      >
        {isIntruder ? "🚨 Intruder Detected!" : "✅ System Idle"}
      </h2>
      <p className="text-gray-400">
        Last Update: {time ? new Date(time).toLocaleString() : "No recent activity"}
      </p>
    </div>
  );
}
