let router = require('express').Router();
const config = require('../config/default.js');
const request_globals = require('../requestGlobals');
var crypto = require("crypto");

router.get('/', function(request,response) {
  let state = 'ajklhdflkajhdsf';
  request_globals.request_state = state;
  response.render ('partner', 
    {
      clientid: config.clientid,
      auth_url: "https://www.stage.volunteermatch.org/okta-login?" +
          "redirectUrl=http://localhost:3000/callback&clientId="+config.client_id+"&nonce=12421&state=new"
    }
  );
});

module.exports = router;
