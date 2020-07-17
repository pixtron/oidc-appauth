import * as open from 'open'

import { AppauthError } from '../errors/appauth-error'
import { AuthenticationRequest, AuthenticationRequestI } from './authentication-request'
import { AuthenticationResponse } from './authentication-response'
import { AuthenticationResponseListener } from './authentication-response-listener'
import { ClientCredentialsI } from '../client/client-credentials'
import { Crypto } from '../crypto/crypto'
import { DefaultUrlUtility } from '../url-utility/default-url-utility'
import { NodeCrypto } from '../crypto/node-crypto'
import { NodeAuthenticationResponseListener } from './node-authentication-response-listener'
import { ProviderConfigurationI } from '../provider-configuration/provider-configuration'
import { UrlUtility } from '../url-utility/url-utility'

export class NodeAuthenticationRequest extends AuthenticationRequest {
  protected crypto: Crypto = new NodeCrypto()
  protected urlUtility: UrlUtility = new DefaultUrlUtility()
  protected listener: AuthenticationResponseListener

  constructor(
      protected credentials: ClientCredentialsI,
      protected configuration: ProviderConfigurationI) {

    super(credentials, configuration)

    this.listener = new NodeAuthenticationResponseListener(this.credentials.redirect_uri)
  }

  public async performRequest(request: AuthenticationRequestI): Promise<AuthenticationResponse> {
    this.request = request

    return new Promise(async (resolve, reject) => {
      try {
        await this.listener.start()
        const url = await this.getRequestUrl()

        this.listener.once('stoped', () => {
          reject(new AppauthError('AuthenticationResponseListener stoped, aborting request'))
        })

        this.listener.once('error', (error) => {
          reject(new AppauthError('AuthenticationResponseListener had an error, aborting request', error))
        })

        this.listener.once('response', async (responseUrl) => {
          const response = new AuthenticationResponse(this.request!, responseUrl)
          resolve(response)
          await this.listener.stop()
        })

        await open(url)
      } catch (error) {
        try {
          await this.listener.stop()
        } catch (error) {
          reject(error)
        }

        reject(error)
      }
    })
  }
}
