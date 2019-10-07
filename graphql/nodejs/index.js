const axios = require('axios'); 

const API_KEY = '<add api key here>';
const API_URL = 'https://apibeta.stage.volunteermatch.org/graphql';

var query = `query { 
  searchOpportunities(
    input: {
      location: "San Francisco, CA"
    }
  ) {
    currentPage
    resultsSize
    opportunities {
      title
      location {
        city
        region
      }
      parentOrg {
        name
      }      
    }
  }
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
  JSON.stringify({query}),
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

