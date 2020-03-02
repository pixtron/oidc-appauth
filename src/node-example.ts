
import {
  Client,
  AuthenticationRequestI,
  AuthenticationResponse,
  TokenResponse,
  TokenSuccessResponseI,
  RevokeTokenResponse,
  TokenTypeT
} from './index'

const credentials = {
  client_id: '511828570984-7nmej36h9j2tebiqmpqh835naet4vci4.apps.googleusercontent.com',
  // host must either be '127.0.0.1' or '[::1]' see https://tools.ietf.org/html/rfc8252#section-8.3
  // port should be randomly choosen see https://tools.ietf.org/html/rfc8252#section-7.3
  redirect_uri: 'http://127.0.0.1:8000'
}

// the second parameter might be a ProviderConfigurationI object if the provider configuration is transmited out of band
const client = new Client(credentials, 'https://accounts.google.com')

const request: AuthenticationRequestI = {
  scope: 'openid'
}

async function run() {
  console.log('Authenticating...')

  const tokenResponse = await authenticate()

  console.log('Authenticated', tokenResponse.getType(), tokenResponse.getResponse())
  const token = tokenResponse.getResponse() as TokenSuccessResponseI

  await sleep(2000)

  console.log('Refreshing tokens...')

  const refreshResponse = await refreshToken(token.refresh_token!)
  const refreshedToken = refreshResponse.getResponse() as TokenSuccessResponseI

  console.log('Refreshed tokens', refreshResponse.getType(), refreshResponse.getResponse())

  await sleep(1000)

  console.log('Revoking access token...')

  const revokeResponse = await revokeToken(refreshedToken.access_token, 'access_token')

  console.log('Revoked token', revokeResponse.getType(), revokeResponse.getResponse())
}

async function sleep(timeout: number = 1000): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, timeout)
  })
}

async function authenticate(): Promise<TokenResponse> {
  const authResponse = await client.performAuthenticationRequest(request)

  const responseType = authResponse.getType()

  switch (responseType) {
    case AuthenticationResponse.AUTHENTICATION_SUCCESS:
      // a Successful Authentication Response as defined in https://openid.net/specs/openid-connect-core-1_0.html#AuthResponse
      const tokenResponse = await exchangeCodeForToken(authResponse)

      return tokenResponse
    case AuthenticationResponse.AUTHENTICATION_ERROR:
      // an Authentication Error Response as defined in https://openid.net/specs/openid-connect-core-1_0.html#AuthError
      console.log('Got authentication error response', authResponse.getResponse())
      break
    case AuthenticationResponse.AUTHENTICATION_INVALID:
      // Neither a valid Successfull Autentication Response nor a valid Authentication Error Response
      console.log('Got authentication invalid response', authResponse.getResponse())
      break
  }

  throw new Error('Could not authenticate')
}

async function exchangeCodeForToken(authResponse: AuthenticationResponse): Promise<TokenResponse> {
  const response = await client.exchangeCodeForToken(authResponse)

  const responseType = response.getType()

  switch (responseType) {
    case TokenResponse.RESPONSE_SUCCESS:
      // an oidc Token Success Response as defined in https://openid.net/specs/openid-connect-core-1_0.html#TokenSuccessResponse
      return response
    case TokenResponse.RESPONSE_ERROR:
      // an oidc Token Error Response as defined in https://openid.net/specs/openid-connect-core-1_0.html#TokenErrorResponse
      console.log('Got token error response', response.getResponse())
      break
    case TokenResponse.RESPONSE_INVALID:
      // neither a valid Token Success Response nor a valid Token Error Response
      console.log('Got invalid token response', response.getResponse())
      break
  }

  throw new Error('Could not exchange code for token')
}

async function refreshToken(refreshToken: string): Promise<TokenResponse> {
  const response = await client.refreshToken(refreshToken)

  const responseType = response.getType()

  switch (responseType) {
    case TokenResponse.RESPONSE_SUCCESS:
      // an oidc Token Success Response as defined in https://openid.net/specs/openid-connect-core-1_0.html#TokenSuccessResponse
      return response
    case TokenResponse.RESPONSE_ERROR:
      // an oidc Token Error Response as defined in https://openid.net/specs/openid-connect-core-1_0.html#TokenErrorResponse
      console.log('Got token error response', response.getResponse())
      break
    case TokenResponse.RESPONSE_INVALID:
      // neither a valid Token Success Response nor a valid Token Error Response
      console.log('Got invalid token response', response.getResponse())
      break
  }

  throw new Error('Could not refresh token')
}

async function revokeToken(token: string, tokenType?: TokenTypeT): Promise<RevokeTokenResponse> {
  const response = await client.revokeToken(token, tokenType)

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

  throw new Error('Could not revoke token')
}

run().then(() => {
  console.log('Successfull')
}).catch(error => {
  console.log('Got Error', error)
  process.exit(1)
})
