require('newrelic');
const fs = require('fs');
const path = require('path');
const Html = require('./dist/html.js');
const http = require('http');
const request = require('request');
const { renderToString } = require('react-dom/server');
const { createElement } = require('react');
const Reservation = require('./bundles/productionBundle-server').default;
const redisClient = require('./cache')
const moment = require('moment');
const styles = require('./dist/proxyStyles.css');
const servicePaths = require('./servicePaths');

const port = 8000;

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
    const [id, date] = [urlSplit[1], urlSplit[3]];
    if (url === '/') {
      let randomId = Math.floor(Math.random() * (10e6 - 1) - 1);
      res.end(Html(rendercomponent(Reservation, randomId), 'silverspoon', randomId, styles));
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
          http.get(`http://ec2-54-219-137-44.us-west-1.compute.amazonaws.com${url}`, (result) => {
            let body = '';
            result.on('data', chunk => body += chunk)
            result.on('end', () => {
              redisClient.SETEX(redisKey, 20, body);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(body);
            })
          });
        }
      });
    } else if (url.indexOf('Bundle') > -1) {
      redisClient.get(url.toString(), (err, response) => {
        if (err) throw new Error(err);
        if (response !== null && response !== undefined) {
          res.end(response);
        } else {
          //get bundle from file if not in cache
          let bundle = '';
          fs.createReadStream(`./bundles${url}`)
              .on('data', chunk => {
                bundle += chunk;
              }).on('end', () => {
                res.end(bundle);
                redisClient.SET(url.toString(), bundle);
              })     
          .on('error', err => {
            //get bundle from server if not in proxy file, then write it to file
            http.get(`${servicePaths(url)}${url}`, response => (
                response.pipe(res)
              ))
              .on('finish', () => (
                http.get(`${servicePaths(url)}${url}`, result => (
                  result.pipe(fs.createWriteStream(`./bundles${url}`))
                  .on('finish', () => (
                    fs.readFile(`./bundles${url}`, 'utf-8', (err, fsRes) => (
                      err ? console.error(err) : redisClient.SET(url.toString(), fsRes)
                    ))
                  ))
                ))
              ));
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
        url: `http://ec2-54-219-137-44.us-west-1.compute.amazonaws.com${url}`,
        method: method,
        json: JSON.parse(body), 
      }).pipe(res);
    });
  };
})

process.on('SIGINT', () => {
  console.log(`
  'CacheHit: '${statistics.cacheHit} 
  CacheMiss: ${statistics.cacheMiss} 
  ${statistics.cacheHit / statistics.total}%
  `);
  process.exit();
});

server.listen(port, () => console.log(`server listening on ${port}`));
