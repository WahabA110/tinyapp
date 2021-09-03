const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.set('view engine', 'ejs');

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

function checkEmail(email) {
  for (let user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  return null;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const currentUser = req.cookies['user_id'];
  const templateVars = {
    user: users[currentUser] || null,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const currentUser = req.cookies['user_id'];
  const templateVars = {
    user: users[currentUser] || null,
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send('Bad Request');
  } if (!checkEmail(req.body.email)) {
    const shortString = generateRandomString();
    users[shortString] = {
      id: shortString,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('user_id', shortString);
    res.redirect("/urls");
  }
  res.status(403).send('Email already in use');
});

app.get("/login", (req, res) => {
  const currentUser = req.cookies['user_id'];
  const templateVars = {
    user: users[currentUser] || null,
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const shortString = generateRandomString();
  urlDatabase[shortString] = req.body.longURL;
  res.redirect(`/urls/${shortString}`);
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  const currentUser = req.cookies['user_id'];
  const templateVars = {
    user: users[currentUser] || null
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const currentUser = req.cookies['user_id'];
  const templateVars = {
    user: users[currentUser] || null,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.newURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
