const bcrypt = require('bcrypt');
const BCRYPT_ROUNDS = 12;

const userDatabase = {};

const userFunctions = {

  getUser: (userID) => {
    return userDatabase[userID];
  },

  getUserByEmail: (email) => {
    for (const id in userDatabase) {
      if (userDatabase[id].email === email) {
        return userDatabase[id];
      }
    }
    return undefined;
  },

  getAllUsers: function() {
    return userDatabase;
  },
  
  saveUser: (id, email, password) => {
    userDatabase[id] = {
      id: id,
      email: email,
      hash: bcrypt.hashSync(password, BCRYPT_ROUNDS)
    };
  },
  
  deleteUser: (userID) => {
    delete userDatabase[userID];
  },

  checkPassword: (user, password) => {
    return bcrypt.compareSync(password, user.hash);
  }
};

module.exports = userFunctions;