const http = require('http');
const express = require('express');
let mustacheExpress = require('mustache-express');
let bodyParser = require('body-parser');
const app = express();
const router = require('express').Router();
const config = require('./config/default.js');
const partnerRoute = require('./controllers/partner');
const callbackRoute = require('./controllers/callback');
const editOppsRoute = require('./controllers/editOpps');
const createOppsRoute = require('./controllers/createOpp');

module.exports = router;

app.set('view engine', 'mustache');
app.engine('mustache', mustacheExpress());
app.use (bodyParser.urlencoded( {extended : true} ) );

app.use('/', partnerRoute);
app.use('/', callbackRoute);
app.use('/', editOppsRoute);
app.use('/', createOppsRoute);

const server = http.createServer(app);
const port = 3000;
server.listen(port);
console.debug('Server listening on port ' + port);

