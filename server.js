require('newrelic');
const fs = require('fs');
const Html = require('./dist/html.js')
const http = require('http');
const request = require('request');
const { renderToString, renderToNodeStream } = require('react-dom/server');
const { hydrate } = require('react-dom/server');
const { createElement } = require('react');
const Reservation = require('./dist/productionBundle-server').default;
const redisClient = require('./cache')
const moment = require('moment');

const port = 8000;
const hostname = '127.0.0.1';

const server = http.createServer((req, res) => {
  let rendercomponent = (component, id) => {
    let componentString = createElement(component, `{ id: ${id} }`, null);
    return renderToString(componentString);
  };
  const { method, url } = req;
  if (method === 'GET') {
    const urlSplit = url.split('/').slice(1);
    [id, date] = [urlSplit[1], urlSplit[3]];
    console.log('url', url, id, date)
    if (url === '/') {
      let randomId = Math.floor(Math.random() * (10e6 - 1) - 1);
      res.end(Html(rendercomponent(Reservation, randomId), 'silverspoon', randomId));
    } else if (url === `/restaurants/${id}/reservations/${date}`) {
      const redisKey = `${id}${date}`;
      redisClient.GET(redisKey, (err, response) => {
        if (response !== null && response !== undefined) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(response);
        } else {
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

server.listen(port, hostname, () => console.log(`server listening on ${port}`));
