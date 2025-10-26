import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";

export default function AdminInbox() {
  const [razgovori, setRazgovori] = useState([]);
  const [odabraniRazgovor, setOdabraniRazgovor] = useState(null);
  const [poruke, setPoruke] = useState([]);
  const [novaPoruka, setNovaPoruka] = useState("");
  const adminId = localStorage.getItem("korisnikId") || "adminId"; // privremeno

  const fetchRazgovori = async () => {
    try {
      const res = await axios.get("/inbox/svi", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRazgovori(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPoruke = async (razgovorId) => {
    const res = await axios.get(`/inbox/${razgovorId}`);
    setPoruke(res.data);
  };

  const posaljiPoruku = async () => {
    if (!novaPoruka.trim() || !odabraniRazgovor) return;
    await axios.post("/inbox/send", {
      razgovorId: odabraniRazgovor._id,
      posiljatelj: adminId,
      sadrzaj: novaPoruka,
    });
    setNovaPoruka("");
    fetchPoruke(odabraniRazgovor._id);
  };

  useEffect(() => {
    fetchRazgovori();
  }, []);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center text-[#b41f24] mb-6">
        Admin Inbox 👨‍💻
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gray-50 border rounded-lg p-4 h-[70vh] overflow-y-auto shadow-sm">
          <h2 className="text-lg font-semibold mb-3 text-[#b41f24]">Svi razgovori</h2>
          {razgovori.length === 0 ? (
            <p className="text-gray-500">Nema razgovora.</p>
          ) : (
            razgovori.map((r) => (
              <div
                key={r._id}
                onClick={() => {
                  setOdabraniRazgovor(r);
                  fetchPoruke(r._id);
                }}
                className={`p-3 rounded-md mb-2 cursor-pointer ${
                  odabraniRazgovor?._id === r._id
                    ? "bg-[#b41f24] text-white"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                <p className="font-semibold">
                  {r.korisnici.map((k) => k.ime).join(", ")}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {r.posljednjaPoruka || "Nema poruka"}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="md:col-span-2 flex flex-col bg-white border rounded-lg shadow-sm h-[70vh]">
          {odabraniRazgovor ? (
            <>
              <div className="border-b p-4 font-semibold text-[#b41f24]">
                Razgovor s{" "}
                {odabraniRazgovor.korisnici
                  .filter((k) => k.uloga !== "admin")
                  .map((k) => k.ime)
                  .join(", ")}
              </div>

              <div className="flex-1 p-4 overflow-y-auto">
                {poruke.length === 0 ? (
                  <p className="text-gray-400 text-center mt-10">
                    Nema poruka.
                  </p>
                ) : (
                  poruke.map((p) => (
                    <div
                      key={p._id}
                      className={`mb-3 flex ${
                        p.posiljatelj === adminId
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`px-4 py-2 rounded-xl max-w-[70%] ${
                          p.posiljatelj === adminId
                            ? "bg-[#b41f24] text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p className="text-sm">{p.sadrzaj}</p>
                        <span className="text-xs opacity-60 block mt-1">
                          {new Date(p.vrijeme).toLocaleTimeString("hr-HR")}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 border-t flex gap-2">
                <input
                  type="text"
                  placeholder="Upiši odgovor..."
                  value={novaPoruka}
                  onChange={(e) => setNovaPoruka(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                />
                <button
                  onClick={posaljiPoruku}
                  className="bg-[#b41f24] text-white px-4 py-2 rounded-md hover:bg-[#96181d] transition"
                >
                  Pošalji
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center flex-1 text-gray-400">
              Odaberi razgovor s lijeve strane.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
