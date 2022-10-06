const express = require("express");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
    dateCreated: '2019-04-05',
    timesVisited: 4,
    uniqueVisits: ['ip1',' ip2', 'ip3']
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
    dateCreated: '2020-03-12',
    timesVisited: 4,
    uniqueVisits: ['ip1']
  }, 
  i3Bo5r: {
    longURL: "https://www.test.ca",
    userID: "user2RandomID",
    dateCreated: '1970-01-01',
    timesVisited: 4,
    uniqueVisits: ['ip1', 'ip2']
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
  user3RandomID: {
    id: "userC",
    email: "c@example.com",
    password: "passwordC",
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

const filterDatabase = function (key, value, database) {
  const filtered = {};
  let count = 0;
  for (let item in database) {
    if (database[item][key] === value) {
      filtered[item] = database[item];
      count++;
    }
  }
  if (count > 0) {
    return filtered;
  }
  return null;
};

const formatDate = function (date) {
  year = date.getFullYear();
  month = String(date.getMonth() + 1).padStart(2, '0');
  day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
};

app.get("/", (req, res) => {
  const userID = req.cookies.userID;
  if (!userID) {
    res.redirect("/login");
    return;
  }
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const userID = req.cookies.userID;
  let urls = filterDatabase('userID', userID, urlDatabase);
  let message = '';
  if (!urls) {
    message = 'You have no short URLs yet!'
  }
  if (!userID) {
    urls = null;
    message = 'Login to see your short URLs!'
  }
  const templateVars = { urls, user: users[userID], message };
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
    const message = 'you need to be logged in to access this page.';
    const templateVars = { message, urls: urlDatabase, user: users[userID] };
    res.status(403).render("error", templateVars)
    return;
  }
  if (userID !== urlDatabase[id].userID) {
    const message = 'Users can only modify their own URLs.';
    const templateVars = { message, urls: urlDatabase, user: users[userID] };
    res.status(403).render("error", templateVars)
    return;
  }
  const url = urlDatabase[id];
  const templateVars = { id, url, user: users[userID] };
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
  urlDatabase[id].timesVisited++;
  const ip = req.ip;
  if (!urlDatabase[id].uniqueVisits.includes(ip)) {
    urlDatabase[id].uniqueVisits.push(ip);
  }
  const longURL = urlDatabase[id].longURL;
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
  const longURL = req.body.longURL;
  if (!req.body.longURL.startsWith("http://") && !req.body.longURL.startsWith("https://")) {
    const message = 'URLs must start with "http://" or "https://".';
    const templateVars = { message, urls: urlDatabase, user: users[userID] };
    res.status(403).render("error", templateVars)
    return;
  }
  const id = generateRandomString(6);
  const date = formatDate(new Date());
  urlDatabase[id] = {};
  urlDatabase[id].longURL = longURL;
  urlDatabase[id].userID = userID;
  urlDatabase[id].dateCreated = date;
  urlDatabase[id].timesVisited= 0;
  urlDatabase[id].uniqueVisits = [];
  res.redirect(`urls/${id}`);
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
  const id = req.params.id;
  if (!userID) {
    const message = 'You must login to delete short URLs.';
    const templateVars = { message, urls: urlDatabase, user: users[userID] };
    res.status(403).render("error", templateVars);
    return;
  }
  if (userID !== urlDatabase[id].userID) {
    const message = 'Users can only delete their own URLs.';
    const templateVars = { message, urls: urlDatabase, user: users[userID] };
    res.status(403).render("error", templateVars);
    return;
  }
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const userID = req.cookies.userID;
  const id = req.params.id;
  if (!userID) {
    const message = 'You must login to modify URLs.';
    const templateVars = { message, urls: urlDatabase, user: users[userID] };
    res.status(403).render("error", templateVars);
    return;
  }
  if (userID !== urlDatabase[id].userID) {
    const message = 'Users can only modify their own short URLs.';
    const templateVars = { message, urls: urlDatabase, user: users[userID] };
    res.status(403).render("error", templateVars);
    return;
  }
  newURL = req.body.updatedURL;
  console.log(urlDatabase[id].longURL);
  urlDatabase[id].longURL = newURL;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
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
  console.log(users[userID]);
  res.cookie('userID', userID);
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
  console.log(bcrypt.compareSync(password, users[userID].password))
  console.log(password);
  console.log(users[userID].password);
  if (!lookupFromDatabase('email', email, users) || (bcrypt.compareSync(password, users[userID].password) === false)) {
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

