//--------- EMAIL LOOKUP------------------//
const urlsForUser = function(userID, database) {
  let listURL = {};
  for (let key in database) {
    if (database[key].userID === userID) {
      listURL[key] = database[key];
    }
  }
  return listURL;
};

const searchEmail = function (email, users) {
  for (let key in users) {
    if (users[key]["email"] === email) {
      return key;
    }
  }
  return false;
};


module.exports = {searchEmail, urlsForUser};