/**
 * Lager.js - Node.js Server für die Lagersimulation
 *
 * Ablauf:
 * 1. "node Lager.js" ausführen
 * 2. Browser öffnen: http://127.0.0.1:8000/
 *
 * Enthält:
 * - Server-Setup auf 127.0.0.1:8000
 * - Routen für /register, /login, /updateUser
 * - Route /articles (zum Laden von Artikeldaten)
 * - Bcrypt für Passwort-Hashing
 */

const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const app = express();
const port = 8000;
const host = '127.0.0.1';
const saltRounds = 10;

// Verbindung zur SQLite-Datenbank herstellen
const db = new sqlite3.Database('./Lager.db', (err) => {
  if (err) {
    console.error('Fehler beim Öffnen der Datenbank:', err.message);
  } else {
    console.log('Mit der SQLite-Datenbank verbunden.');
  }
});

// Middleware: Parsen von URL-encoded und JSON-Daten
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Statische Dateien bereitstellen (HTML, CSS, JS) aus dem aktuellen Ordner
app.use(express.static('.'));

// GET-Route für '/' → Liefert unsere Single-Page (Lager.html)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/Lager.html');
});

/**
 * POST /register
 * Erwartet Felder wie:
 * {
 *   "role": "Kunde",
 *   "vorname": "...",
 *   "gender": "...",
 *   "customGender": "...",
 *   "username": "...",
 *   "strasse": "...",
 *   "ort": "...",
 *   "email": "...",
 *   "password": "..."
 * }
 * Speichert Benutzer in der DB, Passwort wird gehasht.
 */
app.post('/register', (req, res) => {
  const {
    role,
    vorname,
    gender,
    customGender,
    username,
    strasse,
    ort,
    email,
    password
  } = req.body;

  // Check auf nötige Felder
  if (!username || !email || !password || !role) {
    return res.status(400).send('Fehlende Felder.');
  }

  // Passwort hashen
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.error('Fehler beim Hashing des Passworts:', err);
      return res.status(500).send('Fehler beim Passwort-Hashing.');
    }

    // Die users-Tabelle muss Spalten für vorname, strasse, ort usw. haben.
    const sql = `
      INSERT INTO users (username, email, password, role, gender, customGender, vorname, strasse, ort)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(sql, [username, email, hash, role, gender, customGender, vorname, strasse, ort], function (err) {
      if (err) {
        console.error('Fehler beim Einfügen des Benutzers:', err.message);
        return res.status(500).send('Fehler beim Erstellen des Benutzers.');
      }
      res.send('Registrierung erfolgreich. Bitte logge dich ein.');
    });
  });
});

/**
 * POST /login
 * Erwartet:
 * {
 *   "username": "...",
 *   "password": "..."
 * }
 * Vergleicht Passwort mit Hash und gibt JSON { message, role } zurück.
 */
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send('Fehlende Felder.');
  }

  const sql = 'SELECT * FROM users WHERE username = ?';
  db.get(sql, [username], (err, row) => {
    if (err) {
      console.error('Fehler beim Abfragen des Benutzers:', err.message);
      return res.status(500).send('Fehler beim Einloggen.');
    }
    if (!row) {
      return res.status(400).send('Benutzer nicht gefunden.');
    }
    // Passwortvergleich
    bcrypt.compare(password, row.password, (err, result) => {
      if (err) {
        console.error('Fehler beim Passwortvergleich:', err);
        return res.status(500).send('Fehler beim Einloggen.');
      }
      if (result) {
        // Login erfolgreich
        res.json({ message: 'Login erfolgreich', role: row.role });
      } else {
        res.status(400).send('Falsches Passwort.');
      }
    });
  });
});

/**
 * POST /updateUser
 * Beispiel: Rolle ändern oder sonstige Felder updaten
 */
app.post('/updateUser', (req, res) => {
  const { id, username, email, role } = req.body;
  if (!id || !username || !email || !role) {
    return res.status(400).send('Fehlende Felder.');
  }
  const sql = `UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?`;
  db.run(sql, [username, email, role, id], function (err) {
    if (err) {
      console.error('Fehler beim Aktualisieren des Benutzers:', err.message);
      return res.status(500).send('Fehler beim Aktualisieren.');
    }
    res.send('Benutzerdaten erfolgreich aktualisiert.');
  });
});

/**
 * GET /articles
 * Lädt Artikel aus der DB und gibt sie als JSON zurück
 */
app.get('/articles', (req, res) => {
  const sql = 'SELECT artikelNr, bezeichnung, beschreibung, bestand FROM artikel';
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Fehler beim Lesen der Artikel:', err.message);
      return res.status(500).send('Fehler beim Lesen der Artikel.');
    }
    res.json(rows);
  });
});

// Server starten
app.listen(port, host, () => {
  console.log(`Server läuft auf http://${host}:${port}`);
});
