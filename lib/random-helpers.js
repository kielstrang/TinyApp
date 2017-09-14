const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const randomHelpers = {
  generateString: (strLength) => {
    let str = '';
    for (var i = 0; i < strLength; i++) {
      str += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return str;
  }

};

module.exports = randomHelpers;