//import express module
const express = require("express");
//instantiate express server
const app = express();
const path = require("path");
const sqlite3 = require("sqlite3").verbose();


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

const db_name = path.join(__dirname, "data", "faq.db");
const db = new sqlite3.Database(db_name, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful connection to the database 'faq.db'");
});

const sql_create = `CREATE TABLE IF NOT EXISTS Faq (
  faqId INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  reponse TEXT NOT NULL,
  domaine TEXT);`;

const sql_login_create = `CREATE TABLE IF NOT EXISTS Users (
    userId INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    nickname TEXT NOT NULL,
    password TEXT NOT NULL);`;


db.run(sql_create, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful creation of the Faq table");
});

db.run(sql_login_create, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful creation of the Users table");
});

const sql_insert = `INSERT INTO Faq (faqId, question, reponse) VALUES
  (1, 'Ou est ce que jetudie?', 'ESILV'),
  (2, 'Ou est ce que jhabite?', 'Courbevoie'),
  (3, 'Jai combien de chats?', 'zero :(');`;
  db.run(sql_insert, err => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Successful creation of 3 questions/answers");
  });

const domaines = ["etudes", "ville","animaux"];

//server started and waits for requests on port 3000
//message displayed when server is ready to receive requests
app.listen(3000, () => {
  console.log("Server started (http://localhost:3000/) !");
});

app.get("/users", (req, res) => {
  const sql = "SELECT * FROM Users"
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("users", { model: rows});
  });
});

app.get("/signup", (req, res) => {
  res.render("signup", { model: {} });
});

app.post("/signup", (req, res) => {
  const sql = "INSERT INTO Users (email, nickname, password) VALUES (?, ?, ?)";
  const faq = [req.body.email, req.body.nickname, req.password];
  db.run(sql, faq, err => {
    // if (err) ...
    res.redirect("/FAQ");
  });
});

app.get("/login", (req, res) => {
  res.render("login", { model: {} });
});

app.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Faq WHERE faqId = ?";
  db.get(sql, id, (err, row) => {
    // if (err) ...
    res.render("edit", { model: row });
  });
});

//answer get requests
app.get("/", (req, res) => {
  // res.send("Hello world...");
  res.render("index");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/data", (req, res) => {
  const test = {
    title: "Test",
    items: ["one", "two", "three"]
  };
  res.render("data", { model: test });
});

app.get("/FAQ", (req, res) => {
  const sql = "SELECT * FROM Faq ORDER BY question"
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("FAQ", { model: rows, domaines: domaines});
  });
});

app.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Faq WHERE faqId = ?";
  db.get(sql, id, (err, row) => {
    // if (err) ...
    res.render("edit", { model: row });
  });
});

app.post("/edit/:id", (req, res) => {
  const id = req.params.id;
  const faq = [req.body.question, req.body.reponse, id];
  const sql = "UPDATE Faq SET question = ?, reponse = ? WHERE (faqId = ?)";
  db.run(sql, faq, err => {
    // if (err) ...
    res.redirect("/FAQ");
  });
});

app.get("/create", (req, res) => {
  res.render("create", { model: {} });
});

app.post("/create", (req, res) => {
  const sql = "INSERT INTO Faq (question, reponse) VALUES (?, ?)";
  const faq = [req.body.question, req.body.reponse];
  db.run(sql, faq, err => {
    // if (err) ...
    res.redirect("/FAQ");
  });
});

app.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Faq WHERE faqId = ?";
  db.get(sql, id, (err, row) => {
    // if (err) ...
    res.render("delete", { model: row });
  });
});

// POST /delete/5
app.post("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM Faq WHERE faqId = ?";
  db.run(sql, id, err => {
    // if (err) ...
    res.redirect("/FAQ");
  });
});

app.get("/domaine/:id/:domaine", (req, res) => {
  const id = req.params.id;
  const domaine = req.params.domaine;
  const faq = [domaine, id];
  const sql = "UPDATE Faq SET domaine = ? WHERE (faqId = ?)";
  db.run(sql, faq,err => {
    // if (err) ...
    res.redirect("/FAQ");
  });
});

app.get("/filter/:domaine", (req, res) => {
  const domaine = req.params.domaine;
  const sql = "SELECT * FROM Faq WHERE domaine = ? ORDER BY question"
  db.all(sql, domaine, (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("FAQ", { model: rows, domaines: domaines});
  });
});
