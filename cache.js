const redis = require('redis');

const redisClient = redis.createClient('redis://ec2-54-215-226-218.us-west-1.compute.amazonaws.com');

redisClient.on('error', (err) => {
  console.error(err);
});

module.exports = redisClient;
