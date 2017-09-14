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
      password: password
    };
  },
  
  deleteUser: (userID) => {
    delete userDatabase[userID];
  }
};

module.exports = userFunctions;