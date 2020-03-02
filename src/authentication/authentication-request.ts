import { AppauthError } from '../errors/appauth-error'
import { AuthenticationResponse } from './authentication-response'
import { AuthenticationResponseListener } from './authentication-response-listener'
import { ClientCredentialsI } from '../client/client-credentials'
import { Crypto } from '../crypto/crypto'
import { ProviderConfigurationI } from '../provider-configuration/provider-configuration'
import { StringHashI } from '../types'
import { UrlUtility } from '../url-utility/url-utility'

const STATE_SIZE = 16
const CODE_VERIFIER_SIZE = 32

/**
 * Reperesents an authentication request as hash
 */
export interface AuthenticationRequestI {
  scope: string
  state?: string
  usePkce?: boolean
  extras?: StringHashI,
  internal?: StringHashI
}

export abstract class AuthenticationRequest {
  static RESPONSE_TYPE_CODE = 'code'

  protected abstract crypto: Crypto
  protected abstract urlUtility: UrlUtility
  protected abstract listener: AuthenticationResponseListener

  protected request: AuthenticationRequestI | null = null

  constructor(
    protected credentials: ClientCredentialsI,
    protected configuration: ProviderConfigurationI) {}

  public async abstract performRequest(request: AuthenticationRequestI): Promise<AuthenticationResponse>

  public setCrypto(crypto: Crypto): void {
    this.crypto = crypto
  }

  public setUrlUtility(urlUtility: UrlUtility): void {
    this.urlUtility = urlUtility
  }

  public setListener(listener: AuthenticationResponseListener): void {
    this.listener = listener
  }

  public getRequest(): AuthenticationRequestI | null {
    return this.request
  }

  protected async generatePkce(): Promise<{verifier: string, challenge: string}> {
    const verifier = await this.crypto.generateUrlSaveRandomString(CODE_VERIFIER_SIZE)
    const challenge = await this.crypto.deriveChallenge(verifier)

    return { verifier, challenge }
  }

  protected async getRequestUrl(): Promise<string> {
    if (this.request === null) throw new AppauthError('request is not set')

    let extras = {}

    if (this.request.extras) extras = this.request.extras

    const params: StringHashI = {
      ...extras,
      client_id: this.credentials.client_id,
      redirect_uri: this.credentials.redirect_uri,
      scope: this.request.scope,
      response_type: AuthenticationRequest.RESPONSE_TYPE_CODE
    }

    if (!this.request.state) {
      this.request.state = await this.crypto.generateUrlSaveRandomString(STATE_SIZE)
    }

    params.state = this.request.state

    if (this.request.usePkce !== false) {
      const { verifier, challenge } = await this.generatePkce()

      if (!this.request.internal) this.request.internal = {}
      this.request.internal['code_verifier'] = verifier

      params.code_challenge = challenge
      params.code_challenge_method = 'S256'
    }

    const endpoint = this.configuration.authorization_endpoint

    return this.urlUtility.buildUrl(endpoint, params)
  }
}
