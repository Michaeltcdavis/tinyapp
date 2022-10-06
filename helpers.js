const lookupFromDatabase = function(key, value, database) {
  for (let item in database) {
    if (database[item][key] === value) {
      return item;
    }
  }
  return null;
};

module.exports = lookupFromDatabase;