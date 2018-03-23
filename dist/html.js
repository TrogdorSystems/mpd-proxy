const Html = ( component, title, id ) => `
  <!DOCTYPE html>
  <html>
    <head>
      <title>${title}</title>
      <script crossorigin src="https://unpkg.com/react@16/umd/react.development.js"></script>
      <script crossorigin src="https://unpkg.com/react-dom@16/umd/react-dom.development.js"></script>
      <script type="text/javascript" src="/productionBundle.js"></script>
      </head>
      <body>
      <div id="app">${component}</div>
      <script>ReactDOM.hydrate(React.createElement(Reservation, { id: ${id} }), document.getElementById('app'))</script>
    </body>
  </html>
`;

module.exports = Html;
