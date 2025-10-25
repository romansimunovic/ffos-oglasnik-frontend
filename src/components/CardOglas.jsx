export default function CardOglas({ naslov, opis, kategorija }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
      <h3 className="text-lg font-semibold text-[#b41f24]">{naslov}</h3>
      <p className="text-gray-700 mt-2">{opis}</p>
      <span className="text-xs bg-[#b41f24] text-white px-2 py-1 rounded mt-3 inline-block">
        {kategorija}
      </span>
    </div>
  );
}
