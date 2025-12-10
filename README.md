````md
# 🎓 FFOS Oglasnik – Frontend

Frontend dio web aplikacije **FFOS Oglasnik**, izrađen u Reactu (Vite) s TailwindCSS-om.  
Projekt je razvijen u sklopu kolegija **Projektni rad**, 2. godina diplomskog studija Informacijskih tehnologija na Filozofskom fakultetu u Osijeku.

---

## 👨‍🏫 Mentor

**izv. prof. dr. sc. Tomislav Jakopec**  
Odsjek za informacijske znanosti  
Filozofski fakultet Osijek

---

## 👥 Autori

- **Lucija Sabljak**
- **Franjo Čopčić**
- **Roman Šimunović**

---

## 📝 Opis projekta

FFOS Oglasnik je aplikacija namijenjena studentima i nastavnicima Filozofskog fakulteta u Osijeku za pregled i objavu obavijesti, događaja, natječaja i aktivnosti vezanih uz pojedine odsjeke fakulteta.

Frontend je izgrađen kao moderna SPA aplikacija u Reactu, a komunicira s backend API-jem razvijenim u Node.js/Express okruženju.

---

## 🚀 Tehnologije

- React (Vite)
- TailwindCSS
- Axios
- React Router
- JWT autentikacija
- Vercel (deploy)

---

# 📦 Instalacija i pokretanje

## 1️⃣ Kloniranje repozitorija

```bash
git clone <URL_TVOG_FRONTEND_REPOZITORIJA>
cd ffos-oglasnik-frontend
````

## 2️⃣ Instalacija ovisnosti

```bash
npm install
```

---

# ⚙️ Postavljanje environment varijabli

U root direktoriju kreiraj datoteku **.env**:

```env
VITE_API_URL=http://localhost:5000/api
```

Za produkciju (Vercel):

```env
VITE_API_URL=https://tvoj-backend-render.url/api
```

---

# ▶️ Pokretanje aplikacije

## Dev način (lokalno)

```bash
npm run dev
```

Aplikacija će biti dostupna na:

👉 [http://localhost:5173](http://localhost:5173)

---

# 🔑 Testni admin korisnik

Za lokalni rad možeš koristiti admin račun:

```
Email: admin@ffos.hr
Lozinka: 55tDUUjy12
```


# 🌐 Deployment (Vercel)

1. Poveži GitHub repo s Vercelom
2. Dodaj environment varijablu:

```
VITE_API_URL=https://tvoj-backend-render.url/api
```

3. Deploy će se automatski izvršiti

---

# ❗ Troubleshooting

### 1. "Failed to fetch"

Provjeriti:

* backend radi
* ispravan `VITE_API_URL`
* CORS dopušta localhost:5173

### 2. Port je zauzet

Promijeni port:

**vite.config.js**

```js
server: { port: 5173 }
```

### 3. Ne učitava CSS

Pokreni:

```bash
npm install
```

---

# 📜 Licenca

Projekt izrađen u edukacijske svrhe na Filozofskom fakultetu u Osijeku, studij Informacijskih tehnologija.

```

