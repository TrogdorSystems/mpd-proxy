const Html = ( component, title, id, styles ) => `
  <!DOCTYPE html>
  <html>
    <head>
    <style type="text/css">
    ${styles}
    </style>
      <title>${title}</title>
      <script src="https://unpkg.com/react@16/umd/react.production.min.js"></script>
      <script src="https://unpkg.com/react-dom@16/umd/react-dom.production.min.js"></script>
      <script type="text/javascript" src="/productionBundle.js"></script>
    </head>
      <body>
      <div id="app">${component}</div>
      <script>ReactDOM.hydrate(React.createElement(Reservation, {id: ${id}}, null), document.getElementById('app'))</script>
    </body>
  </html>
`;

module.exports = Html;
