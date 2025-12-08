export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full py-4 mt-14 bg-gray-50 border-t border-gray-200">
      <div className="max-w-lg mx-auto text-center">
        <p className="text-sm text-gray-700">
          © {year} Filozofski fakultet Osijek
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Izradio Roman · Oglasnik FFOS
        </p>
      </div>
    </footer>
  );
}
