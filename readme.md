
# Voting Panel Application

## Features

✅ Allows voting for candidates  
✅ Allows submitting new candidates  
✅ Prevents multiple voting based on voter identifier  
✅ Generates bar charts of election results  
✅ Produces election reports in *.PDF and *.CSV formats  

### Roles

- **admin** – responsible for overseeing the voting process, can vote, add candidates, export results, and view statistics  
- **user** – can add candidates, view results, export data, but cannot vote  
- **voter** – can only vote (no login required)

## Technologies Used

- Node.js – runtime environment, open source, server-side JavaScript  
- npm – Node.js package manager  
- SQLite – open-source relational database management system  

## Data Model

```sql
CREATE TABLE candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    registration_time DATETIME
);

CREATE TABLE votes (
    voter_identifier TEXT PRIMARY KEY,
    candidate_id INTEGER,
    name TEXT,
    voting_time DATETIME
);

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
);
```

## Project Structure

```
voting-app
├── frontend/
│   ├── index.html
│   ├── help.html
│   ├── app.js  
│   └── style.css  
├── backend/
│   ├── server.js
│   ├── package.json
│   └── database.sqlite
```

---

## How to Run the Backend (Node.js + Express + SQLite)

1. Install [Node.js](https://nodejs.org/) if you don't have it installed.  
2. Open a terminal in the `backend/` folder:  
   ```bash
   cd backend
   ```
3. Install dependencies:  
   ```bash
   npm install
   ```
4. Start the server:  
   ```bash
   node server.js
   ```
5. The server runs at: [http://localhost:3000](http://localhost:3000)

---

### Testing Backend Endpoints (server.js runs by default on port 3000)

**Add a candidate:**  
```bash
curl -X POST http://localhost:3000/api/candidates -H "Content-Type: application/json" -d "{"name":"John Brown"}"
```

**Vote:**  
```bash
curl -X POST http://localhost:3000/vote -H "Content-Type: application/json" -d "{"voter_identifier": "12345678901", "candidate_id": 2, "name": "VOTE1"}"
```

**Add a user:**  
```bash
curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d "{"username": "admin1", "password": "admin1234", "role": "admin"}"
```

**Get election results:**  
```bash
curl http://localhost:3000/candidates
```

---

### Checking voting results using SQLite CLI

```bash
...\sqlite\sqlite3 database.sqlite
SELECT * FROM candidates;
```
