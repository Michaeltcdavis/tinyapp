const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  aJ48lW: {
    id: "userA",
    email: "a@example.com",
    password: "passwordA",
  },
  user2RandomID: {
    id: "userB",
    email: "b@example.com",
    password: "passwordB",
  },
};

const generateRandomString = function (lengthOfString) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomString = '';
  for (i = 0; i < lengthOfString; i++) {
    randomString += chars[Math.floor(Math.random() * 62)];
  }
  return randomString;
};

const lookupFromDatabase = function (key, value, database) {
  for (let item in database) {
    if (database[item][key] === value) {
      return item;
    }
  }
  return null;
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userID = req.cookies.userID;
  const templateVars = { urls: urlDatabase, user: users[userID] };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies.userID;
  if (!userID) {
    res.redirect("/login");
    return;
  }
  const templateVars = { user: users[userID] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userID = req.cookies.userID;
  if (!urlDatabase[id]) {
    const message = 'No URL was found to be referenced by that short URL.';
    const templateVars = { message, urls: urlDatabase, user: users[userID] };
    res.status(404).render("error", templateVars)
    return;
  }
  if (!userID) {
    res.redirect("/login");
    return;
  }
  const longURL = urlDatabase[id];
  const templateVars = { id, longURL, user: users[userID] };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const userID = req.cookies.userID;
  if (userID) {
    res.redirect("/urls");
  }
  const templateVars = { urls: urlDatabase, user: users[userID] };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const userID = req.cookies.userID;
  if (userID) {
    res.redirect("/urls");
  }
  const templateVars = { urls: urlDatabase, user: users[userID] };
  res.render("login", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const userID = req.cookies.userID;
  if (!urlDatabase[id]) {
    const message = 'No URL was found to be referenced by that short URL.';
    const templateVars = { message, urls: urlDatabase, user: users[userID] };
    res.render("error", templateVars)
  }
  const longURL = urlDatabase[id];
  res.redirect(longURL);

});

app.post("/urls", (req, res) => {
  const userID = req.cookies.userID;
  if (!userID) {
    const message = 'You must login to shorten URLs.';
    const templateVars = { message, urls: urlDatabase, user: users[userID] };
    res.status(404).render("error", templateVars)
    return;
  }
  const id = generateRandomString(6);
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect(302, `urls/${id}`);
});

app.post("/logout", (req, res) => {
  const userID = req.cookies.userID;
  if (!userID) {
    const message = 'You must login to logout.';
    const templateVars = { message, urls: urlDatabase, user: users[userID] };
    res.status(403).render("error", templateVars);
    return;
  }
  res.clearCookie('userID')
    .redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const userID = req.cookies.userID;
  if (!userID) {
    const message = 'You must login to delete short URLs.';
    const templateVars = { message, urls: urlDatabase, user: users[userID] };
    res.status(403).render("error", templateVars);
    return;
  }
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const userID = req.cookies.userID;
  if (!userID) {
    const message = 'You must login to modify URLs.';
    const templateVars = { message, urls: urlDatabase, user: users[userID] };
    res.status(403).render("error", templateVars);
    return;
  }
  const id = req.params.id;
  newURL = req.body.updatedURL;
  urlDatabase[id] = newURL;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    const userID = req.cookies.userID;
    const message = 'You must include email and password.';
    const templateVars = { message, urls: urlDatabase, user: users[userID] };
    res.status(400).render("error", templateVars);
    return;
  }
  if (lookupFromDatabase('email', email, users)) {
    const userID = req.cookies.userID;
    const message = 'An account using this email already exists.';
    const templateVars = { message, urls: urlDatabase, user: users[userID] };
    res.status(400).render("error", templateVars);
    return;
  }
  userID = generateRandomString(6)
  users[userID] = { username, email, password };
  res.cookie('userID', userID)
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    const userID = req.cookies.userID;
    const message = 'You must include email and password.';
    const templateVars = { message, urls: urlDatabase, user: users[userID] };
    res.status(400).render("error", templateVars);
    return;
  }
  const userID = lookupFromDatabase('email', email, users);
  if (!lookupFromDatabase('email', email, users) || users[userID].password !== password) {
    const userID = req.cookies.userID;
    const message = 'This email and password combination is not recognized.';
    const templateVars = { message, urls: urlDatabase, user: users[userID] };
    res.status(404).render("error", templateVars);
    return;
  }
  res.cookie('userID', userID)
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

