//import modula
const express = require('express');
const bodyParser = require('body-parser');

//definiranje express aplikacije i porta na kojem će se vrtit
var app = express();
const port = process.env.PORT || 3000;

//govori expresu da koristi json
app.use(bodyParser.json());

// Add headers
app.use(function(req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,x-auth');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

require('./routes/events')(app);
require('./routes/user')(app);
require('./routes/response')(app);
require('./routes/shared')(app);
require('./routes/comments')(app);




//pokreće aplikaciju na portu koji je definiran
app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

//export za neke druge module
module.exports = {
  app
};
