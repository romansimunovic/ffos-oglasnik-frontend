import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";

export default function AdminPanel() {
  const [objave, setObjave] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get("/objave/admin");
      setObjave(res.data);
    };
    fetchData();
  }, []);

  const handleStatus = async (id, status) => {
    await axios.put(`/objave/${id}`, { status });
    setObjave((prev) =>
      prev.map((o) => (o._id === id ? { ...o, status } : o))
    );
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center text-[#b41f24] mb-6">
        Admin panel
      </h1>
      {objave.length === 0 ? (
        <p className="text-center text-gray-500">Nema objava.</p>
      ) : (
        objave.map((o) => (
          <div key={o._id} className="border rounded p-4 mb-4">
            <h3 className="text-lg font-semibold">{o.naslov}</h3>
            <p>{o.opis}</p>
            <div className="mt-2 flex gap-3">
              <button
                onClick={() => handleStatus(o._id, "odobreno")}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Odobri
              </button>
              <button
                onClick={() => handleStatus(o._id, "odbijeno")}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Odbij
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
