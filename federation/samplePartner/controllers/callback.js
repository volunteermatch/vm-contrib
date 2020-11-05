let router = require('express').Router();
const config = require('../config/default.js');
const axios = require('axios');
const qs = require('querystring');
const request_globals = require('../requestGlobals');

router.get('/callback', function(req,res){

    let authcode = req.query.code;
    let returned_state = req.query.state;
  
  if (request_globals.refresh_token === undefined) {

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
      request_globals.refresh_token = resp.data.refresh_token;
      loadPageContent(req, res);

    }).catch(function (error) {
      console.log('got an error getting the token');
      console.log(error.toJSON());
      res.send('got an error getting the token');
    });

  } else {
    // called at the completion of update/create opportunities
    doRefreshToken();
    loadPageContent(req, res);
  }
});

var loadPageContent = function(req, res) {

  let pageContent = {
    oppResult: {},
    updateMsg: '',
    errMsg:'',
    org: {},
    info: {},
    user:{}
  };

  const options = {
    headers: {
      'Authorization': 'Bearer ' + request_globals.access_token,
      'Accept': 'application/json'
    }
  };

  console.debug('\nExecuting API call with token: ' + request_globals.access_token.substring(0, 20));
  let queryBody = {
    "query": "{ getUserInfo {email,firstName,lastName,adminOfOrgs {name,id,externalId}}   }"
  };

  // call to get the user info
  axios.post(config.api.api_url, queryBody,
      options).then(function (respon) {
    console.log('get user info is done ' + respon.status);
    pageContent.user = JSON.parse(JSON.stringify(respon.data, null, 4));
    let orgs = pageContent.user.data.getUserInfo.adminOfOrgs;
    if (orgs != null) {
      pageContent.org = orgs[0];
    }

  }).then(function (resp) {

    pageContent.updateMsg = req.query.updateMsg;
    pageContent.errMsg = req.query.errMsg;

    if (pageContent.org !== undefined) {
      console.log(" orgid =" + pageContent.org.id);

      queryBody = {
        "query": "{  searchOpportunities( input:{ orgIds:[" + pageContent.org.id + "]} ) { opportunities{id,title,description} } }"
      };

      console.log('\nabout to call search, query body= '+JSON.stringify(queryBody));

      // search call
      axios.post(config.api.api_url, queryBody, options).then(function (respon) {
        console.log('search done: ' + respon.status);

        pageContent.oppResult = JSON.parse(JSON.stringify(respon.data, null, 4));
        setDisplayVars(res, pageContent);

      }).catch(function (err) {
        console.log(err)
      });

    } else {
      // this user has no orgs in her account
      setDisplayVars(res, pageContent);
    }


  }).catch(function (err) {
    console.log(err)
  });
};

var doRefreshToken = function() {

  const options = {
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(config.clientid +':'+config.client_secret).toString('base64')
    }
  };

  axios.post(config.urls.token,
      qs.stringify({
        grant_type: 'refresh_token',
        refresh_token: request_globals.refresh_token,
        client_id: config.clientid
      }),
      options
  ).then(function (resp) {
    // reset the access token
    request_globals.access_token = resp.data.access_token;

    console.log('\naccess token refresh = '+request_globals.access_token.substring(0, 20));


  }).catch(function (error) {
    console.log('got an error getting refresh token');
    console.log(error.toJSON());
    res.send('got an error getting refresh token');
  });
};

var setDisplayVars = function(res, pageContent) {
  let info = pageContent.user.data.getUserInfo;
  let opps = [];

  if (JSON.stringify(pageContent.oppResult) !== '{}' ) {
    opps = pageContent.oppResult.data.searchOpportunities.opportunities;
  }

  res.render('callback',
      {
        email: info.email,
        firstName: info.firstName,
        lastName: info.lastName,
        org: pageContent.org,
        opps: opps,
        updateMsg: pageContent.updateMsg,
        errMsg: pageContent.errMsg
      }
  );

};

module.exports = router;