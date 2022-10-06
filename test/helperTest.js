const { assert } = require('chai');

const lookupFromDatabase = require('../helpers');

const testUsers = {
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

describe('lookUpFromDatabase', function () {
  it('should return a user with valid email', function () {
    const user = lookupFromDatabase('email', "user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.strictEqual(user, expectedUserID);
  });

  it('should return undefined', function () {
    const user = lookupFromDatabase('email', "notExisting@example.com", testUsers)
    const expectedUserID = null;
    assert.strictEqual(user, expectedUserID);
  });


});