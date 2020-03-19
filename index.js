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
  reponse TEXT NOT NULL);`;

db.run(sql_create, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful creation of the Faq table");
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

//server started and waits for requests on port 3000
//message displayed when server is ready to receive requests
app.listen(3000, () => {
  console.log("Server started (http://localhost:3000/) !");
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
    res.render("FAQ", { model: rows });
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
