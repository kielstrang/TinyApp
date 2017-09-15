const config = require('../lib/config');
const random = require('../lib/random-helpers');

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
      userID: owner,
      analytics: {
        visitCount: 0,
        uniqueVisitors: new Set(),
        visitHistory: []
      }
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
  },

  logVisit: (url, session) => {
    //count visits
    url.analytics.visitCount += 1;

    //count unique visitors
    if(session.user_id) {
      url.analytics.uniqueVisitors.add(session.user_id);
    } else {
      if(!session.visitor_id) {
        session.visitor_id = random.generateString(config.VISITOR_LENGTH);
      }
      url.analytics.uniqueVisitors.add(session.visitor_id);
    }

    //record visit times
  }
};


module.exports = new URLFunctions();