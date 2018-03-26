require('newrelic');
const fs = require('fs');
const Html = require('./dist/html.js')
const http = require('http');
const request = require('request');
const { renderToString } = require('react-dom/server');
const { createElement } = require('react');
const Reservation = require('./bundles/productionBundle-server').default;
const redisClient = require('./cache')
const moment = require('moment');

const port = 8000;
const hostname = '127.0.0.1';

const statistics = {
  cacheHit: 0,
  cacheMiss: 0,
  total: 0,
};

const server = http.createServer((req, res) => {
  let rendercomponent = (component, id) => {
    let componentString = createElement(component, `{ id: ${id} }`, null);
    return renderToString(componentString);
  };
  const { method, url } = req;
  if (method === 'GET') {
    const urlSplit = url.split('/').slice(1);
    [id, date] = [urlSplit[1], urlSplit[3]];
    if (url === '/') {
      let randomId = Math.floor(Math.random() * (10e6 - 1) - 1);
      res.end(Html(rendercomponent(Reservation, randomId), 'silverspoon', randomId));
    } else if (url === `/restaurants/${id}/reservations/${date}`) {
      const redisKey = `${id}${date}`;
      statistics.total += 1;
      redisClient.GET(redisKey, (err, response) => {
        if (response !== null) {
          statistics.cacheHit += 1;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(response);
        } else {
          statistics.cacheMiss += 1;
          request(`http://localhost:8081${url}`, (err, result) => {
            redisClient.SETEX(redisKey, 20, result.body);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(result.body);
          });
        }
      });
    } else if (url.indexOf('Bundle') > -1) {
      redisClient.get(url.toString(), (err, response) => {
        if (err) throw new Error(err);
        if (response !== null) {
          res.end(response);
        } else {
          let bundle = '';
          let readable = fs.createReadStream(`./bundles${url}`)
              .on('data', chunk => {
                bundle += chunk;
              }).on('end', () => {
                res.end(bundle);
                redisClient.SET(url.toString(), bundle);
              })     
          .on('error', err => {
            let readableBundle = request(`http://localhost:8081${url}`).pipe(fs.createWriteStream(`./bundles${url}`))
              .on('finish', () => {
                fs.readFile(`./bundles${url}`, 'utf-8', (err, fsRes) => {
                  if (err) throw new Error(err);
                  res.end(fsRes)
                  redisClient.SET(url.toString(), fsRes);
                });             
              });
          });         
        };
      });
    } else if (url === '/favicon.ico') {
      res.writeHead(200, { 'Content-Type': 'image/apng' });
      fs.readFile('./dist/favicon.ico', (err, result) => (
        err ? console.error(err) : res.end(result)
      ));
    };
  } else if (method === 'POST' && url === '/reservations') {
    let body = '';
    req.on('error', err => console.log(err))
    req.on('data', chunk => {
      body += chunk;
    }).on('end', () => {
      request({
        url: `http://localhost:8081${url}`,
        method: method,
        json: JSON.parse(body), 
      }).pipe(res);
    })
  }
})

process.on('SIGINT', () => {
  console.log(`
  'CacheHit: '${statistics.cacheHit} 
  CacheMiss: ${statistics.cacheMiss} 
  ${statistics.cacheHit / statistics.total}%
  `);
  process.exit();
});

server.listen(port, hostname, () => console.log(`server listening on ${port}`));
