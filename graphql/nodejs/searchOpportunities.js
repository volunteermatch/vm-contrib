const axios = require('axios'); 

const API_KEY = '<add api key here>';
const API_URL = 'https://graphql.stage.volunteermatch.org/graphql';


/**
 * If we want to search for virtual opportunities, we can remove the location parameter
 *   and add 'virtual: true' in the query like this:
 *   
 *  query {
  searchOpportunities(input:{
    virtual: true,
    specialFlag: "covid19"
  }){
    resultsSize,
    opportunities{
    	id,
    	location{virtual}
  }}
}
 *
 */

/**
 * This is the query we are sending to search opportunities
 */
var q = `query {
  searchOpportunities(input:{
    location: "san francisco"
    specialFlag: "covid19"
    categories:[childrenAndYouth, community]
    pageNumber:1
    sortCriteria: update
  }){
    resultsSize,
    opportunities{
    	id,
    	title 
      categories
      specialFlag
  }}
}`;

const options = {
  headers: { 
    'X-api-key': API_KEY,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

axios.post(
  API_URL,
  JSON.stringify({query: q}),
  options
).then((response) => {
  console.log(response.status + ' ' + response.statusText);
  if (response.data.errors) {
    console.log(response.data.errors);
  }
  if (response.data.data) {
    console.log(response.data.data.searchOpportunities);
  }
}).catch((error) => {
  console.log(error);
});

