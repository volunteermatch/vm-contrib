// storing session variables as globals only works for a single user at a time
var request_state;
var client_id;
var access_token;
var refresh_token;

module.exports.request_state = request_state;
module.exports.client_id = client_id;
module.exports.access_token = access_token;
module.exports.refresh_token = refresh_token;