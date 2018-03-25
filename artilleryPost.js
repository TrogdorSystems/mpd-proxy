module.exports = {
  generateRandomPost,
};

// Make sure to "npm install faker" first.
const Faker = require('faker');
const momentRandom = require('moment-random');
const moment = require('moment');

const pastDate = moment(new Date()).format('YYYY-MM-DD');
const futureDate = moment(new Date()).add(7, 'days').format('YYYY-MM-DD');

const generateRandomPost = (userContext, events, done) => {
  // generate data with Faker:
  const name = `${Faker.name.firstName()} ${Faker.name.lastName()}`;
  const id = Faker.random.number({ min: 1, max: 10e6 });
  const date = momentRandom(futureDate, pastDate).format('YYYY-MM-DD');
  const party = Faker.random.number({ min: 1, max: 8 });
  const time = Faker.random.number({ min: 17, max: 21 });
  // add variables to virtual user's context:
  userContext.vars.name = name;
  userContext.vars.id = id;
  userContext.vars.date = date;
  userContext.vars.party = party;
  userContext.vars.time = time;
  return done();
}
