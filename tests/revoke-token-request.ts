import { expect } from 'chai'
import * as sinon from 'sinon'
import 'mocha'

import { ClientCredentialsI } from '../src/client/client-credentials'
import { ProviderConfigurationI } from '../src/provider-configuration/provider-configuration'
import { RevokeTokenRequest } from '../src/token/revoke-token-request'
import { Requestor } from '../src/requestor/requestor'
import { TestRequestor } from './mocks/requestor'

describe('RevokeTokenRequest', () => {
  const revocationEndpoint = 'https://example.org/revoke'
  const clientId = 'xxx'
  const redirectUri = 'https://example.com/redirect'

  const credentials: ClientCredentialsI = {
    client_id: clientId,
    redirect_uri: redirectUri
  }

  const configuration: ProviderConfigurationI = {
    authorization_endpoint: 'https://example.org/authorize',
    token_endpoint: 'https://example.org/tokens',
    revocation_endpoint: revocationEndpoint
  }

  describe('setRequestor', () => {
    it('should set the requestor', async () => {
      class TestRevokeTokenRequest extends RevokeTokenRequest {
        public getRequestor(): Requestor {
          return this.requestor
        }
      }

      const requestor = new TestRequestor()
      const request = new TestRevokeTokenRequest(credentials, configuration)
      request.setRequestor(requestor)

      expect(request.getRequestor()).to.equal(requestor)
    })
  })

  describe('performRequest', () => {
    const sandbox = sinon.createSandbox()

    let requestor: any
    let expectedOptions: any

    const successResponse = { status: 200, statusText: 'OK', headers: {} }

    beforeEach(() => {
      requestor = sinon.createStubInstance(TestRequestor)

      expectedOptions = {
        method: 'POST',
        url: revocationEndpoint,
        params: {
          client_id: clientId,
          redirect_uri: redirectUri
        }
      }
    })

    it('should send the request with the given token', async () => {
      requestor.send.returns(new Promise(resolve => {
        setTimeout(() => {
          resolve(successResponse)
        }, 10)
      }))

      const token = 'zzzz'
      const request = new RevokeTokenRequest(credentials, configuration)
      request.setRequestor(requestor)
      request.performRequest({ token })

      expectedOptions.params.token = token

      const actualOptions = requestor.send.getCall(0).args[0]
      expect(actualOptions).to.eql(expectedOptions)
    })

    it('should set the token type hint', async () => {
      requestor.send.returns(new Promise(resolve => {
        setTimeout(() => {
          resolve(successResponse)
        }, 10)
      }))

      const token = 'zzzz'
      const tokenTypeHint = 'access_token'
      const request = new RevokeTokenRequest(credentials, configuration)
      request.setRequestor(requestor)
      request.performRequest({ token, token_type_hint: tokenTypeHint })

      expectedOptions.params.token = token
      expectedOptions.params.token_type_hint = tokenTypeHint

      const actualOptions = requestor.send.getCall(0).args[0]
      expect(actualOptions).to.eql(expectedOptions)
    })

    afterEach(() => {
      sandbox.restore()
    })
  })
})
