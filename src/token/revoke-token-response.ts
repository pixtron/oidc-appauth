
import { RequestResponseI } from '../requestor/requestor'

export interface RevokeTokenErrorResponseI {
  error: string
  error_description?: string
  error_uri?: string
}

export type retryAfterT = string | Number | undefined

export interface RevokeTokenRetryResponseI {
  retryAfter?: retryAfterT
}

export interface RevokeTokenInvalidResponseI {
  error: string,
  response: RequestResponseI
}

export class RevokeTokenResponse {
  static HTTP_ERROR_RESPONSE: Number = 400
  static HTTP_SUCCESS_RESPONSE: Number = 200
  static HTTP_RETRY_RESPONSE: Number = 503
  static RESPONSE_SUCCESS: string = 'success'
  static RESPONSE_ERROR: string = 'error'
  static RESPONSE_RETRY: string = 'retry'
  static RESPONSE_INVALID: string = 'invalid'

  protected type: string
  protected response: RevokeTokenErrorResponseI | RevokeTokenRetryResponseI | null = null
  protected validationError: string = 'failed to parse response'

  constructor(protected incoming: RequestResponseI) {
    this.type = RevokeTokenResponse.RESPONSE_INVALID

    this.mapResponse(incoming)
  }

  public getType(): string {
    return this.type
  }

  public getResponse(): RevokeTokenErrorResponseI | RevokeTokenInvalidResponseI | RevokeTokenRetryResponseI | null {
    if (this.type === RevokeTokenResponse.RESPONSE_INVALID) {
      return {
        error: this.validationError,
        response: this.incoming
      }
    }

    return this.response
  }

  protected mapResponse(incoming: RequestResponseI): void {
    const dataIn = incoming.data

    if (incoming.status === RevokeTokenResponse.HTTP_SUCCESS_RESPONSE) {
      this.type = RevokeTokenResponse.RESPONSE_SUCCESS
      this.response = null
    } else if (incoming.status === RevokeTokenResponse.HTTP_RETRY_RESPONSE) {
      this.type = RevokeTokenResponse.RESPONSE_RETRY

      const response: RevokeTokenRetryResponseI = {}

      if (incoming.headers && incoming.headers['retry-after']) {
        response.retryAfter = incoming.headers['retry-after'] as retryAfterT
      }

      this.response = response
    } else if (!dataIn || typeof dataIn !== 'object') {
      this.type = RevokeTokenResponse.RESPONSE_INVALID
      this.response = null
      this.validationError = 'empty response'
    } else if (dataIn.error && incoming.status === RevokeTokenResponse.HTTP_ERROR_RESPONSE) {
      this.type = RevokeTokenResponse.RESPONSE_ERROR

      const response: RevokeTokenErrorResponseI = {
        error: dataIn.error
      }

      if (dataIn.error_description) response.error_description = dataIn.error_description
      if (dataIn.error_uri) response.error_uri = dataIn.error_uri

      this.response = response
    } else {
      this.type = RevokeTokenResponse.RESPONSE_INVALID
      this.response = null
      this.validationError = 'malformed response or invalid status code'
    }
  }
}
