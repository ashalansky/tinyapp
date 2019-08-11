const { assert } = require('chai');

const { searchEmail } = require('../helpers.js');

const testUsers = {
  "aJ48lw": {
    userID: "aJ48lw", 
    email: "user@example.com", 
    password: "purple"
  },
  "user2RandomID": {
    userID: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('searchEmail', function() {
  it('should return a user with valid email', function() {
    const user = searchEmail("user@example.com", testUsers)
    const expectedOutput = "aJ48lw";
    assert.equal(user, expectedOutput);
    // Write your assert statement here
  });
  it('return false if user is not found', function() {
    const user = searchEmail("user2019@example.com", testUsers)
    const expectedOutput = false;
    assert.equal(user, expectedOutput);
  });
});