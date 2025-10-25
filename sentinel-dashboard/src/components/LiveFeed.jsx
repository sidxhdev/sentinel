export default function LiveFeed({ esp32Url }) {
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-2 flex justify-center items-center">
      <img
        src={`${esp32Url}/stream`}
        alt="Live Feed"
        className="rounded-lg w-full h-[400px] object-cover"
        onError={(e) => (e.target.src = "")}
      />
    </div>
  );
}
