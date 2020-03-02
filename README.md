# oidc-appauth

oidc-appauth is a client SDK for [public javascript clients](https://tools.ietf.org/html/rfc6749#section-2.1)
for authenticating against [OpenId Connect](https://openid.net/specs/openid-connect-core-1_0.html) providers,
following the best practices defined in [RFC 8252 - OAuth 2.0 for Native Apps](https://tools.ietf.org/html/rfc8252).

The library only supports the recommended authorization code flow with [PKCE](https://tools.ietf.org/html/rfc7636).
It is not planed to add other authorization flows.

The library is designed to be used in `Node.js` cli applications and applications that use `electron` or similar node based frameworks.

## Installation

`npm install --save @pxtrn/oidc-appauth`

## Examples

There is a `Node.js` example in [`src/node-example.ts`](src/node-example.ts).

### Initialize the client

```ts
import { Client } from '@pxtrn/oidc-appauth'

const credentials = {
  client_id: 'YOUR CLIENT ID',
  redirect_uri: 'http://127.0.0.1:8000'
}

const client = new Client(credentials, 'https://accounts.google.com')
```

If the provider url is passed the client will get the provider configuration from the `.well-known/openid-configuration` endpoint.
You might also directly pass a provider configuration ([ProviderConfigurationI](src/provider-configuration/provider-configuration.ts))


### Authentication Request

```ts
import { AuthenticationRequestI } from '@pxtrn/oidc-appauth'

const request: AuthenticationRequestI = {
  scope: 'openid'
}

const authResponse = await client.performAuthenticationRequest(request)

const responseType = authResponse.getType()

switch (responseType) {
  case AuthenticationResponse.AUTHENTICATION_SUCCESS:
    // a Successful Authentication Response as defined in https://openid.net/specs/openid-connect-core-1_0.html#AuthResponse
    console.log('Got authentication response', authResponse)
  case AuthenticationResponse.AUTHENTICATION_ERROR:
    // an Authentication Error Response as defined in https://openid.net/specs/openid-connect-core-1_0.html#AuthError
    console.log('Got authentication error response', authResponse.getResponse())
    break
  case AuthenticationResponse.AUTHENTICATION_INVALID:
    // Neither a valid Successfull Autentication Response nor a valid Authentication Error Response
    console.log('Got authentication invalid response', authResponse.getResponse())
    break
}
```


### Exchange authorization code for token

```ts
import { TokenResponse } from '@pxtrn/oidc-appauth'

//authResponse from [Authentication Request](#authentication-request)
const response = await client.exchangeCodeForToken(authResponse)

const responseType = response.getType()

switch (responseType) {
  case TokenResponse.RESPONSE_SUCCESS:
    // an oidc Token Success Response as defined in https://openid.net/specs/openid-connect-core-1_0.html#TokenSuccessResponse
    console.log('Got token response', response.getResponse())
  case TokenResponse.RESPONSE_ERROR:
    // an oidc Token Error Response as defined in https://openid.net/specs/openid-connect-core-1_0.html#TokenErrorResponse
    console.log('Got token error response', response.getResponse())
    break
  case TokenResponse.RESPONSE_INVALID:
    // neither a valid Token Success Response nor a valid Token Error Response
    console.log('Got invalid token response', response.getResponse())
    break
}
```


### Refresh access token

```ts
import { TokenResponse } from '@pxtrn/oidc-appauth'

// refreshToken from previous TokenResponse
const response = await client.refreshToken(refreshToken)

const responseType = response.getType()

switch (responseType) {
  case TokenResponse.RESPONSE_SUCCESS:
    // an oidc Token Success Response as defined in https://openid.net/specs/openid-connect-core-1_0.html#TokenSuccessResponse
    console.log('Got token response', response.getResponse())
  case TokenResponse.RESPONSE_ERROR:
    // an oidc Token Error Response as defined in https://openid.net/specs/openid-connect-core-1_0.html#TokenErrorResponse
    console.log('Got token error response', response.getResponse())
    break
  case TokenResponse.RESPONSE_INVALID:
    // neither a valid Token Success Response nor a valid Token Error Response
    console.log('Got invalid token response', response.getResponse())
    break
}
```

### Revoke access token

```ts
import { RevokeTokenResponse } from '@pxtrn/oidc-appauth'

const response = await client.revokeToken(token, 'access_token')

const responseType = response.getType()

switch (responseType) {
  case RevokeTokenResponse.RESPONSE_SUCCESS:
    // a Revocation Response as defined in https://tools.ietf.org/html/rfc7009#section-2.2
    return response
  case RevokeTokenResponse.RESPONSE_RETRY:
    // a Error Response (503) as defined in https://tools.ietf.org/html/rfc7009#section-2.2.1
    console.log('Got revoke token retry response', response.getResponse())
    break
  case RevokeTokenResponse.RESPONSE_ERROR:
    // a Error Response (400) as defined in https://tools.ietf.org/html/rfc7009#section-2.2.1
    console.log('Got revoke token error response', response.getResponse())
    break
  case RevokeTokenResponse.RESPONSE_INVALID:
    // neither a valid Revocation Response nor a valid Error Response
    console.log('Got invalid revoke token response', response.getResponse())
    break
}
```
