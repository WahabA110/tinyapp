const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");

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

const urlsForUser = function (id) {
	let obj = {};
	for (let key in urlDatabase) {
		let url = urlDatabase[key]
		if (url.userID === id) {
			obj[key] = url
		}
	}
	return obj;
}

const ownerCheck = function (req, res) {
  const currentUser = req.cookies['user_id'];
  if (!currentUser) {
    res.send("Please <a href= '/login'>log in</a> or <a href= '/register'>register</a> first");
  }
  if (urlDatabase[req.params.shortURL].userID !== currentUser) {
    res.send("URL does not match your account. Head back to <a href= '/urls'>urls</a>")
  }
}

const urlDatabase = {
  "b6UTxQ": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW"
  },
  "i3BoGr": {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
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
  if (!currentUser) {
    res.send("Please <a href= '/login'>log in</a> or <a href= '/register'>register</a> first");
  } else {
    const templateVars = {
      user: users[currentUser] || null,
      urls: urlsForUser(req.cookies['user_id'])
    };
    res.render("urls_index", templateVars);
  }
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
  } else if (checkEmail(req.body.email)) {
    res.status(403).send('Email already in use');
  }
  const shortString = generateRandomString();
  users[shortString] = {
    id: shortString,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie('user_id', shortString);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const currentUser = req.cookies['user_id'];
  const templateVars = {
    user: users[currentUser] || null,
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  if (!checkEmail(req.body.email)) {
    res.status(403).send('email cannot be found');
  } else if (checkEmail(req.body.email)) {
    if (req.body.password !== users[checkEmail(req.body.email)].password) {
      res.status(403).send('password does not match');
    } else if (req.body.password === users[checkEmail(req.body.email)].password) {
      res.cookie('user_id', users[checkEmail(req.body.email)].id);
      res.redirect("/urls");
    }
  }
});

app.post("/urls", (req, res) => {
  const shortString = generateRandomString();
  urlDatabase[shortString] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id']
  };
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
  if (!currentUser) {
    res.redirect("/urls");
    return;
  }
  const templateVars = {
    user: users[currentUser] || null
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const currentUser = req.cookies['user_id'];
  ownerCheck(req, res);
  const templateVars = {
    user: users[currentUser] || null,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:shortURL", (req, res) => {
  ownerCheck(req, res);
  urlDatabase[req.params.shortURL].longURL = req.body.newURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  ownerCheck(req, res);
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
