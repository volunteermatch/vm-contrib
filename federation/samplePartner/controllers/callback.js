let router = require('express').Router();
const config = require('../config/default.js');
const axios = require('axios');
const qs = require('querystring');
const request_globals = require('../requestGlobals');

router.get('/callback', function(req,res){

    // retrieve token
    let authcode = req.query.code;
    let returned_state = req.query.state;
    let user = {};
    let org = {};
  
  if (request_globals.access_token === undefined) {

    if (returned_state != request_globals.request_state) {
      res.send('Security failure, unknown state received');
      console.error('Unexpected state: ' + returned_state);
    }
    const options = {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(config.clientid +':'+config.client_secret).toString('base64')
      }
    };
    // to get the authorization code/token
    axios.post(config.urls.token,
        qs.stringify({
          grant_type: 'authorization_code',
          redirect_uri: config.callback.url,
          code: authcode,
          client_id: config.clientid
        }),
        options
    ).then(function (resp) {
      // call API with token
      request_globals.access_token = resp.data.access_token;
      loadCallback(req, res);

    }).catch(function (error) {
      console.log('got an error getting the token');
      console.log(error.toJSON());
      res.send('got an error getting the token');
    });

  } else {
    loadCallback(req, res);
  }
});

var loadCallback = function(req, res) {

  const options = {
    headers: {
      'Authorization': 'Bearer ' + request_globals.access_token,
      'Accept': 'application/json'
    }
  };

  console.debug('Executing API call with token: ' + request_globals.access_token.substring(0, 20));
  let queryBody = {
    "query": "{ getUserInfo {email,firstName,lastName,adminOfOrgs {name,id,externalId}}   }"
  };

  // call to get the user info
  axios.post(config.api.api_url, queryBody,
      options).then(function (respon) {
    console.log('get user info is done ' + respon.status);
    user = JSON.parse(JSON.stringify(respon.data, null, 4));
    let orgs = user.data.getUserInfo.adminOfOrgs;
    if (orgs != null) {
      org = orgs[0];
    }

  }).then(function (resp) {
    console.log(" orgid =" + org.id);

    queryBody = {
      "query": "{  searchOpportunities( input:{ orgIds:[" + org.id + "]} ) { opportunities{id,title,description} } }"
    };

    // search call
    axios.post(config.api.api_url, queryBody,
        options).then(function (respon) {
      console.log('search done: ' + respon.status);

      let oppResult = JSON.parse(JSON.stringify(respon.data, null, 4));
      let info = user.data.getUserInfo;
      let opps = oppResult.data.searchOpportunities.opportunities;
      let updateMsg = req.query.updateMsg;
      let errMsg = req.query.errMsg;

      res.render('callback',
          {
            email: info.email,
            firstName: info.firstName,
            lastName: info.lastName,
            org: org,
            opps: opps,
            updateMsg: updateMsg,
            errMsg: errMsg
          }
      );

    }).catch(function (err) {
      console.log(err)
    });

  }).catch(function (err) {
    console.log(err)
  });
};

module.exports = router;