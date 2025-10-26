import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="text-center py-20 px-4">
      <h1 className="text-3xl font-bold text-[#b41f24] mb-4">
        Studenti, dobrodošli na FFOS Oglasnik! 👋
      </h1>
      <p className="text-gray-700 mb-6">
        Ovdje ćete imati priliku pregledati najnovije vijesti, obavijesti i projekte Filozofskog fakulteta u Osijeku.
      </p>
<Link
  to="/objave"
  className="bg-[#b41f24] text-white px-5 py-2 rounded-md text-sm font-semibold shadow-md hover:bg-[#96181d] transition-all duration-200"
>
  Pogledaj objave
</Link>


    </div>
  );
}
