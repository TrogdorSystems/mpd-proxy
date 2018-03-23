const fs = require('fs');
const _ = require('underscore');
const Html = require('./dist/html.js')
const http = require('http');
const request = require('request');
const { renderToString } = require('react-dom/server');
const { createElement } = require('react');
const reservationsBundle = require('./dist/productionBundle-server').default;

const port = 8000;
const hostname = '127.0.0.1';

const server = http.createServer((req, res) => {
  let rendercomponent = (component, id) => {
    let componentString = createElement(component, { id });
    return renderToString(componentString);
  };
  const { method, url } = req;
  const urlSplit = url.split('/');
  let id = urlSplit[2] !== 'undefined' ? urlSplit[2] : 305;
  if (method === 'GET' && url === `/restaurants/${urlSplit[2]}/reservations/${urlSplit[4]}`) {
      request(`http://localhost:8081${url}`).pipe(res);
  } else if (method === 'GET' && url === `/productionBundle.js`){
    // res.writeHead(200, { 'Content-Type': 'text/html'})
    request(`http://localhost:8081/productionBundle.js`).pipe(res);
  } else if (method === 'GET' && url === '/') {
    res.end(Html(rendercomponent(reservationsBundle, 305), 'silverspoon', 305));
  } else if (method === 'GET' && url === '/favicon.ico') {
    res.writeHead(304)
    res.end()
  }

})
// app.use(express.static('./dist'));
server.listen(port, hostname, () => console.log(`server listening on ${port}`));
// // load the template file
// const compiled = _.template(fs.readFileSync('./dist/template.html', 'utf-8'))
