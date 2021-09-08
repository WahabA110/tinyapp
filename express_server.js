const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const { getUserByEmail, generateRandomString } = require('./helpers');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.set('view engine', 'ejs');

app.use(cookieSession({
  name: 'session',
  keys: ['longKey']
}));

// function checks if the url belongs to the current client's account
const ownerCheck = function(req, res) {
  const currentUser = req.session.user_id;
  if (!currentUser) {
    res.send("Please <a href= '/login'>log in</a> or <a href= '/register'>register</a> first");
    return;
  }
  if (urlDatabase[req.params.shortURL].userID !== currentUser) {
    res.send("URL does not match your account. Head back to <a href= '/urls'>urls</a>");
    return;
  }
};

// returns all the urls that belong to the user passed through the argument
const urlsForUser = function(id) {
  let obj = {};
  for (let key in urlDatabase) {
    let url = urlDatabase[key];
    if (url.userID === id) {
      obj[key] = url;
    }
  }
  return obj;
};

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
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const currentUser = req.session.user_id;
  if (!currentUser) {
    // if the client isn't logged in we request that they do
    res.send("Please <a href= '/login'>log in</a> or <a href= '/register'>register</a> first");
    return;
  } else {
    const templateVars = {
      user: users[currentUser] || null,
      urls: urlsForUser(req.session.user_id)
    };
    // if the client is logged in we return their urls
    res.render("urls_index", templateVars);
  }
});

app.get("/register", (req, res) => {
  const currentUser = req.session.user_id;
  const templateVars = {
    user: users[currentUser] || null,
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    // shows error message if they provided an empty password or email while registering
    res.status(400).send('Email and/or password is empty. Please retry again.');
    return;
  } else if (getUserByEmail(req.body.email, users)) {
    // checks if the provided email already has an account
    res.status(403).send('Email already in use');
    return;
  } else {
    // if both options above don't occur we create an account with the client's provided info
    const shortString = generateRandomString();
    users[shortString] = {
      id: shortString,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = shortString;
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  const currentUser = req.session.user_id;
  const templateVars = {
    user: users[currentUser] || null,
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  let currentClient = getUserByEmail(req.body.email, users);
  if (currentClient) {
    // if the clients email provided is within our system we continue
    if (bcrypt.compareSync(req.body.password, users[currentClient].password)) {
      // if the hashed password the client provided matches the hashed password within
      // our system we can log the client in and set the cookie
      req.session.user_id = users[currentClient].id;
      res.redirect("/urls");
      return;
    }
    res.status(403).send('password does not match');
    return;
  }
  res.status(403).send('email cannot be found');
});

app.post("/urls", (req, res) => {
  const shortString = generateRandomString();
  urlDatabase[shortString] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shortString}`);
});

app.post("/logout", (req, res) => {
  // removes the cookie session and logs the client out
  req.session = null;
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  const currentUser = req.session.user_id;
  if (!currentUser) {
    // if the client isn't logged in we redirect them to the login page to do so
    res.redirect("/login");
    return;
  }
  const templateVars = {
    user: users[currentUser] || null
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const currentUser = req.session.user_id;
  // function checks if the clients account is the owner of the short/long url
  ownerCheck(req, res);
  // if they are the owner it will provide them with the shortURL page
  const templateVars = {
    user: users[currentUser] || null,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // u/:shortURL will redirect them to the specific webpage we've shortened
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:shortURL", (req, res) => {
  ownerCheck(req, res);
  // updates the previous URL we've shortened to a new URL we want to shorten 
  // with the same shortURL string
  urlDatabase[req.params.shortURL].longURL = req.body.newURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  ownerCheck(req, res);
  // deletes the URL we no longer wish to have from our database
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
