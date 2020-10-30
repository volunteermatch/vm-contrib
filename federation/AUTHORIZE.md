# Authorizing OAuth Apps
You can enable VolunteerMatch users to authorize your OAuth application. 

The primary use case currently is a VolunteerMatch non-profit administrator authorizing your application to read and write organization information, including volunteer opportunities, to their VolunteerMatch account. This allows publishing of volunteer opportunities to the VolunteerMatch network, as well as syndication of VolunteerMatch opportunities on other web properties. 

VolunteerMatch’s OAuth implementation supports the standard [authorization code grant type](https://tools.ietf.org/html/rfc6749#section-4.1). You should implement the web application flow described below to obtain an authorization code and then exchange it for a token. (The implicit grant type is not supported.)

## Getting Started
VolunteerMatch offers two environments:
* a Staging environment with test data where development and testing should take place
* Production, with live data, where only tested solutions should be deployed
Initially, you will be issued information you’ll need to get started in our Staging environment. Once your solution is ready to migrate to production, the following will be updated for the Production environment. For both environments, you will need the following:
* Client ID
* Client Secret (used to securely retrieve a token)
* Authentication Server URLs for
  * User login, and
  * Token retrieval
* VolunteerMatch Federation API GraphQL URL
* List of scopes you are able to access on behalf of VolunteerMatch users

You must provide to VolunteerMatch the following information to be configured
* Test and Production Callback URI(s) (can be localhost or other test systems reachable to your test browsers). These are absolute URIs using the HTTPS protocol (only localhost addresses can use plain HTTP)

## Web application flow
The flow to allow users to authorize your app is:
1. Users are redirected from your application to VolunteerMatch to request their VolunteerMatch identity
2. If successful, users are redirected back to your site by VolunteerMatch with an authorization code, and your app retrieves the user’s access token using this code
3. Your app accesses the VolunteerMatch API with the user's access token on behalf of the user

## 1. Request a user's VolunteerMatch identity
GET https://auth.volunteermatch.org/login/oauth/authorize
 
Parameters
Name|Type|Description
----|----|-----------
client_id|string|Required. The client ID you received from VolunteerMatch.
redirect_uri|string|Required. An exact match of the absolute URI you pre-registered with VolunteerMatch, and must be using the HTTPS protocol (plain HTTP is allowed only for localhost testing).
response_type|string|Required. “code” is currently the only accepted value.
scope|string|Optional. A space-delimited list of scopes. If no scopes are requested, all associated with your client are granted. We recommend that you limit this list to only the scope your application requires. Note that the scopes that can be requested are specified per-client as part of initial client configuration
state|string|Optional, but strongly recommended. An unguessable random string. It is used to protect against cross-site request forgery attacks, ensuring that responses to your callback were initiated in your application.

## 2. Users are redirected back to your site by VolunteerMatch
If the user accepts your request and authenticates successfully, VolunteerMatch redirects back to your site's redirect_uri with a temporary code in a code parameter as well as the state you provided in the previous step in a state parameter. The temporary code will expire after 10 minutes. If the state parameters do not match, then a third party created the request, and you should abort the process.
Exchange this code for an access token:
POST https://auth.volunteermatch.org/oauth2/token
 
#### Headers
Name|Description
---|---
Content-Type|Required. Must be 'application/x-www-form-urlencoded'.
Authorization|Your client was issued a secret, the client must pass its client_id and client_secret in the authorization header through Basic HTTP authorization. The secret is Basic Base64Encode(client_id:client_secret).
 
#### Parameters
Name|Type|Description
---|---|---
grant_type|string|Required. Must be authorization_code or refresh_token
client_id|string|Required. The client ID you received from VolunteerMatch.
code|string|Required. The code you received as a response to Step 1.
redirect_uri|string|The URL in your application where users are sent after authorization.

#### Response
The response comes back in a JSON format:
```
HTTP/1.1 200 OK
Content-Type: application/json
{
 "access_token":"eyJz9sdfsdfsdfsd", 
 "token_type":"Bearer", 
 "expires_in":3600
}
```
 
## 3. Use the access token to access the API
The access token allows you to make requests to the API on behalf of a user. Include it as follows in the Authorization header in your requests to the VolunteerMatch Open Network API.
```
Authorization: Bearer <OAUTH-ACCESS-TOKEN>
POST https://api.volunteermatch.org/graphql
```
For more information on managing volunteer opportunities and organizations using the VolunteerMatch Open Network API, please see https://github.com/volunteermatch/vm-contrib/tree/master/graphql
 
