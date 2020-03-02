import { expect } from 'chai'
import 'mocha'

import { RequestResponseI } from '../src/requestor/requestor'
import { TokenResponse } from '../src/token/token-response'

describe('TokenResponse', () => {
  /*export interface TokenSuccessResponseI {
    access_token: string
    token_type: string
    id_token: string
    expires_in?: string
    refresh_token?: string
    scope?: string
  }*/

  let successResponse: RequestResponseI
  let errorResponse: RequestResponseI
  let invalidResponse: RequestResponseI

  const accessToken = 'xxxx'
  const tokenType = 'Bearer'
  const idToken = 'yyyy'
  const refreshToken = 'zzzz'

  beforeEach(() => {

    successResponse = { data: {
      access_token: accessToken,
      token_type: tokenType,
      id_token: idToken
    }, status: 200, statusText: 'OK', headers: {} }

    errorResponse = { data: { error: 'invalid_request' }, status: 400, statusText: 'BAD REQUEST', headers: {} }
    invalidResponse = { status: 404, statusText: 'NOT FOUND', headers: {} }
  })

  describe('Successfull response', () => {
    it('set the correct type', () => {
      const response = new TokenResponse(successResponse)

      expect(response.getType()).to.equal(TokenResponse.RESPONSE_SUCCESS)
    })

    it('set the correct response', () => {
      const expectedResponse = {
        access_token: accessToken,
        token_type: tokenType,
        id_token: idToken
      }

      const response = new TokenResponse(successResponse)

      expect(response.getResponse()).to.eql(expectedResponse)
    })

    it('set refresh_token if present correct response', () => {
      const expectedResponse = {
        access_token: accessToken,
        token_type: tokenType,
        id_token: idToken,
        refresh_token: refreshToken
      }

      successResponse.data.refresh_token = refreshToken

      const response = new TokenResponse(successResponse)

      expect(response.getResponse()).to.eql(expectedResponse)
    })

    it('set expires_in if present correct response', () => {
      const expiresIn = 3600
      const expectedResponse = {
        access_token: accessToken,
        token_type: tokenType,
        id_token: idToken,
        expires_in: expiresIn
      }

      successResponse.data.expires_in = expiresIn

      const response = new TokenResponse(successResponse)

      expect(response.getResponse()).to.eql(expectedResponse)
    })

    it('set scope if present correct response', () => {
      const scope = 'openid, profile'
      const expectedResponse = {
        access_token: accessToken,
        token_type: tokenType,
        id_token: idToken,
        scope: scope
      }

      successResponse.data.scope = scope

      const response = new TokenResponse(successResponse)

      expect(response.getResponse()).to.eql(expectedResponse)
    })

    it('should fail if id_token is missing', () => {
      delete successResponse.data.id_token

      const expectedResponse = { error: 'id_token not present in response', response: successResponse }

      const response = new TokenResponse(successResponse)

      expect(response.getType()).to.eql(TokenResponse.RESPONSE_INVALID)
      expect(response.getResponse()).to.eql(expectedResponse)
    })

    it('should fail if token_type is missing', () => {
      delete successResponse.data.token_type

      const expectedResponse = { error: 'token_type not present in response', response: successResponse }

      const response = new TokenResponse(successResponse)

      expect(response.getType()).to.eql(TokenResponse.RESPONSE_INVALID)
      expect(response.getResponse()).to.eql(expectedResponse)
    })

    it('should fail if token_type is not Bearer', () => {
      successResponse.data.token_type = 'jwt'

      const expectedResponse = { error: 'token_type is not of type Bearer', response: successResponse }

      const response = new TokenResponse(successResponse)

      expect(response.getType()).to.eql(TokenResponse.RESPONSE_INVALID)
      expect(response.getResponse()).to.eql(expectedResponse)
    })

    it('should fail if access_token is not present', () => {
      delete successResponse.data.access_token

      const expectedResponse = { error: 'malformed response or invalid status code', response: successResponse }

      const response = new TokenResponse(successResponse)

      expect(response.getType()).to.eql(TokenResponse.RESPONSE_INVALID)
      expect(response.getResponse()).to.eql(expectedResponse)
    })
  })

  describe('Error response', () => {
    it('set the correct type', () => {
      const response = new TokenResponse(errorResponse)

      expect(response.getType()).to.equal(TokenResponse.RESPONSE_ERROR)
    })

    it('set the error in the response', () => {
      const expectedResponse = { error: 'invalid_request' }
      const response = new TokenResponse(errorResponse)

      expect(response.getResponse()).to.eql(expectedResponse)
    })

    it('set the error_description in the response', () => {
      const description = 'The request was malformed'
      const expectedResponse = { error: 'invalid_request', error_description: description }

      errorResponse.data.error_description = description
      const response = new TokenResponse(errorResponse)

      expect(response.getResponse()).to.eql(expectedResponse)
    })

    it('set the error_uri in the response', () => {
      const uri = 'https://example.org/errors/#invalidRequest'
      const expectedResponse = { error: 'invalid_request', error_uri: uri }

      errorResponse.data.error_uri = uri
      const response = new TokenResponse(errorResponse)

      expect(response.getResponse()).to.eql(expectedResponse)
    })

    it('should fail if error is not present', () => {
      delete errorResponse.data.error

      const expectedResponse = { error: 'malformed response or invalid status code', response: errorResponse }
      const response = new TokenResponse(errorResponse)

      expect(response.getResponse()).to.eql(expectedResponse)
    })
  })

  describe('Invalid response', () => {
    it('set the correct type', () => {
      const response = new TokenResponse(invalidResponse)

      expect(response.getType()).to.equal(TokenResponse.RESPONSE_INVALID)
    })

    it('set the error in the response to empty response', () => {
      const expectedResponse = { error: 'empty response', response: invalidResponse }
      const response = new TokenResponse(invalidResponse)

      expect(response.getResponse()).to.eql(expectedResponse)
    })
  })
})
