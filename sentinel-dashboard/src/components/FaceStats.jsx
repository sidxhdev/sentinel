export default function FaceStats({ faceCount, people }) {
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 text-white">
      <h2 className="text-xl font-semibold text-blue-400 mb-2">Face Count</h2>
      <p className="text-2xl mb-4">{faceCount}</p>
      <h3 className="text-lg font-medium mb-2">Recognized People</h3>
      <ul className="text-gray-300 space-y-1">
        {people.length > 0 ? (
          people.map((name, i) => <li key={i}>👤 {name}</li>)
        ) : (
          <li>No one detected</li>
        )}
      </ul>
    </div>
  );
}
