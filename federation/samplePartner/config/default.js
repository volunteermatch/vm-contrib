let baseurl = '<VolunteerMatch login url>';

module.exports = {
    clientid: '<my client id>',
    client_secret: '<my client secret>',
    urls: {
        auth: baseurl + '/login',
        token: baseurl + '/token'
    },
    callback: {
        url: 'http://localhost:3000/callback'
    },
    api: {
        api_url: '<VolunteerMatch API url>'
    }
  };