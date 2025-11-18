export async function translateText(text, to) {
  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, to }),
  });
  const data = await res.json();
  return data.translated || text;
}
