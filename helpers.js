const getUserByEmail = function(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
  return null;
}

const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6);
};

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

const ownerCheck = function(req, res) {
  const currentUser = req.session.user_id;
  if (!currentUser) {
    res.send("Please <a href= '/login'>log in</a> or <a href= '/register'>register</a> first");
  }
  if (urlDatabase[req.params.shortURL].userID !== currentUser) {
    res.send("URL does not match your account. Head back to <a href= '/urls'>urls</a>");
  }
};

module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
  ownerCheck
}