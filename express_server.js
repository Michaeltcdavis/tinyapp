const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const username = req.cookies.username;
  const templateVars = { urls: urlDatabase, username };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies.username };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  if (!urlDatabase[id]) {
    res.redirect(404, "/urls");
  }
  const longURL = urlDatabase[id];
  const templateVars = { id, longURL, username: req.cookies.username };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(302, longURL);
});

app.post("/urls", (req, res) => {
  const id = generateRandomString(6);
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect(302,`urls/${id}`); 
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username)
    .redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username')
    .redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  newURL = req.body.updatedURL;
  urlDatabase[id] = newURL;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString(lengthOfString) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomString = '';
  for (i = 0; i < lengthOfString; i++) {
    randomString += chars[Math.floor(Math.random() * 62)];
  }
  return randomString;
}
