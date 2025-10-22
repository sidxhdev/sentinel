export default function CameraFeed({ streamUrl }) {
  if (!streamUrl)
    return <p className="text-gray-500 italic text-center mt-4">No live stream available</p>;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-blue-400 mb-2">📷 Live Camera Feed</h3>
      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-700">
        <iframe
          src={streamUrl}
          title="ESP32-CAM Stream"
          className="absolute top-0 left-0 w-full h-full"
          allow="autoplay"
        ></iframe>
      </div>
    </div>
  );
}
