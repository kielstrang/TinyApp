const config = require('../lib/config');
const random = require('../lib/random-helpers');
const userdb = require('../lib/user-database');

const Analytics = function () {};
Analytics.prototype = {
  logVisit: (url, session) => {
    //count visits
    url.analytics.visitCount += 1;

    let personID = '';
    //count unique visitors
    if(session.user_id) {
      url.analytics.uniqueVisitors.add(session.user_id);
      personID = session.user_id;
    } else {
      if(!session.visitor_id) {
        session.visitor_id = random.generateString(config.VISITOR_LENGTH);
      }
      url.analytics.uniqueVisitors.add(session.visitor_id);
      personID = session.visitor_id;
    }

    //record visit history
    const time = new Date();
    url.analytics.visitHistory.push({personID, time});
  },

  getVisitCount: (url) => {
    return url.analytics.visitCount;
  },
  
  getVisitorCount: (url) => {
    return url.analytics.uniqueVisitors.size;
  },

  getVisitHistory: (url) => {
    let history = [];
    console.log(url.analytics.visitHistory);
    for(const visitRecord of url.analytics.visitHistory) {
      console.log(visitRecord);
      history.push({ visitor: visitRecord.personID, time: visitRecord.time});
    }
    console.log(history);
    return history;
  },

  getAnalytics: (url) => {
    return {
      visits: Analytics.prototype.getVisitCount(url),
      visitors: Analytics.prototype.getVisitorCount(url),
      history: Analytics.prototype.getVisitHistory(url)
    };
  }
};

module.exports = new Analytics();