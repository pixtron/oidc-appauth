import { expect } from 'chai'
import 'mocha'

import { AuthenticationRequest, AuthenticationRequestI } from '../src/authentication/authentication-request'
import { AuthenticationResponse } from '../src/authentication/authentication-response'
import { AuthenticationResponseListener } from '../src/authentication/authentication-response-listener'
import { ClientCredentialsI } from '../src/client/client-credentials'
import { Crypto } from '../src/crypto/crypto'
import { DefaultUrlUtility } from '../src/url-utility/default-url-utility'
import { ProviderConfigurationI } from '../src/provider-configuration/provider-configuration'
import { TestCrypto } from './mocks/crypto'
import { UrlUtility } from '../src/url-utility/url-utility'

describe('AuthenticationRequest', () => {
  class TestAuthenticationResponseListener extends AuthenticationResponseListener {
    protected urlUtility: UrlUtility = new DefaultUrlUtility()

    public async start(): Promise<void> { return Promise.resolve() }

    public async stop(): Promise<void> { return Promise.resolve() }
  }

  class TestAuthenticationRequest extends AuthenticationRequest {
    protected crypto: Crypto = new TestCrypto()
    protected urlUtility: UrlUtility = new DefaultUrlUtility()
    protected listener: AuthenticationResponseListener

    constructor(
        protected credentials: ClientCredentialsI,
        protected configuration: ProviderConfigurationI) {

      super(credentials, configuration)

      this.listener = new TestAuthenticationResponseListener(this.credentials.redirect_uri)
    }

    public performRequest(request: AuthenticationRequestI): Promise<AuthenticationResponse> {
      this.request = request
      return Promise.resolve(new AuthenticationResponse(request, 'https://example.com/redirect'))
    }
  }

  const credentials: ClientCredentialsI = {
    client_id: 'xxx',
    redirect_uri: 'https://example.com/redirect'
  }

  const requestSettings: AuthenticationRequestI = {
    scope: 'openid',
    state: 'someState',
    usePkce: false
  }

  const configuration: ProviderConfigurationI = {
    authorization_endpoint: 'https://example.org/authorize',
    token_endpoint: 'https://example.org/tokens',
    revocation_endpoint: 'https://example.org/revoke'
  }

  describe('setCrypto', () => {
    it('should set the supplied crypto', async () => {
      class TestCryptoAuthenticationRequest extends TestAuthenticationRequest {
        public getCrypto(): Crypto {
          return this.crypto
        }
      }

      const request = new TestCryptoAuthenticationRequest(credentials, configuration)
      const testCrypto = new TestCrypto()

      request.setCrypto(testCrypto)

      expect(request.getCrypto()).to.equal(testCrypto)
    })
  })

  describe('setUrlUtility', () => {
    it('should set the supplied urlUtility', async () => {
      class TestUrlUtilityAuthenticationRequest extends TestAuthenticationRequest {
        public getUrlUtility(): UrlUtility {
          return this.urlUtility
        }
      }

      const request = new TestUrlUtilityAuthenticationRequest(credentials, configuration)
      const testUrlUtility = new DefaultUrlUtility()

      request.setUrlUtility(testUrlUtility)

      expect(request.getUrlUtility()).to.equal(testUrlUtility)
    })
  })

  describe('generatePkce', () => {
    it('should return verifier and code_challenge', async () => {
      class TestPkceAuthenticationRequest extends TestAuthenticationRequest {
        // overriding protected method to test the method
        public async generatePkce(): Promise<{verifier: string, challenge: string}> {
          return super.generatePkce()
        }
      }

      const request = new TestPkceAuthenticationRequest(credentials, configuration)

      const result = await request.generatePkce()

      expect(result.challenge).to.equal('YTgyYWY0ZTk2YjViOGQ4MjVhNjkxMGI5MDhlY2NkYzQ0MDFhZjFlNjYzZGI1ZWRmMmQ3ZGZiNzEyZGI5NjUyOQ')
      expect(result.verifier).to.equal('A-z_4ME')
    })
  })

  describe('getRequest', () => {
    it('should return the request settings', async () => {
      const request = new TestAuthenticationRequest(credentials, configuration)

      await request.performRequest(requestSettings)
      const requestSettingsFromRequest = request.getRequest() as AuthenticationRequestI

      expect(requestSettingsFromRequest).to.equal(requestSettings)
    })
  })

  describe('getRequestUrl', () => {
    class TestGetRequestUrlAuthenticationRequest extends TestAuthenticationRequest {
      // overriding protected method to test the method
      public async getRequestUrl(): Promise<string> {
        return super.getRequestUrl()
      }
    }

    function createRequest(
        credentials: ClientCredentialsI,
        configuration: ProviderConfigurationI) {

      return new TestGetRequestUrlAuthenticationRequest(credentials, configuration)
    }

    it('should build the request url based on credentials and provider configuration', async () => {
      const request = createRequest(credentials, configuration)
      await request.performRequest(requestSettings)

      const url = await request.getRequestUrl()
      expect(url).to.equal('https://example.org/authorize?client_id=xxx&redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&response_type=code&scope=openid&state=someState')
    })

    it('should append extra query string parameters', async () => {
      const testRequestSettings = Object.assign({}, requestSettings)
      testRequestSettings.extras = { 'prompt': 'consent', 'access_type': 'offline' }

      const request = createRequest(credentials, configuration)
      await request.performRequest(testRequestSettings)
      const url = await request.getRequestUrl()
      expect(url).to.equal('https://example.org/authorize?access_type=offline&client_id=xxx&prompt=consent&redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&response_type=code&scope=openid&state=someState')
    })

    it('should generate a state param when none is supplied', async () => {
      const testRequestSettings = Object.assign({}, requestSettings)
      delete testRequestSettings.state
      const expectedRequestSettings = Object.assign({ state: 'A-z_4ME' }, testRequestSettings)

      const request = createRequest(credentials, configuration)
      await request.performRequest(testRequestSettings)
      const requestSettingsFromRequest = request.getRequest() as AuthenticationRequestI
      const url = await request.getRequestUrl()

      expect(requestSettingsFromRequest).to.eql(expectedRequestSettings)
      expect(url).to.equal('https://example.org/authorize?client_id=xxx&redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&response_type=code&scope=openid&state=A-z_4ME')
    })

    it('should add the code_challenge and code_challenge_method to the query string when using pkce', async () => {
      const testRequestSettings = Object.assign({}, requestSettings)
      testRequestSettings.usePkce = true

      const request = createRequest(credentials, configuration)
      await request.performRequest(testRequestSettings)
      const url = await request.getRequestUrl()
      expect(url).to.equal('https://example.org/authorize?client_id=xxx&code_challenge=YTgyYWY0ZTk2YjViOGQ4MjVhNjkxMGI5MDhlY2NkYzQ0MDFhZjFlNjYzZGI1ZWRmMmQ3ZGZiNzEyZGI5NjUyOQ&code_challenge_method=S256&redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&response_type=code&scope=openid&state=someState')
    })

    it('should store the code_verifier in the request', async () => {
      const testRequestSettings = Object.assign({}, requestSettings)
      testRequestSettings.usePkce = true

      const request = createRequest(credentials, configuration)
      await request.performRequest(testRequestSettings)
      await request.getRequestUrl()
      const credentialsFromRequest = request.getRequest() as AuthenticationRequestI

      expect(credentialsFromRequest).to.have.property('internal')
      expect(credentialsFromRequest.internal!.code_verifier).to.equal('A-z_4ME')
    })
  })
})
