import { expect } from 'chai'
import 'mocha'

import { AuthenticationResponse } from '../src/authentication/authentication-response'
import { AuthenticationRequestI } from '../src/authentication/authentication-request'

describe('AuthenticationResponse', () => {

  describe('Successfull response', () => {
    it('should parse the response url', () => {
      const responseUrl = 'http://localhost:8001/redirect?code=xxx'

      const request: AuthenticationRequestI = {
        scope: 'openid',
        usePkce: false
      }

      const expectedResponse = { code: 'xxx' }

      const response = new AuthenticationResponse(request, responseUrl)

      expect(response.getType()).to.equal(AuthenticationResponse.AUTHENTICATION_SUCCESS)
      expect(response.getResponse()).to.eql(expectedResponse)
    })

    it('should include same state in response as set in request', () => {
      const responseUrl = 'http://localhost:8001/redirect?code=xxx&state=yyy'

      const request: AuthenticationRequestI = {
        scope: 'openid',
        state: 'yyy',
        usePkce: false
      }

      const expectedResponse = { code: 'xxx', state: 'yyy' }

      const response = new AuthenticationResponse(request, responseUrl)

      expect(response.getType()).to.equal(AuthenticationResponse.AUTHENTICATION_SUCCESS)
      expect(response.getResponse()).to.eql(expectedResponse)
    })

    it('should ignore any unrecognized parameters', () => {
      const responseUrl = 'http://localhost:8001/redirect?code=xxx&unrecognized=yyy'

      const request: AuthenticationRequestI = {
        scope: 'openid',
        usePkce: false
      }

      const expectedResponse = { code: 'xxx' }

      const response = new AuthenticationResponse(request, responseUrl)

      expect(response.getType()).to.equal(AuthenticationResponse.AUTHENTICATION_SUCCESS)
      expect(response.getResponse()).to.eql(expectedResponse)
    })

    it('should return a failed response if state in response is missing', () => {
      const responseUrl = 'http://localhost:8001/redirect?code=xxx'
      const request: AuthenticationRequestI = {
        scope: 'openid',
        state: 'someState',
        usePkce: false
      }

      const expectedResponse = {
        error: 'state is not set in response but was set in request',
        response: { code: 'xxx' }
      }

      const response = new AuthenticationResponse(request, responseUrl)

      expect(response.getType()).to.equal(AuthenticationResponse.AUTHENTICATION_INVALID)
      expect(response.getResponse()).to.eql(expectedResponse)
    })

    it('should return a failed response if state in response is set but missing in request', () => {
      const responseUrl = 'http://localhost:8001/redirect?code=xxx&state=yyy'
      const request: AuthenticationRequestI = {
        scope: 'openid',
        usePkce: false
      }

      const expectedResponse = {
        error: 'state was not set in request but is set in response',
        response: { code: 'xxx', state: 'yyy' }
      }

      const response = new AuthenticationResponse(request, responseUrl)

      expect(response.getType()).to.equal(AuthenticationResponse.AUTHENTICATION_INVALID)
      expect(response.getResponse()).to.eql(expectedResponse)
    })

    it('should return a failed response if state in response does not match', () => {
      const responseUrl = 'http://localhost:8001/redirect?code=xxx&state=yyy'
      const request: AuthenticationRequestI = {
        scope: 'openid',
        state: 'someState',
        usePkce: false
      }

      const expectedResponse = {
        error: 'state in response and request does not match',
        response: { code: 'xxx', state: 'yyy' }
      }

      const response = new AuthenticationResponse(request, responseUrl)

      expect(response.getType()).to.equal(AuthenticationResponse.AUTHENTICATION_INVALID)
      expect(response.getResponse()).to.eql(expectedResponse)
    })
  })

  describe('Error response', () => {
    it('should parse the response url', () => {
      const responseUrl = 'http://localhost:8001/redirect?error=invalid_client'

      const request: AuthenticationRequestI = {
        scope: 'openid',
        usePkce: false
      }

      const expectedResponse = { error: 'invalid_client' }

      const response = new AuthenticationResponse(request, responseUrl)

      expect(response.getType()).to.equal(AuthenticationResponse.AUTHENTICATION_ERROR)
      expect(response.getResponse()).to.eql(expectedResponse)
    })

    it('should include error_description if present in response', () => {
      const responseUrl = 'http://localhost:8001/redirect?error=invalid_client&error_description=description'

      const request: AuthenticationRequestI = {
        scope: 'openid',
        usePkce: false
      }

      const expectedResponse = { error: 'invalid_client', error_description: 'description' }

      const response = new AuthenticationResponse(request, responseUrl)

      expect(response.getType()).to.equal(AuthenticationResponse.AUTHENTICATION_ERROR)
      expect(response.getResponse()).to.eql(expectedResponse)
    })

    it('should include error_uri if present in response', () => {
      const responseUrl = 'http://localhost:8001/redirect?error=invalid_client&error_uri=https%3A%2F%2Fexample.org%2Ferror'

      const request: AuthenticationRequestI = {
        scope: 'openid',
        usePkce: false
      }

      const expectedResponse = { error: 'invalid_client', error_uri: 'https://example.org/error' }

      const response = new AuthenticationResponse(request, responseUrl)

      expect(response.getType()).to.equal(AuthenticationResponse.AUTHENTICATION_ERROR)
      expect(response.getResponse()).to.eql(expectedResponse)
    })

    it('should include same state in response as set in request', () => {
      const responseUrl = 'http://localhost:8001/redirect?error=invalid_client&state=yyy'

      const request: AuthenticationRequestI = {
        scope: 'openid',
        state: 'yyy',
        usePkce: false
      }

      const expectedResponse = { error: 'invalid_client', state: 'yyy' }

      const response = new AuthenticationResponse(request, responseUrl)

      expect(response.getType()).to.equal(AuthenticationResponse.AUTHENTICATION_ERROR)
      expect(response.getResponse()).to.eql(expectedResponse)
    })

    it('should ignore any unrecognized parameters', () => {
      const responseUrl = 'http://localhost:8001/redirect?error=invalid_client&unrecognized=yyy'

      const request: AuthenticationRequestI = {
        scope: 'openid',
        usePkce: false
      }

      const expectedResponse = { error: 'invalid_client' }

      const response = new AuthenticationResponse(request, responseUrl)

      expect(response.getType()).to.equal(AuthenticationResponse.AUTHENTICATION_ERROR)
      expect(response.getResponse()).to.eql(expectedResponse)
    })

    it('should return a failed response if state in response is missing', () => {
      const responseUrl = 'http://localhost:8001/redirect?error=invalid_client'

      const request: AuthenticationRequestI = {
        scope: 'openid',
        state: 'yyy',
        usePkce: false
      }

      const expectedResponse = {
        error: 'state is not set in response but was set in request',
        response: { error: 'invalid_client' }
      }

      const response = new AuthenticationResponse(request, responseUrl)

      expect(response.getType()).to.equal(AuthenticationResponse.AUTHENTICATION_INVALID)
      expect(response.getResponse()).to.eql(expectedResponse)
    })

    it('should return a failed response if state in response is set but missing in request', () => {
      const responseUrl = 'http://localhost:8001/redirect?error=invalid_client&state=yyy'

      const request: AuthenticationRequestI = {
        scope: 'openid',
        usePkce: false
      }

      const expectedResponse = {
        error: 'state was not set in request but is set in response',
        response: { error: 'invalid_client', state: 'yyy' }
      }

      const response = new AuthenticationResponse(request, responseUrl)

      expect(response.getType()).to.equal(AuthenticationResponse.AUTHENTICATION_INVALID)
      expect(response.getResponse()).to.eql(expectedResponse)
    })

    it('should return a failed response if state in response does not match', () => {
      const responseUrl = 'http://localhost:8001/redirect?error=invalid_client&state=yyy'

      const request: AuthenticationRequestI = {
        scope: 'openid',
        state: 'zzz',
        usePkce: false
      }

      const expectedResponse = {
        error: 'state in response and request does not match',
        response: { error: 'invalid_client', state: 'yyy' }
      }

      const response = new AuthenticationResponse(request, responseUrl)

      expect(response.getType()).to.equal(AuthenticationResponse.AUTHENTICATION_INVALID)
      expect(response.getResponse()).to.eql(expectedResponse)
    })
  })

  describe('Failure response', () => {
    it('should return a failed response if passed an invalid response url', () => {
      const responseUrl = 'invalid'

      const request: AuthenticationRequestI = {
        scope: 'openid',
        usePkce: false
      }

      const expectedResponse = {
        error: 'invalid url supplied',
        response: null
      }

      const response = new AuthenticationResponse(request, responseUrl)

      expect(response.getType()).to.equal(AuthenticationResponse.AUTHENTICATION_INVALID)
      expect(response.getResponse()).to.eql(expectedResponse)
    })

    it('should return a failed response if neither code nor error are set', () => {
      const responseUrl = 'http://localhost:8001/redirect?unrecognized=yyy'

      const request: AuthenticationRequestI = {
        scope: 'openid',
        usePkce: false
      }

      const expectedResponse = {
        error: 'neither code nor error present',
        response: null
      }

      const response = new AuthenticationResponse(request, responseUrl)

      expect(response.getType()).to.equal(AuthenticationResponse.AUTHENTICATION_INVALID)
      expect(response.getResponse()).to.eql(expectedResponse)
    })
  })
})
