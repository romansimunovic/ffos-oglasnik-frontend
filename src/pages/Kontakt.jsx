import React from "react";

export default function Kontakt() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-[#b41f24] mb-6 text-center">
        Kontakt
      </h1>
      <p className="text-gray-700 text-center mb-4">
        Za sve upite ili prijedloge za poboljšanja, možete nas kontaktirati putem e-mail adrese:
      </p>
      <p className="text-center text-[#b41f24] text-lg font-semibold mt-6">
  <a href="mailto:oglasnik@ffos.hr" className="hover:underline">
    oglasnik@ffos.hr
  </a>
</p>
    </div>
  );
}
