# Network Automation Manager — Upute za pokretanje

## 1. Instalacija ovisnosti

```bash
pip install -r requirements.txt
```

## 2. Inicijalizacija baze podataka

**Pokreni jednom prije prvog pokretanja:**

```bash
python init_db.py
```

Ovo kreira tablice `users`, `devices`, `config_templates`, `audit_logs`
u SQLite bazi (`instance/lokalna_test_baza.db`).

> ⚠️ Ako dobiješ grešku `no such table: users`, znači da `init_db.py` nije pokrenut.

## 3. (Opcionalno) Punjenje baze test podacima

```bash
python seed.py
```

> ⚠️ Ovo **briše sve** postojeće podatke i puni mock podacima!

## 4. Pokretanje aplikacije

```bash
python run.py
```

Aplikacija je dostupna na: **http://localhost:5001**

## 5. Registracija prvog korisnika

1. Idi na `http://localhost:5001/auth/register`
2. Upisi email i lozinku — prvi korisnik automatski dobiva ulogu **admin**

## 6. GNS3 Deploy

- GNS3 Server mora biti pokrenut na `localhost:3080`
- U navigaciji klikni **GNS3 Deploy**
- Routeri se dohvaćaju automatski iz aktivnog projekta

## Redoslijed pri resetiranju

```bash
python seed.py   # briše i puni bazu testnim podacima
python run.py    # pokreni aplikaciju
```
