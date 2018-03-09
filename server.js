const fs = require('fs');
const express = require('express');
const _ = require('underscore');

const app = express();

app.use(express.static('./dist'));

// load the template file
const compiled = _.template(fs.readFileSync('./dist/template.html', 'utf-8'));

app.get('/:id', (req, res) => {
  // inject id into the template
  const output = compiled({id: req.params.id});

  // serve back to the client
  res.send(output);
});

const port = process.env.PORT || 8081;

app.listen(port, () => {
  console.log('app is listening on', port);
});
