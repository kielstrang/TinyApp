const userDatabase = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "correct-horse-battery-staple"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "plaintext-passwords-are-fun"
  }
};

const userFunctions = {

  getUser: function(userID) {
    return userDatabase[userID];
  },

  getUserByEmail: function(email) {
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
  
  saveUser: function(id, email, password) {
    userDatabase[id] = {
      id: id,
      email: email,
      password: password
    };
  },
  
  deleteUser: function(userID) {
    delete userDatabase[userID];
  }
};

module.exports = userFunctions;