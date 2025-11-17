import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { ODSJECI } from "../constants/odsjeci";

export default function ObjavaDetalj() {
  const { id } = useParams();
  const [objava, setObjava] = useState(null);

  useEffect(() => {
    api.get(`/objave/${id}`)
      .then(res => setObjava(res.data))
      .catch(() => setObjava(null));
  }, [id]);

  if (!objava) return <p className="text-center mt-10">Objava nije pronađena.</p>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 mt-10 rounded shadow">
      <h1 className="text-2xl font-bold text-[#b41f24] mb-6">{objava.naslov}</h1>
      <p className="mb-4 text-gray-700">{objava.sadrzaj}</p>
      <div className="text-sm text-gray-500">
        <p>Tip: {objava.tip}</p>
        <p>Odsjek: {ODSJECI.find(x => x.id === (objava.odsjek?._id || objava.odsjek))?.naziv || '-'}</p>
        <p>Autor: {objava.autor || "Nepoznato"}</p>
        <p>{objava.datum ? new Date(objava.datum).toLocaleDateString("hr-HR") : ""}</p>
      </div>
    </div>
  );
}
