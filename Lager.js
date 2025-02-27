/**
 * Lager.js - Node.js Server für die Lagersimulation
 *
 * Ablauf:
 * 1. "node Lager.js" ausführen
 * 2. Browser öffnen: http://127.0.0.1:8000/
 *
 * Enthält:
 * - Endpunkte für Registrierung, Login, Artikelverwaltung und Benutzerverwaltung.
 * - Verwendet bcrypt zum Hashen von Passwörtern.
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

// Middleware: URL-encoded und JSON-Daten parsen
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Statische Dateien bereitstellen (HTML, CSS, JS)
app.use(express.static('.'));

// GET: Liefert die HTML-Seite
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/Lager.html');
});

/* Registrierung */
app.post('/register', (req, res) => {
  const { role, vorname, gender, customGender, username, strasse, ort, email, password } = req.body;
  if (!username || !email || !password || !role) {
    return res.status(400).send('Fehlende Felder.');
  }
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.error('Fehler beim Hashing des Passworts:', err);
      return res.status(500).send('Fehler beim Passwort-Hashing.');
    }
    const sql = `
      INSERT INTO users (username, email, password, role, gender, customGender, vorname, strasse, ort)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(sql, [username, email, hash, role, gender, customGender, vorname, strasse, ort], function(err) {
      if (err) {
        console.error('Fehler beim Einfügen des Benutzers:', err.message);
        return res.status(500).send('Fehler beim Erstellen des Benutzers.');
      }
      res.send('Registrierung erfolgreich. Bitte logge dich ein.');
    });
  });
});

/* Login */
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
    bcrypt.compare(password, row.password, (err, result) => {
      if (err) {
        console.error('Fehler beim Passwortvergleich:', err);
        return res.status(500).send('Fehler beim Einloggen.');
      }
      if (result) {
        res.json({ message: 'Login erfolgreich', role: row.role });
      } else {
        res.status(400).send('Falsches Passwort.');
      }
    });
  });
});

/* GET: Artikelliste */
app.get('/articles', (req, res) => {
  const sql = 'SELECT artikelNr, bezeichnung, beschreibung, bestand, mindestbestand, id FROM artikel';
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Fehler beim Lesen der Artikel:', err.message);
      return res.status(500).send('Fehler beim Lesen der Artikel.');
    }
    res.json(rows);
  });
});

/* ARTIKELVERWALTUNG */
app.post('/article', (req, res) => {
  const { artikelNr, bezeichnung, beschreibung, bestand, mindestbestand } = req.body;
  if (!artikelNr || !bezeichnung) {
    return res.status(400).send("ArtikelNr und Bezeichnung sind erforderlich.");
  }
  const sql = `INSERT INTO artikel (artikelNr, bezeichnung, beschreibung, bestand, mindestbestand)
               VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [artikelNr, bezeichnung, beschreibung, bestand, mindestbestand], function(err) {
    if (err) {
      console.error("Fehler beim Hinzufügen des Artikels:", err.message);
      return res.status(500).send("Fehler beim Hinzufügen des Artikels.");
    }
    res.send("Artikel erfolgreich hinzugefügt.");
  });
});

app.delete('/article/:id', (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM artikel WHERE id = ?";
  db.run(sql, [id], function(err) {
    if (err) {
      console.error("Fehler beim Löschen des Artikels:", err.message);
      return res.status(500).send("Fehler beim Löschen des Artikels.");
    }
    res.send("Artikel erfolgreich gelöscht.");
  });
});

app.put('/article/:id', (req, res) => {
  const id = req.params.id;
  const { bezeichnung, beschreibung, bestand, mindestbestand } = req.body;
  const sql = "UPDATE artikel SET bezeichnung = ?, beschreibung = ?, bestand = ?, mindestbestand = ? WHERE id = ?";
  db.run(sql, [bezeichnung, beschreibung, bestand, mindestbestand, id], function(err) {
    if (err) {
      console.error("Fehler beim Aktualisieren des Artikels:", err.message);
      return res.status(500).send("Fehler beim Aktualisieren des Artikels.");
    }
    res.send("Artikel erfolgreich aktualisiert.");
  });
});

/* BENUTZER-VERWALTUNG */
app.get('/users', (req, res) => {
  const sql = 'SELECT id, username, email, role, vorname, gender, strasse, ort FROM users';
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Fehler beim Lesen der Benutzer:", err.message);
      return res.status(500).send("Fehler beim Lesen der Benutzer.");
    }
    res.json(rows);
  });
});

app.post('/user', (req, res) => {
  const { username, email, role, vorname, gender, strasse, ort, password } = req.body;
  if (!username || !email || !password || !role) {
    return res.status(400).send("Fehlende Felder (Benutzername, E-Mail, Passwort, Rolle).");
  }
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.error("Fehler beim Hashing des Passworts:", err);
      return res.status(500).send("Fehler beim Passwort-Hashing.");
    }
    const sql = `
      INSERT INTO users (username, email, password, role, vorname, gender, strasse, ort)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(sql, [username, email, hash, role, vorname, gender, strasse, ort], function(err) {
      if (err) {
        console.error("Fehler beim Anlegen des Benutzers:", err.message);
        return res.status(500).send("Fehler beim Anlegen des Benutzers.");
      }
      res.send("Benutzer erfolgreich angelegt.");
    });
  });
});

app.delete('/user/:id', (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM users WHERE id = ?";
  db.run(sql, [id], function(err) {
    if (err) {
      console.error("Fehler beim Löschen des Benutzers:", err.message);
      return res.status(500).send("Fehler beim Löschen des Benutzers.");
    }
    res.send("Benutzer erfolgreich gelöscht.");
  });
});

app.put('/user/:id', (req, res) => {
  const id = req.params.id;
  const { username, email, role, vorname, gender, strasse, ort, password } = req.body;
  if (!password) {
    const sql = `
      UPDATE users
      SET username = ?, email = ?, role = ?, vorname = ?, gender = ?, strasse = ?, ort = ?
      WHERE id = ?
    `;
    db.run(sql, [username, email, role, vorname, gender, strasse, ort, id], function(err) {
      if (err) {
        console.error("Fehler beim Aktualisieren des Benutzers (ohne Passwort):", err.message);
        return res.status(500).send("Fehler beim Aktualisieren des Benutzers (ohne Passwort).");
      }
      res.send("Benutzer erfolgreich aktualisiert (ohne Passwort-Änderung).");
    });
  } else {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        console.error("Fehler beim Hashing des Passworts:", err);
        return res.status(500).send("Fehler beim Passwort-Hashing.");
      }
      const sql = `
        UPDATE users
        SET username = ?, email = ?, role = ?, vorname = ?, gender = ?, strasse = ?, ort = ?, password = ?
        WHERE id = ?
      `;
      db.run(sql, [username, email, role, vorname, gender, strasse, ort, hash, id], function(err) {
        if (err) {
          console.error("Fehler beim Aktualisieren des Benutzers (mit Passwort):", err.message);
          return res.status(500).send("Fehler beim Aktualisieren des Benutzers (mit Passwort).");
        }
        res.send("Benutzer erfolgreich aktualisiert (inkl. Passwort).");
      });
    });
  }
});

// Server starten
app.listen(port, host, () => {
  console.log(`Server läuft auf http://${host}:${port}`);
});