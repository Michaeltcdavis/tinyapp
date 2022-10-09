const lookupFromDatabase = function(key, value, database) {
  for (let item in database) {
    if (database[item][key] === value) {
      return item;
    }
  }
  return null;
};

const generateRandomString = function (lengthOfString) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomString = '';
  for (let i = 0; i < lengthOfString; i++) {
    randomString += chars[Math.floor(Math.random() * 62)];
  }
  return randomString;
};

const filterDatabase = function (key, value, database) {
  const filtered = {};
  let count = 0;
  for (let item in database) {
    if (database[item][key] === value) {
      filtered[item] = database[item];
      count++;
    }
  }
  if (count > 0) {
    return filtered;
  }
  return null;
};

const formatDate = function (date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
};

module.exports = {
  lookupFromDatabase,
  generateRandomString,
  filterDatabase,
  formatDate
};