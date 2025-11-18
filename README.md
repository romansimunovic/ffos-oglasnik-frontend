# FFOS Oglasnik – Frontend

Frontend aplikacija za **FFOS Oglasnik**, razvijena u sklopu diplomskog studija Informacijskih tehnologija na Filozofskom fakultetu u Osijeku.  
**Mentor:** izv. prof. dr. sc. Tomislav Jakopec

---

## Preduvjeti

Prije pokretanja frontend-a, provjerite imate li instalirano:

- Node.js ≥ 18  
- Visual Studio Code  
- Git  

Provjera verzije:

```bash
node -v
npm -v
````

---

## Instalacija i pokretanje

### 1. Kloniranje repozitorija

```bash
git clone https://github.com/romansimunovic/ffos-oglasnik-frontend.git
cd ffos-oglasnik-frontend
```

Otvorite folder u Visual Studio Codeu.

---

### 2. Instalacija ovisnosti

```bash
npm install
```

---

### 3. Konfiguracija `.env` datoteke

Provjerite da u root folderu postoji `.env` s:

```
VITE_API_URL=http://localhost:5000
```

> **Napomena:** Ova URL adresa treba odgovarati portu na kojem radi backend.

---

### 4. Pokretanje frontend aplikacije

```bash
npm run dev
```

Frontend će biti dostupan na: [http://localhost:5176](http://localhost:5176)

---

## Testiranje login funkcionalnosti

* URL: [http://localhost:5176/login](http://localhost:5176/login)
* Testni korisnički podaci:

  | Email                                 | Lozinka  |
  | ------------------------------------- | -------- |
  | [admin@ffos.hr](mailto:admin@ffos.hr) | admin123 |

---

## Troubleshooting

* **Frontend ne može dohvatiti API**: Provjerite `VITE_API_URL` i da backend radi.
* **Port već zauzet**: Promijenite port u `vite.config.js` ili zatvorite aplikaciju koja koristi isti port.
* **Node modules error**: Pokrenite `npm install` prije `npm run dev`.

---
