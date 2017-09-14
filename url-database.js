const urlDatabase =  {
  "b2xVn2": {
    short: "b2xVn2",
    long: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    short: "9sm5xK",
    long: "http://www.google.com",
    userID: "userRandomID2"
  }
};

const urlFunctions = {

  getURL: function(shortURL) {
    return urlDatabase[shortURL];
  },

  getAllURLs: function() {
    return urlDatabase;
  },
  
  saveURL: function(shortURL, longURL, owner) {
    urlDatabase[shortURL] = {
      short: shortURL,
      long: longURL,
      userID: owner
    };
  },
  
  deleteURL: function(shortURL) {
    delete urlDatabase[shortURL];
  },
  
  userOwnsURL: function(user, urlID) {
    if (!(user && (urlID in urlDatabase))) return false;

    const url = urlDatabase[urlID];
    return url && url.userID === user.id;
  },
  
  getUserURLs: function(user) {
    const urls = {};
    for (shortURL in urlDatabase) {
      if (this.userOwnsURL(user, shortURL)) {
        urls[shortURL] = urlDatabase[shortURL];
      }
    }
    return urls;
  }
};


module.exports = urlFunctions;