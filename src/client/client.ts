
import { AppauthError } from '../errors/appauth-error'
import { AuthenticationRequest, AuthenticationRequestI } from '../authentication/authentication-request'
import { AuthenticationResponse, AuthenticationSuccessResponseI } from '../authentication/authentication-response'
import { AuthenticationResponseListener } from '../authentication/authentication-response-listener'
import { AxiosRequestor } from '../requestor/axios-requestor'
import { ClientCredentialsI } from './client-credentials'
import { Crypto } from '../crypto/crypto'
import { DefaultUrlUtility } from '../url-utility/default-url-utility'
import { ProviderConfigurationDiscoverer } from '../provider-configuration/provider-configuration-discoverer'
import { ProviderConfigurationI } from '../provider-configuration/provider-configuration'
import { Requestor } from '../requestor/requestor'
import { RevokeTokenRequest, RevokeTokenRequestI, TokenTypeT } from '../token/revoke-token-request'
import { RevokeTokenResponse } from '../token/revoke-token-response'
import { TokenResponse } from '../token/token-response'
import { TokenRequest, TokenRequestI, RefreshTokenRequest, RefreshTokenRequestI } from '../token/token-request'
import { UrlUtility } from '../url-utility/url-utility'

export abstract class Client {

  protected abstract authenticationRequest: AuthenticationRequest | null = null
  protected crypto?: Crypto
  protected listener?: AuthenticationResponseListener

  protected tokenRequest: TokenRequest | null = null
  protected refreshTokenRequest: RefreshTokenRequest | null = null
  protected revokeTokenRequest: RevokeTokenRequest | null = null
  protected configurationDiscoverer: ProviderConfigurationDiscoverer | null = null
  protected requestor: Requestor = new AxiosRequestor()
  protected urlUtility: UrlUtility = new DefaultUrlUtility()

  constructor(
      protected credentials: ClientCredentialsI,
      protected provider: string | ProviderConfigurationI) {

    if (typeof provider === 'string') {
      this.configurationDiscoverer = new ProviderConfigurationDiscoverer(provider)
    }
  }

  protected abstract getAuthenticationRequest(
    credentials: ClientCredentialsI,
    configuration: ProviderConfigurationI): AuthenticationRequest

  public setCrypto(crypto: Crypto): void {
    this.crypto = crypto
  }

  public setRequestor(requestor: Requestor): void {
    this.requestor = requestor

    if (this.configurationDiscoverer) {
      this.configurationDiscoverer.setRequestor(requestor)
    }

    if (this.tokenRequest) {
      this.tokenRequest.setRequestor(requestor)
    }

    if (this.refreshTokenRequest) {
      this.refreshTokenRequest.setRequestor(requestor)
    }

    if (this.revokeTokenRequest) {
      this.revokeTokenRequest.setRequestor(requestor)
    }
  }

  public setUrlUtility(urlUtility: UrlUtility): void {
    this.urlUtility = urlUtility
  }

  public setListener(listener: AuthenticationResponseListener): void {
    this.listener = listener
  }

  public async performAuthenticationRequest(request: AuthenticationRequestI): Promise<AuthenticationResponse> {
    const configuration = await this.getConfiguration()

// TODO pixtron - maybe it would be cleaner to have an authenticationRequest factory setable from outside?
    const authenticationRequest = this.getAuthenticationRequest(this.credentials, configuration)

    authenticationRequest.setUrlUtility(this.urlUtility)
    if (this.crypto) authenticationRequest.setCrypto(this.crypto)
    if (this.listener) authenticationRequest.setListener(this.listener)

    return authenticationRequest.performRequest(request)
  }

  public async exchangeCodeForToken(auth: AuthenticationResponse): Promise<TokenResponse> {
    if (auth.getType() !== AuthenticationResponse.AUTHENTICATION_SUCCESS) {
      throw new AppauthError('can only handle successfull authentication response')
    }

    const configuration = await this.getConfiguration()

    const tokenRequest = this.getTokenRequest(this.credentials, configuration)

    const response = auth.getResponse() as AuthenticationSuccessResponseI

    const request: TokenRequestI = { code: response.code }

    if (response.code_verifier) request.code_verifier = response.code_verifier

    return tokenRequest.performRequest(request)
  }

  public async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const configuration = await this.getConfiguration()

    const refreshTokenRequest = this.getRefreshTokenRequest(this.credentials, configuration)

    const request: RefreshTokenRequestI = { refresh_token: refreshToken }

    return refreshTokenRequest.performRequest(request)
  }

  public async revokeToken(token: string, tokenType?: TokenTypeT): Promise<RevokeTokenResponse> {
    const configuration = await this.getConfiguration()

    const revokeTokenRequest = this.getRevokeTokenRequest(this.credentials, configuration)

    const request: RevokeTokenRequestI = { token: token }

    if (tokenType) request.token_type_hint = tokenType

    return revokeTokenRequest.performRequest(request)
  }

  protected async getConfiguration() {
    let configuration: ProviderConfigurationI

    if (this.configurationDiscoverer !== null) {
      configuration = await this.configurationDiscoverer.getConfiguration()
    } else {
      configuration = this.provider as ProviderConfigurationI
    }

    return configuration
  }

  protected getTokenRequest(
      credentials: ClientCredentialsI,
      configuration: ProviderConfigurationI): TokenRequest {

    if (this.tokenRequest === null) {
      this.tokenRequest = new TokenRequest(credentials, configuration)
      this.tokenRequest.setRequestor(this.requestor)
    }

    return this.tokenRequest
  }

  protected getRefreshTokenRequest(
      credentials: ClientCredentialsI,
      configuration: ProviderConfigurationI): RefreshTokenRequest {

    if (this.refreshTokenRequest === null) {
      this.refreshTokenRequest = new RefreshTokenRequest(credentials, configuration)
      this.refreshTokenRequest.setRequestor(this.requestor)
    }

    return this.refreshTokenRequest
  }

  protected getRevokeTokenRequest(
      credentials: ClientCredentialsI,
      configuration: ProviderConfigurationI): RevokeTokenRequest {

    if (this.revokeTokenRequest === null) {
      this.revokeTokenRequest = new RevokeTokenRequest(credentials, configuration)
      this.revokeTokenRequest.setRequestor(this.requestor)
    }

    return this.revokeTokenRequest
  }
}
