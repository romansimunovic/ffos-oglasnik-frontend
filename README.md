````md
# 🎓 FFOS Oglasnik – Frontend

Frontend dio web aplikacije **FFOS Oglasnik**, izrađen u Reactu (Vite) s TailwindCSS-om.  
Projekt je razvijen u sklopu kolegija **Projektni rad**, 2. godina diplomskog studija Informacijskih tehnologija na Filozofskom fakultetu u Osijeku.

---

## 👨‍🏫 Mentor

**izv. prof. dr. sc. Tomislav Jakopec**  
Odsjek za informacijske znanosti, Filozofski fakultet Osijek

---

## 👥 Autori

- Lucija Sabljak  
- Franjo Čopčić  
- Roman Šimunović  

---

## 📝 Opis projekta

FFOS Oglasnik je aplikacija namijenjena studentima i nastavnicima Filozofskog fakulteta u Osijeku za pregled i objavu obavijesti, događaja, natječaja i aktivnosti vezanih uz pojedine odsjeke fakulteta.  

Frontend je SPA aplikacija izrađena u Reactu koja komunicira s backend API-jem razvijenim u Node.js/Express okruženju.

---

## 🚀 Tehnologije

- React (Vite)  
- TailwindCSS  
- Axios  
- React Router  
- JWT autentikacija  
- Vercel (deploy)

---

## 📦 Instalacija i pokretanje

### 1️⃣ Kloniranje repozitorija

```bash
git clone <URL_TVOG_FRONTEND_REPOZITORIJA>
cd ffos-oglasnik-frontend
````

### 2️⃣ Instalacija ovisnosti

```bash
npm install
```

### 3️⃣ Postavljanje environment varijabli

U root direktoriju kreiraj datoteku **.env**:

```env
VITE_API_URL=http://localhost:5000/api
```

Za produkciju (Vercel):

```env
VITE_API_URL=https://tvoj-backend-render.url/api
```

---

### 4️⃣ Pokretanje aplikacije

```bash
npm run dev
```

Frontend će biti dostupan na:
👉 [http://localhost:5173](http://localhost:5173)

---

## 🔑 Testni admin korisnik

Za lokalni rad:

```
Email: admin@ffos.hr
Lozinka: 55tDUUjy12
```

---

## 🌐 Deployment (Vercel)

1. Poveži GitHub repozitorij s Vercelom
2. Dodaj environment varijablu `VITE_API_URL=https://tvoj-backend-render.url/api`
3. Deploy će se automatski izvršiti

---

## ❗ Troubleshooting

* **"Failed to fetch"**
  Provjeriti: backend radi, ispravan `VITE_API_URL`, CORS dopušta localhost:5173

* **Port je zauzet**
  Promijeni port u `vite.config.js`:

  ```js
  server: { port: 5173 }
  ```

* **CSS se ne učitava**
  Pokreni:

  ```bash
  npm install
  ```

---

## 📁 Struktura projekta

```
src/
│── components/
│── pages/
│── context/
│── hooks/
│── services/
│── utils/
│── App.jsx
│── main.jsx
```

---

## 📜 Licenca

Projekt izrađen u edukacijske svrhe na Filozofskom fakultetu u Osijeku, studij Informacijskih tehnologija.
