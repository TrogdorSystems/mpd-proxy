const Html = ( component, title, id, styles ) => `
  <!DOCTYPE html>
  <html>
    <head>
    <style type="text/csss">
    ${styles}
    </style>
      <title>${title}</title>
      <link rel="stylesheet" type="text/css" href="/styles.css"></link>
      <script src="https://unpkg.com/react@16/umd/react.production.min.js"></script>
      <script src="https://unpkg.com/react-dom@16/umd/react-dom.production.min.js"></script>
      <script type="text/javascript" src="/productionBundle.js"></script>
      <script type="text/javascript" src ="/menu-bundle.js"></script>
      <script type="text/javascript" src ="/appBundle.js"></script>
    </head>
      <body>
      <div id="SummaryView">${component[2]}</div>
      <div id='MenuView'>${component[1]}</div>
      <div id='Reservation'>${component[0]}</div>
      <script>ReactDOM.hydrate(React.createElement(SummaryView, {id: ${id}}, null), document.getElementById('SummaryView'))</script>
      <script>ReactDOM.hydrate(React.createElement(MenuView, {name: 'quos999999'}, null), document.getElementById('MenuView'))</script>
      <script>ReactDOM.hydrate(React.createElement(Reservation, {id: ${id}}, null), document.getElementById('Reservation'))</script>
    </body>
  </html>
`;

module.exports = Html;

/*
+        component.map((comp, idx) => {
+        return `<div id=${names[idx]}>${comp}</div>
+        <script>ReactDOM.hydrate(React.createElement(${names[idx]}, {id: ${id}}, null), document.getElementById('${names[idx]}'))</script>`
+      }).join('')*/

