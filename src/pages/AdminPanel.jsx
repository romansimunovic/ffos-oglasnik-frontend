import { useEffect, useState } from "react";
import api from "../api/axiosInstance";

function AdminPanel() {
  const [objave, setObjave] = useState([]);
  const [msg, setMsg] = useState("");

  // dohvati sve objave pri učitavanju
  useEffect(() => {
    const fetchObjave = async () => {
      try {
        const { data } = await api.get("/objave/admin");
        setObjave(data);
      } catch (err) {
        console.error("Greška pri dohvaćanju objava:", err);
        setMsg("Greška pri dohvaćanju objava.");
      }
    };
    fetchObjave();
  }, []);

  const handleStatusChange = async (id, noviStatus) => {
    try {
      await api.put(`/objave/${id}/status`, { status: noviStatus });
      setObjave((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status: noviStatus } : o))
      );
    } catch (err) {
      console.error("Greška pri promjeni statusa:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/objave/${id}`);
      setObjave((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      console.error("Greška pri brisanju objave:", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#b41f24] mb-4">Admin panel</h1>
      {msg && <p className="text-red-600">{msg}</p>}
      {objave.length === 0 ? (
        <p>Nema dostupnih objava.</p>
      ) : (
        objave.map((o) => (
          <div
            key={o._id}
            className="border p-4 mb-3 rounded shadow-sm bg-white"
          >
            <h2 className="font-bold">{o.naslov}</h2>
            <p className="text-sm text-gray-600">{o.sadrzaj}</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => handleStatusChange(o._id, "odobreno")}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Odobri
              </button>
              <button
                onClick={() => handleStatusChange(o._id, "odbijeno")}
                className="bg-yellow-600 text-white px-3 py-1 rounded"
              >
                Odbij
              </button>
              <button
                onClick={() => handleDelete(o._id)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Obriši
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default AdminPanel;
