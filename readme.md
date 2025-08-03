# 🗳️ Voting Panel Application

This is a simple open-source voting application that allows users to vote for candidates, register new ones, and generate voting reports in CSV and PDF format.

---

## ✅ Features

- Vote for candidates  
- Add new candidates  
- Prevent multiple votes using unique voter identifiers  
- Generate bar charts showing election results  
- Export results to `.PDF` and `.CSV` reports  
- **Role-based access control:**
  - `admin` – full access for managing candidates, supervising the voting process, generating statistics and exporting reports  
  - `user` – limited access for registering candidates and viewing/exporting results, but **without voting rights**

## ⚙️ Technologies Used

- **Node.js** – JavaScript runtime for server-side application  
- **NPM** – Package manager for Node.js  
- **SQLite** – Lightweight open-source relational database  

---

## 🗄️ Database Model

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
