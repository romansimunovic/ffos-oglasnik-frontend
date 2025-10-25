export default function Footer() {
  return (
    <footer className="bg-[#2b2b2b] text-white py-6 mt-12">
      <div className="max-w-7xl mx-auto text-center text-sm">
        © {new Date().getFullYear()} Filozofski fakultet Osijek – Sva prava pridržana.
      </div>
    </footer>
  );
}
