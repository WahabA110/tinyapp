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



module.exports = {
  getUserByEmail,
  generateRandomString
}