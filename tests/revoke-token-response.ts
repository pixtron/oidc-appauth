import { expect } from 'chai'
import 'mocha'

import { RequestResponseI } from '../src/requestor/requestor'
import { RevokeTokenResponse } from '../src/token/revoke-token-response'

describe('RevokeTokenResponse', () => {
  const successResponse: RequestResponseI = { status: 200, statusText: 'OK', headers: {} }
  const errorResponse: RequestResponseI = { data: { error: 'invalid_request' }, status: 400, statusText: 'BAD REQUEST', headers: {} }
  const retryResponse: RequestResponseI = { status: 503, statusText: 'SERVICE UNAVAILABLE', headers: {} }
  const invalidResponse: RequestResponseI = { status: 404, statusText: 'NOT FOUND', headers: {} }
  const invalidErrorResponse: RequestResponseI = { data: {}, status: 400, statusText: 'OK', headers: {} }

  describe('Successfull response', () => {
    it('set the correct type', () => {
      const response = new RevokeTokenResponse(successResponse)

      expect(response.getType()).to.equal(RevokeTokenResponse.RESPONSE_SUCCESS)
    })

    it('set the response to null', () => {
      const response = new RevokeTokenResponse(successResponse)

      expect(response.getResponse()).to.equal(null)
    })
  })

  describe('Retry later response', () => {
    it('set the correct type', () => {
      const response = new RevokeTokenResponse(retryResponse)

      expect(response.getType()).to.equal(RevokeTokenResponse.RESPONSE_RETRY)
    })

    it('set the response to an empty response', () => {
      const response = new RevokeTokenResponse(retryResponse)

      expect(response.getResponse()).to.eql({})
    })

    it('set retryAfter in the response if present in header', () => {
      const retryAfter: Number = 6000

      const testResponse = Object.assign({}, retryResponse)
      testResponse.headers = Object.assign({ 'retry-after': retryAfter }, testResponse.headers)

      const response = new RevokeTokenResponse(testResponse)

      expect(response.getResponse()).to.eql({ retryAfter })
    })
  })

  describe('Error response', () => {
    it('set the correct type', () => {
      const response = new RevokeTokenResponse(errorResponse)

      expect(response.getType()).to.equal(RevokeTokenResponse.RESPONSE_ERROR)
    })

    it('set the error in the response', () => {
      const expectedResponse = { error: 'invalid_request' }
      const response = new RevokeTokenResponse(errorResponse)

      expect(response.getResponse()).to.eql(expectedResponse)
    })

    it('set the error_description in the response', () => {
      const description = 'The request was malformed'
      const expectedResponse = { error: 'invalid_request', error_description: description }

      const testResponse = Object.assign({}, errorResponse)
      testResponse.data = Object.assign({ error_description: description }, testResponse.data)

      const response = new RevokeTokenResponse(testResponse)

      expect(response.getResponse()).to.eql(expectedResponse)
    })

    it('set the error_uri in the response', () => {
      const uri = 'https://example.org/errors/#invalidRequest'
      const expectedResponse = { error: 'invalid_request', error_uri: uri }

      const testResponse = Object.assign({}, errorResponse)
      testResponse.data = Object.assign({ error_uri: uri }, testResponse.data)

      const response = new RevokeTokenResponse(testResponse)

      expect(response.getResponse()).to.eql(expectedResponse)
    })
  })

  describe('Invalid response', () => {
    it('set the correct type', () => {
      const response = new RevokeTokenResponse(invalidResponse)

      expect(response.getType()).to.equal(RevokeTokenResponse.RESPONSE_INVALID)
    })

    it('set the error in the response to empty response', () => {
      const expectedResponse = { error: 'empty response', response: invalidResponse }
      const response = new RevokeTokenResponse(invalidResponse)

      expect(response.getResponse()).to.eql(expectedResponse)
    })

    it('set the error in the response to malformed response', () => {
      const expectedResponse = { error: 'malformed response or invalid status code', response: invalidErrorResponse }
      const response = new RevokeTokenResponse(invalidErrorResponse)

      expect(response.getResponse()).to.eql(expectedResponse)
    })
  })
})
