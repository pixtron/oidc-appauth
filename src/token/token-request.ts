
import { AxiosRequestor } from '../requestor/axios-requestor'
import { ClientCredentialsI } from '../client/client-credentials'
import { ProviderConfigurationI } from '../provider-configuration/provider-configuration'
import { Requestor, RequestSettingsI } from '../requestor/requestor'
import { TokenResponse } from './token-response'

export interface TokenRequestI {
  code: string,
  code_verifier?: string
}

export interface RefreshTokenRequestI {
  refresh_token: string
}

export type GrantTypeT = 'code' | 'refresh_token'

export interface BaseTokenRequestParmsI {
  client_id: string
  redirect_uri: string
  grant_type: GrantTypeT
}

export interface TokenRequestParamsI extends BaseTokenRequestParmsI {
  code: string
  code_verifier?: string
}

export interface RefreshTokenRequestParamsI extends BaseTokenRequestParmsI {
  refresh_token: string
}

export abstract class BaseTokenRequest {
  protected abstract grantType: GrantTypeT

  protected requestor: Requestor = new AxiosRequestor()

  constructor(
      protected credentials: ClientCredentialsI,
      protected configuration: ProviderConfigurationI) {}

  protected abstract getParams(request: TokenRequestI | RefreshTokenRequestI): TokenRequestParamsI | RefreshTokenRequestParamsI

  public setRequestor(requestor: Requestor) {
    this.requestor = requestor
  }

  public async performRequest(request: TokenRequestI | RefreshTokenRequestI): Promise<TokenResponse> {
    const options: RequestSettingsI = {
      method: 'POST',
      url: this.configuration.token_endpoint,
      params: this.getParams(request)
    }

    const response = await this.requestor.send(options)

    return new TokenResponse(response)
  }

}

export class TokenRequest extends BaseTokenRequest {
  protected grantType = 'authorization_code' as GrantTypeT

  protected getParams(request: TokenRequestI): TokenRequestParamsI {
    const params: TokenRequestParamsI = {
      client_id: this.credentials.client_id,
      redirect_uri: this.credentials.redirect_uri,
      grant_type: this.grantType,
      code: request.code
    }

    if (request.code_verifier) params.code_verifier = request.code_verifier

    return params
  }

  public async performRequest(request: TokenRequestI): Promise<TokenResponse> {
    return super.performRequest(request)
  }
}

export class RefreshTokenRequest extends BaseTokenRequest {
  protected grantType = 'refresh_token' as GrantTypeT

  protected getParams(request: RefreshTokenRequestI): RefreshTokenRequestParamsI {
    const params: RefreshTokenRequestParamsI = {
      client_id: this.credentials.client_id,
      redirect_uri: this.credentials.redirect_uri,
      grant_type: this.grantType,
      refresh_token: request.refresh_token
    }

    return params
  }

  public async performRequest(request: RefreshTokenRequestI): Promise<TokenResponse> {
    return super.performRequest(request)
  }
}
