export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer bg-gray-900 text-gray-300 py-6 mt-10">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">

        {/* Lijeva strana */}
        <div className="text-sm text-center md:text-left">
          © {year} Filozofski fakultet Osijek  
          <div className="text-gray-400 text-xs">
            Sva prava pridržana.
          </div>
        </div>

        {/* Sredina – useful links */}
        <div className="flex gap-4 text-sm">
          <a
            href="https://www.ffos.unios.hr"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            Web stranica
          </a>
          <a
            href="https://www.facebook.com/filozofskiosijek"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            Facebook
          </a>
          <a
            href="https://www.instagram.com/filozofski_osijek"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            Instagram
          </a>
        </div>

        {/* Desna strana – sitni showcase */}
        <div className="text-xs text-gray-400 text-center md:text-right">
          Izradili · <span className="text-gray-200 font-semibold">Lucija Sabljak, Franjo Čopčić, Roman Šimunović</span>
        </div>
      </div>
    </footer>
  );
}
