



//----------------------------------------------- EMAIL LOOKUP---------------------------------------------------//
const searchEmail = function(email, users) {
  for (let key in users) {
    if (users[key]["email"] === email) {
      return key;
    }
  }
  return false;
};


module.exports = { searchEmail };