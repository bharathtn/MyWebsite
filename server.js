var express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  path = require('path');

var routes = require('./api/routes');

// app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(function(req, res, next) {
  console.log(req.method, req.url);
  next();
});


app.listen(9000);

app.use(express.static(path.join(__dirname, 'client')));

app.use('/api', routes);



console.log('server started on 9000');
module.exports = app;
