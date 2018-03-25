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
    } else if (url === `/productionBundle.js`) {
      redisClient.get('productionBundle', (err, response) => {
        if (response === null) {
          res.end(response);
        } else {
          let bundle = '';
          let readable = fs.createReadStream(`./bundles/productionBundle.js`)
            .on('data', chunk => {
              bundle += chunk;
            }).on('end', () => {
              console.log('end');
              res.end(bundle);
              redisClient.SET('productionBundle', bundle);
            }).on('error', err => {
              request(`http://localhost:8081${url}`).pipe(fs.createWriteStream('./bundles/productionBundle.js'))
                .on('finish', () => {
                  console.log('finish');
                  fs.readFile('./bundles/productionBundle.js', 'utf-8', (err, fsRes) => {
                    redisClient.SET('productionBundle', fsRes);
                    res.end(fsRes)
                    fs.createReadStream('./bundles/productionBundle.js').pipe(res);
                  });
                });
            });
        };
      });
    }
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
// app.use(express.static('./dist'));
server.listen(port, hostname, () => console.log(`server listening on ${port}`));
// // load the template file
// const compiled = _.template(fs.readFileSync('./dist/template.html', 'utf-8'))
