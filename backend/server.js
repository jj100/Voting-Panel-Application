// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const PDFDocument = require('pdfkit');
const path = require('path');
const app = express();
const port = 3000;
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

const db = new sqlite3.Database('./database.sqlite');

// Tworzenie tabel i defaultowych użytkowników

db.serialize(() => {
 db.run(`CREATE TABLE IF NOT EXISTS candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    registration_time DATETIME
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS votes (
    voter_identifier TEXT PRIMARY KEY,
    candidate_id INTEGER,
    name TEXT,
    voting_time DATETIME
  )`);	
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
  )`);

  const insertUserIfNotExists = (username, password, role) => {
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
      if (err) {
        console.error(`Błąd sprawdzania użytkownika ${username}:`, err.message);
        return;
      }

      if (row) {
        console.log(`Użytkownik ${username} już istnieje.`);
      } else {
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
            console.error('Błąd haszowania hasła:', err);
            return;
          }

          db.run(
            `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
            [username, hashedPassword, role],
            function (err) {
              if (err) {
                console.error(`Błąd dodawania użytkownika ${username}:`, err.message);
              } else {
                console.log(`Użytkownik ${username} został dodany.`);
              }
            }
          );
        });
      }
    });
  };

  // Dodanie dwóch użytkowników (tylko jeśli ich jeszcze nie ma)
  insertUserIfNotExists('user', 'user123', 'user');
  insertUserIfNotExists('admin', 'admin123', 'admin');
});

// Logowanie
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(400).json({ error: 'Zły login lub hasło dla '+username });
    let role =row.role;
    bcrypt.compare(password, row.password, (err, result) => {
      if (result) {
         res.json({ success: true, "role":role });
      } else {
        res.status(400).json({ error: 'Niepoprawne para login hasło ' +username+'  '+password});
      }
    });
  });
});

// Pobierz kandydatów + głosy
app.get('/candidates', (req, res) => {
  db.all(
    `SELECT c.id, c.name, COUNT(v.voter_identifier) AS votes
     FROM candidates c
     LEFT JOIN votes v ON c.id = v.candidate_id
     GROUP BY c.id ORDER BY votes DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Dodaj kandydata
app.post('/api/candidates', (req, res) => {
  const name = req.body.name;
  const t = new Date().toISOString().replace('T', ' ').substring(0, 19);
  db.run(`INSERT INTO candidates (name, registration_time) VALUES (?,?)`, [name, t], function(err) {
    if (err) res.status(400).json({ error: 'Kandydat już istnieje' });
    else res.json({ id: this.lastID, name });
  });
});

// Głosuj
app.post('/vote', (req, res) => {
  const { voter_identifier, candidate_id, name } = req.body;
  if (!voter_identifier || !candidate_id || !name)
    return res.status(400).json({ error: 'Brakuje danych' });
  db.get('SELECT * FROM votes WHERE voter_identifier = ?', [voter_identifier], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) return res.status(400).json({ error: 'Ten IDENTYFIKATOR już głosował.' });
    const t = new Date().toISOString().replace('T', ' ').substring(0, 19);
    db.run(`INSERT INTO votes (voter_identifier, candidate_id, name, voting_time)
      VALUES (?,?,?,?)`, [voter_identifier, candidate_id, name, t], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
});

// Eksport CSV
app.get('/export/csv', (req, res) => {
  db.all(
    `SELECT c.name, COUNT(v.voter_identifier) AS votes
     FROM candidates c LEFT JOIN votes v ON c.id = v.candidate_id
     GROUP BY c.id ORDER BY votes DESC`, [], (err, rows) => {
    if (err) return res.status(500).send('CSV error');
    let csv = 'Kandydat;Głosy\n';
    rows.forEach(r => csv += `${r.name};${r.votes}\n`);
    res.header('Content-Type', 'text/csv');
    res.attachment('wyniki.csv');
    res.send(csv);
  });
});

// Eksport PDF
app.get('/export/pdf', (req, res) => {
  db.all(
    `SELECT c.name, COUNT(v.voter_identifier) AS votes
     FROM candidates c LEFT JOIN votes v ON c.id = v.candidate_id
     GROUP BY c.id ORDER BY votes DESC`, [], (err, rows) => {
    if (err) return res.status(500).send('PDF error');
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=wyniki.pdf');
    doc.pipe(res);
    doc.fontSize(18).text('Wyniki głosowania', { align: 'center' }).moveDown();
    rows.forEach(r => doc.fontSize(14).text(`${r.name}: ${r.votes} głosów`));
    doc.end();
  });
});

app.listen(port, () => console.log(`Backend: http://localhost:${port}`));
