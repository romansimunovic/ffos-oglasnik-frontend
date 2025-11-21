export default function NotFoundOrFallback() {
  return (
    <div className="text-center py-24">
      <h2 className="text-xl font-bold text-red-600">Stranica nije pronađena</h2>
      <p>Pokušajte se vratiti na <a href="/" className="underline text-blue-600">početnu</a>.</p>
    </div>
  );
}