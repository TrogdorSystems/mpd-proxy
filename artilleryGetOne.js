const momentRandom = require('moment-random');
const moment = require('moment');

const pastDate = moment(new Date()).format('YYYY-MM-DD');
const futureDate = moment(new Date()).add(7, 'days').format('YYYY-MM-DD');

const generateRandomGetData = (userContext, events, done) => {
  const id = Math.floor(Math.random() * (1e7 - 1) -1);
  const date = momentRandom(futureDate, pastDate).format('YYYY-MM-DD');

  // add variables to virtual user's context:
  userContext.vars.id = id;
  userContext.vars.date = date;

  return done();
}

module.exports = {
  generateRandomGetData,
};
