export default function FaceStats({ faceCount, people }) {
  // Get unique people (in case same person detected multiple times)
  const uniquePeople = [...new Set(people)];
  const knownPeople = uniquePeople.filter(name => name !== "Unknown");
  const unknownCount = people.filter(name => name === "Unknown").length;

  return (
    <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-lg">
      <h2 className="text-2xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
        <span>👤</span> Face Stats
      </h2>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Total Faces:</span>
          <span className="text-2xl font-bold text-white">{faceCount}</span>
        </div>
        
        {knownPeople.length > 0 && (
          <div className="border-t border-gray-800 pt-3">
            <p className="text-sm text-gray-500 mb-2">Recognized:</p>
            <ul className="space-y-1">
              {knownPeople.map((name, i) => (
                <li key={i} className="flex items-center gap-2 text-green-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  {name}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {unknownCount > 0 && (
          <div className="border-t border-gray-800 pt-3">
            <p className="flex items-center gap-2 text-red-400">
              <span className="w-2 h-2 bg-red-400 rounded-full"></span>
              {unknownCount} Unknown {unknownCount === 1 ? "Face" : "Faces"}
            </p>
          </div>
        )}
        
        {faceCount === 0 && (
          <p className="text-gray-500 text-center py-4">No faces detected</p>
        )}
      </div>
    </div>
  );
}