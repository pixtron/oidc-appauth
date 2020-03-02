import { expect } from 'chai'
import * as sinon from 'sinon'
import 'mocha'

import { ClientCredentialsI } from '../src/client/client-credentials'
import { ProviderConfigurationI } from '../src/provider-configuration/provider-configuration'
import { RefreshTokenRequest } from '../src/token/token-request'
import { Requestor } from '../src/requestor/requestor'
import { TestRequestor } from './mocks/requestor'

describe('RefreshTokenRequest', () => {
  const tokenEndpoint = 'https://example.org/tokens'
  const clientId = 'xxx'
  const redirectUri = 'https://example.com/redirect'

  const credentials: ClientCredentialsI = {
    client_id: clientId,
    redirect_uri: redirectUri
  }

  const configuration: ProviderConfigurationI = {
    authorization_endpoint: 'https://example.org/authorize',
    token_endpoint: tokenEndpoint,
    revocation_endpoint: 'https://example.org/revoke'
  }

  describe('setRequestor', () => {
    it('should set the requestor', async () => {
      class TestRefreshTokenRequest extends RefreshTokenRequest {
        public getRequestor(): Requestor {
          return this.requestor
        }
      }

      const requestor = new TestRequestor()
      const request = new TestRefreshTokenRequest(credentials, configuration)
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
        url: tokenEndpoint,
        params: {
          client_id: clientId,
          redirect_uri: redirectUri,
          grant_type: 'refresh_token'
        }
      }
    })

    it('should send the request with the given token', async () => {
      requestor.send.returns(new Promise(resolve => {
        setTimeout(() => {
          resolve(successResponse)
        }, 10)
      }))

      const refreshToken = 'zzzz'
      const request = new RefreshTokenRequest(credentials, configuration)
      request.setRequestor(requestor)
      request.performRequest({ refresh_token: refreshToken })

      expectedOptions.params.refresh_token = refreshToken

      const actualOptions = requestor.send.getCall(0).args[0]
      expect(actualOptions).to.eql(expectedOptions)
    })

    afterEach(() => {
      sandbox.restore()
    })
  })
})
