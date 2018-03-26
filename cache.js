const redis = require('redis');

const redisClient = redis.createClient({
  port: process.env.REDIS_Port || 6379,
});

redisClient.on('error', (err) => {
  console.error(err);
});

module.exports = redisClient;