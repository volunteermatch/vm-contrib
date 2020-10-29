let router = require('express').Router();
const config = require('../config/default.js');
const request_globals = require('../requestGlobals');
var crypto = require("crypto");

router.get('/', function(request,response) {
  let state = crypto.randomBytes(20).toString('hex');
  request_globals.request_state = state;
  response.render ('partner', 
    {
      clientid: config.clientid,
      auth_url: config.urls.auth + '?scope=vm/write:org+vm/read:user&' +
        "response_type=code&redirect_uri=" + config.callback.url +
         "&state=" + request_globals.request_state + "&client_id="
    }
  );
});

module.exports = router;
