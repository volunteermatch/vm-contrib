const axios = require('axios');

const API_KEY = '<add api key here>';
const API_URL = 'https://graphql.stage.volunteermatch.org/graphql';

// You will get an error "A connection for user joe@standard.org already exists."
// if you run the command more than once unless you change either the oppId or
// the users email to one that has not made a connection to this opportunity yet

// If a connection is successfully made this query request that the some data
// about the connection is returned.

var q = `mutation {
  createConnection ( 
    input: {
    oppId: 248490
      comments: "Connection created by node.js example code"
      volunteer: {
        email: "joe@standard.org"
        firstName: "Joe"
        lastName: "Standard"
        phoneNumber: "925-381-3333"
        zipCode: "94521"
        acceptTermsAndConditions: true
      }
    } ) {
    comments
    volunteer {
      email
      firstName
      lastName
      phoneNumber
      zipCode
    }
    enlister {
      email
      firstName
      lastName
      phoneNumber
      zipCode
    }
    shifts {
      id
      name
      notes
      date
      startTime
      endTime
      volNeeded
    }
    replies {
      id
      values
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
  JSON.stringify({query: q}),
  options
).then((response) => {
  console.log(response.status + ' ' + response.statusText);
  if (response.data.errors) {
    console.log(response.data.errors);
  }
  if (response.data.data) {
    console.log(response.data.data.createConnection);
  }
}).catch((error) => {
  console.log(error);
});

