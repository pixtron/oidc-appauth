
import { AuthenticationRequestI } from './authentication-request'
import { DefaultUrlUtility } from '../url-utility/default-url-utility'
import { UrlUtility } from '../url-utility/url-utility'

export interface AuthenticationSuccessResponseI {
  code: string
  state?: string
  code_verifier?: string
}

export interface AuthenticationErrorResponseI {
  error: string
  state?: string
  error_description?: string
  error_uri?: string
}

export interface AuthenticationInvalidResponseI {
  error: string,
  response: AuthenticationSuccessResponseI | AuthenticationErrorResponseI | null
}

export class AuthenticationResponse {
  static AUTHENTICATION_SUCCESS: string = 'success'
  static AUTHENTICATION_ERROR: string = 'error'
  static AUTHENTICATION_INVALID: string = 'invalid'

  protected urlUtility: UrlUtility = new DefaultUrlUtility()
  protected type: string
  protected response: AuthenticationSuccessResponseI | AuthenticationErrorResponseI | null
  protected validationError: string

  constructor(protected request: AuthenticationRequestI, protected responseUrl: string) {
    this.type = AuthenticationResponse.AUTHENTICATION_INVALID
    this.response = null
    this.validationError = 'failed to parse response'

    try {
      this.parseResponseUrl(responseUrl)
    } catch (err) {
      this.validationError = 'invalid url supplied'
    }
  }

  public getType(): string {
    return this.type
  }

  public getResponse(): AuthenticationSuccessResponseI | AuthenticationErrorResponseI | AuthenticationInvalidResponseI {

    switch (this.type) {
      case AuthenticationResponse.AUTHENTICATION_SUCCESS:
        return this.response! as AuthenticationSuccessResponseI
      case AuthenticationResponse.AUTHENTICATION_ERROR:
        return this.response! as AuthenticationErrorResponseI
    }

    return {
      error: this.validationError,
      response: this.response
    } as AuthenticationInvalidResponseI
  }

  protected parseResponseUrl(responseUrl: string): void {
    const url = this.urlUtility.parseUrl(responseUrl)

    if (url.searchParams.has('code')) {
      this.type = AuthenticationResponse.AUTHENTICATION_SUCCESS

      const response: AuthenticationSuccessResponseI = {
        code: url.searchParams.get('code')!
      }

      if (url.searchParams.has('state')) {
        response.state = url.searchParams.get('state')!
      }

      if (this.request.internal && this.request.internal.code_verifier) {
        response.code_verifier = this.request.internal.code_verifier
      }

      this.response = response
    } else if (url.searchParams.has('error')) {
      this.type = AuthenticationResponse.AUTHENTICATION_ERROR

      const response: AuthenticationErrorResponseI = {
        error: url.searchParams.get('error')!
      }

      if (url.searchParams.has('state')) {
        response.state = url.searchParams.get('state')!
      }

      if (url.searchParams.has('error_description')) {
        response.error_description = url.searchParams.get('error_description')!
      }

      if (url.searchParams.has('error_uri')) {
        response.error_uri = url.searchParams.get('error_uri')!
      }

      this.response = response
    } else {
      this.type = AuthenticationResponse.AUTHENTICATION_INVALID
      this.response = null
      this.validationError = 'neither code nor error present'
    }

    this.validateResponse()
  }

  protected validateResponse(): void {
    // return if response is already invalid
    if (this.type === AuthenticationResponse.AUTHENTICATION_INVALID) return

    let error: string | null = null

    switch (this.type) {
      case AuthenticationResponse.AUTHENTICATION_SUCCESS:
        error = this._validateSuccessResponse(this.response as AuthenticationSuccessResponseI)
        break
      case AuthenticationResponse.AUTHENTICATION_ERROR:
        error = this._validateErrorResponse(this.response as AuthenticationErrorResponseI)
        break
    }

    if (error !== null) {
      this.type = AuthenticationResponse.AUTHENTICATION_INVALID
      this.validationError = error
    }
  }

  protected _validateSuccessResponse(response: AuthenticationSuccessResponseI): string | null {
    if (this.request.state && !response.state) {
      return 'state is not set in response but was set in request'
    }

    if (!this.request.state && response.state) {
      return 'state was not set in request but is set in response'
    }

    if (this.request.state && response.state !== this.request.state) {
      return 'state in response and request does not match'
    }

    return null
  }

  protected _validateErrorResponse(response: AuthenticationErrorResponseI): string | null {
    if (this.request.state && !response.state) {
      return 'state is not set in response but was set in request'
    }

    if (!this.request.state && response.state) {
      return 'state was not set in request but is set in response'
    }

    if (this.request.state && response.state !== this.request.state) {
      return 'state in response and request does not match'
    }

    return null
  }

}
