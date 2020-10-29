let router = require('express').Router();
const config = require('../config/default.js');
const axios = require('axios');
const request_globals = require('../requestGlobals');
module.exports = router;

router.get('/editOpps', function(req,res) {

  console.log('req.query= ' +JSON.stringify(req.query));
  let oppId= req.query.oppId;
  let title = req.query.title;
  let desc = req.query.desc;

  let queryBody =   {
    "query":
    "mutation{ updateOpportunity(input:{ id: " + oppId
      +", title: \"" + title
      +"\", description:\"" + desc
      +"\" }){ id,title,description}}"
  };
  console.log();
  console.log('queryBody ='+ JSON.stringify(queryBody));

  const options = {
    headers: {
      'Authorization': 'Bearer ' + request_globals.access_token,
      'Accept': 'application/json'
    }
  };

  // edit opp call
  axios.post(config.api.api_url, queryBody,
      options).then(function (respon) {
    console.log('opp update done: ' + respon.status);
    let reply = JSON.stringify(respon.data);
    console.log('    response = '+ reply);

    reply = JSON.parse(reply);

    if (respon.status ==200 && reply.errors === undefined) {
      res.redirect('/callback?updateMsg=Update successful');
    } else {
      res.redirect('/callback?errMsg=Update unsuccessful '+reply.errors);
    }

  }).catch(function (err) {console.log(err)});
});
