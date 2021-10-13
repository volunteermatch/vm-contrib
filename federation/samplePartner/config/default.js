let baseurl = 'https://dev-33257370.okta.com';

module.exports = {
  clientid: '$CLIENT_ID',
  client_secret: '$CLIENT_SECRET',
  urls: {
    auth: baseurl + '/oauth2/default/v1/authorize',
    token: baseurl + '/oauth2/default/v1/token'
  },
  callback: {
    url: 'http://localhost:3000/callback'
  },
  api: {
    api_url: '$API_URL'
  }
};
