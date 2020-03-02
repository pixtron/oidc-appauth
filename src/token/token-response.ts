
import { RequestResponseI } from '../requestor/requestor'

export interface TokenSuccessResponseI {
  access_token: string
  token_type: string
  id_token: string
  expires_in?: string
  refresh_token?: string
  scope?: string
}

export interface TokenErrorResponseI {
  error: string
  error_description?: string
  error_uri?: string
}

export interface TokenInvalidResponseI {
  error: string,
  response: RequestResponseI
}

export class TokenResponse {
  static HTTP_ERROR_RESPONSE: Number = 400
  static HTTP_SUCCESS_RESPONSE: Number = 200
  static RESPONSE_SUCCESS: string = 'success'
  static RESPONSE_ERROR: string = 'error'
  static RESPONSE_INVALID: string = 'invalid'

  protected type: string
  protected response: TokenSuccessResponseI | TokenErrorResponseI | null = null
  protected validationError: string = 'failed to parse response'

  constructor(protected incoming: RequestResponseI) {
    this.type = TokenResponse.RESPONSE_INVALID

    this.mapResponse(incoming)
  }

  public getType(): string {
    return this.type
  }

  public getResponse(): TokenSuccessResponseI | TokenErrorResponseI | TokenInvalidResponseI {
    if (this.type === TokenResponse.RESPONSE_INVALID) {
      return {
        error: this.validationError,
        response: this.incoming
      }
    }

    return this.response!
  }

  protected mapResponse(incoming: RequestResponseI): void {
    const dataIn = incoming.data

    if (!dataIn || typeof dataIn !== 'object') {
      this.type = TokenResponse.RESPONSE_INVALID
      this.response = null
      this.validationError = 'empty response'
    } else if (dataIn.access_token && incoming.status === TokenResponse.HTTP_SUCCESS_RESPONSE) {
      this.type = TokenResponse.RESPONSE_SUCCESS

      const response: TokenSuccessResponseI = {
        access_token: dataIn.access_token,
        token_type: dataIn.token_type,
        id_token: dataIn.id_token
      }

      if (dataIn.expires_in) response.expires_in = dataIn.expires_in
      if (dataIn.refresh_token) response.refresh_token = dataIn.refresh_token
      if (dataIn.scope) response.scope = dataIn.scope

      this.response = response
    } else if (dataIn.error && incoming.status === TokenResponse.HTTP_ERROR_RESPONSE) {
      this.type = TokenResponse.RESPONSE_ERROR

      const response: TokenErrorResponseI = {
        error: dataIn.error
      }

      if (dataIn.error_description) response.error_description = dataIn.error_description
      if (dataIn.error_uri) response.error_uri = dataIn.error_uri

      this.response = response
    } else {
      this.type = TokenResponse.RESPONSE_INVALID
      this.response = null
      this.validationError = 'malformed response or invalid status code'
    }

    this.validateResponse()
  }

  protected validateResponse(): void {
    // return if response is already invalid
    if (this.type === TokenResponse.RESPONSE_INVALID) return

    let error: string | null = null

    if (this.type === TokenResponse.RESPONSE_SUCCESS) {
      error = this._validateSuccessResponse(this.response as TokenSuccessResponseI)
    }

    if (error !== null) {
      this.response = null
      this.validationError = error
      this.type = TokenResponse.RESPONSE_INVALID
    }
  }

  _validateSuccessResponse(response: TokenSuccessResponseI): string | null {
    if (!response.access_token) {
      return 'access_token not present in response'
    }

    if (!response.token_type) {
      return 'token_type not present in response'
    }

    if (!response.id_token) {
      return 'id_token not present in response'
    }

    if (response.token_type !== 'Bearer') {
      return 'token_type is not of type Bearer'
    }

    return null
  }
}
