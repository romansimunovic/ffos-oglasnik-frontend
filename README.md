# FFOS Oglasnik – Frontend

Frontend aplikacija za **FFOS Oglasnik**, razvijena u sklopu diplomskog studija Informacijskih tehnologija  
na Filozofskom fakultetu u Osijeku.  
**Mentor: izv. prof. dr. sc. Tomislav Jakopec**

---

## 🚀 Preduvjeti

Prije pokretanja potrebno je instalirati:

- **Node.js ≥ 18**
- **Git**
- **Visual Studio Code**

Provjera verzija:

```bash
node -v
npm -v
📥 Instalacija i pokretanje
1️⃣ Kloniranje repozitorija
bash
Copy code
git clone <URL-TVOG-FRONTEND-REPOZITORIJA>
cd frontend
2️⃣ Instalacija ovisnosti
bash
Copy code
npm install
3️⃣ Kreiraj .env datoteku
U frontend root folderu napravi:

bash
Copy code
VITE_API_URL=http://localhost:5000/api
Za produkciju (Vercel):

ini
Copy code
VITE_API_URL=https://tvoj-backend-render-url/api
4️⃣ Pokretanje frontend aplikacije
bash
Copy code
npm run dev
Vite dev server će raditi na:

👉 http://localhost:5173

🔧 Proxy (vite.config.js)
Već konfigurirano:

js
Copy code
server: {
  proxy: {
    "/api": {
      target: "http://localhost:5000",
      changeOrigin: true,
      secure: false,
    },
  },
},
🔐 Testni admin
makefile
Copy code
Email: admin@ffos.hr
Lozinka: 55tDUUjy12
❗ Troubleshooting
❌ Frontend se ne spaja na backend
Backend mora raditi na http://localhost:5000

Provjeri .env varijable

Provjeri browser CORS greške

❌ “Failed to load resource /api”
Mogući uzrok → backend nije pokrenut.

🌐 Deployment (Vercel)
Deployaj GitHub repo na Vercel

Dodaj environment varijablu:

ini
Copy code
VITE_API_URL=https://backend-on-render/api
Redeploy

Sve radi automatski.
