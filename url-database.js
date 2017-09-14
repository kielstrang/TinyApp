const urlDatabase =  {};

const URLFunctions = function () {};
URLFunctions.prototype = {

  getURL: (shortURL) => {
    return urlDatabase[shortURL];
  },

  getAllURLs: function() {
    return urlDatabase;
  },
  
  saveURL: (shortURL, longURL, owner) => {
    urlDatabase[shortURL] = {
      short: shortURL,
      long: longURL,
      userID: owner
    };
  },
  
  deleteURL: (shortURL) => {
    delete urlDatabase[shortURL];
  },
  
  userOwnsURL: (user, urlID) => {
    if(!(user && (urlID in urlDatabase))) return false;

    const url = urlDatabase[urlID];
    return url && url.userID === user.id;
  },
  
  getUserURLs: (user) => {
    const urls = {};
    for(shortURL in urlDatabase) {
      if(URLFunctions.prototype.userOwnsURL(user, shortURL)) {
        urls[shortURL] = urlDatabase[shortURL];
      }
    }
    return urls;
  }
};


module.exports = new URLFunctions();