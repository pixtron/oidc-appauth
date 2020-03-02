
import { AuthenticationRequest } from '../authentication/authentication-request'
import { Client } from './client'
import { ClientCredentialsI } from './client-credentials'
import { NodeAuthenticationRequest } from '../authentication/node-authentication-request'
import { ProviderConfigurationI } from '../provider-configuration/provider-configuration'

export class NodeClient extends Client {
  protected authenticationRequest: NodeAuthenticationRequest | null = null

  protected getAuthenticationRequest(
      credentials: ClientCredentialsI,
      configuration: ProviderConfigurationI): AuthenticationRequest {

    if (this.authenticationRequest === null) {
      this.authenticationRequest = new NodeAuthenticationRequest(credentials, configuration)
    }

    return this.authenticationRequest
  }
}
