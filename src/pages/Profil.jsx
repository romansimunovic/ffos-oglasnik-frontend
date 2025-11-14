export default function Profil() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) return <p className="text-center my-6 text-red-600">Niste prijavljeni.</p>;

  return (
    <div className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-8 mt-10">
      <h2 className="text-2xl font-bold text-[#b41f24] mb-6">Moj Profil</h2>
      <p className="mb-2"><span className="font-bold">Ime: </span>{user.ime}</p>
      <p className="mb-2"><span className="font-bold">Email: </span>{user.email}</p>
      <p className="mb-2"><span className="font-bold">Uloga: </span>{user.uloga}</p>
    </div>
  );
}
