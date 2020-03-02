/**
 * Token revocation as specified in https://tools.ietf.org/html/rfc7009#section-2
 */

import { AxiosRequestor } from '../requestor/axios-requestor'
import { ClientCredentialsI } from '../client/client-credentials'
import { ProviderConfigurationI } from '../provider-configuration/provider-configuration'
import { Requestor, RequestSettingsI } from '../requestor/requestor'
import { RevokeTokenResponse } from './revoke-token-response'

export type TokenTypeT = 'access_token' | 'refresh_token'

export interface RevokeTokenRequestI {
  token: string
  token_type_hint?: TokenTypeT
}

export interface RevokeTokenRequestParamsI {
  client_id: string
  redirect_uri: string
  token: string,
  token_type_hint?: string
}

export class RevokeTokenRequest {
  protected requestor: Requestor = new AxiosRequestor()

  constructor(
      protected credentials: ClientCredentialsI,
      protected configuration: ProviderConfigurationI) {}

  public setRequestor(requestor: Requestor) {
    this.requestor = requestor
  }

  public async performRequest(request: RevokeTokenRequestI): Promise<RevokeTokenResponse> {
    const params: RevokeTokenRequestParamsI = {
      token: request.token,
      client_id: this.credentials.client_id,
      redirect_uri: this.credentials.redirect_uri
    }

    if (request.token_type_hint) params.token_type_hint = request.token_type_hint

    const options: RequestSettingsI = {
      method: 'POST',
      url: this.configuration.revocation_endpoint,
      params: params
    }

    const response = await this.requestor.send(options)

    return new RevokeTokenResponse(response)
  }
}
