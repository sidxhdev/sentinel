export default function IntrusionAlert({ intrusion }) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        intrusion ? "border-red-500 bg-red-900/30" : "border-gray-800 bg-gray-900"
      } text-white`}
    >
      <h2 className="text-xl font-semibold text-red-400 mb-2">Intrusion Status</h2>
      <p className="text-lg">
        {intrusion ? "⚠️ Intrusion Detected!" : "✅ All Clear"}
      </p>
    </div>
  );
}
