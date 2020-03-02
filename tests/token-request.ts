import { expect } from 'chai'
import * as sinon from 'sinon'
import 'mocha'

import { ClientCredentialsI } from '../src/client/client-credentials'
import { ProviderConfigurationI } from '../src/provider-configuration/provider-configuration'
import { TokenRequest } from '../src/token/token-request'
import { Requestor } from '../src/requestor/requestor'
import { TestRequestor } from './mocks/requestor'

describe('TokenRequest', () => {
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
      class TestTokenRequest extends TokenRequest {
        public getRequestor(): Requestor {
          return this.requestor
        }
      }

      const requestor = new TestRequestor()
      const request = new TestTokenRequest(credentials, configuration)
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
          grant_type: 'authorization_code'
        }
      }
    })

    it('should send the request with the given token', async () => {
      requestor.send.returns(new Promise(resolve => {
        setTimeout(() => {
          resolve(successResponse)
        }, 10)
      }))

      const code = 'zzzz'
      const request = new TokenRequest(credentials, configuration)
      request.setRequestor(requestor)
      request.performRequest({ code })

      expectedOptions.params.code = code

      const actualOptions = requestor.send.getCall(0).args[0]
      expect(actualOptions).to.eql(expectedOptions)
    })

    it('should set the code verfier', async () => {
      requestor.send.returns(new Promise(resolve => {
        setTimeout(() => {
          resolve(successResponse)
        }, 10)
      }))

      const code = 'zzzz'
      const codeVerifier = 'asdlkmksamd'
      const request = new TokenRequest(credentials, configuration)
      request.setRequestor(requestor)
      request.performRequest({ code, code_verifier: codeVerifier })

      expectedOptions.params.code = code
      expectedOptions.params.code_verifier = codeVerifier

      const actualOptions = requestor.send.getCall(0).args[0]
      expect(actualOptions).to.eql(expectedOptions)
    })

    afterEach(() => {
      sandbox.restore()
    })
  })
})
