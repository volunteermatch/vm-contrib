let router = require('express').Router();
const config = require('../config/default.js');
const axios = require('axios');
const request_globals = require('../requestGlobals');
module.exports = router;


router.get('/createOpp', function(req,res) {

  let title = req.query.title;
  let desc = req.query.desc;
  let orgId = req.query.orgId;
  let isSubmit = req.query.isSubmit;
  let userEmail = req.query.email;

  if (isSubmit) {
    let queryBody = {
      "query": "mutation { createOpportunity ( input: {" +
      "orgId:\"" + orgId + "\"," +
      "opportunity:{" +
      "title:\"" + title + "\"," +
      "description:\"" + desc + "\"," +
      "volunteersNeeded:20," +
      "location:{virtual:true}" +
      "contact:{" +
      " email:\"" + userEmail + "\"," +
      " firstName:\"Elsa\"" +
      "}," +
      "categories:[seniors]," +
      "dateRange: {" +
      " ongoing:true" +
      "}}}) {id,title,description}}"
    };

    const options = {
      headers: {
        'Authorization': 'Bearer ' + request_globals.access_token,
        'Accept': 'application/json'
      }
    };

    console.log("\n   create query= "+JSON.stringify(queryBody));

    // create opp call
    axios.post(config.api.api_url, queryBody,
        options).then(function (respon) {
      
      console.log('opp create done: ' + respon.status);
      let reply = JSON.stringify(respon.data);
      console.log('      response =' + reply);
      reply = JSON.parse(reply);

      if (respon.status == 200 && reply.errors === undefined) {
        res.redirect('/callback?updateMsg=Create successful');
      } else {
        res.redirect('/callback?errMsg=Create unsuccessful ' + JSON.stringify(reply.errors));
      }

    }).catch(function (err) {
      console.log(err)
    });

  } else {
    console.log("   displaying createOpp");
    res.render ('createOpp',
        {
          orgId: orgId,
          email: userEmail
        }
    );
  }
});
