const checkEmail = function(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
  return null;
}

module.exports = {
  checkEmail
}