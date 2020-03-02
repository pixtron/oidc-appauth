import { expect } from 'chai'
import * as sinon from 'sinon'
import 'mocha'

import { ProviderConfigurationDiscoverer } from '../src/provider-configuration/provider-configuration-discoverer'
import { Requestor } from '../src/requestor/requestor'
import { TestRequestor } from './mocks/requestor'

describe('ProviderConfigurationDiscoverer', () => {
  const issuerUrl = 'https://accounts.example.org'
  const issuerCfg = {
    authorization_endpoint: `${issuerUrl}/authorize`,
    token_endpoint: `${issuerUrl}/token`,
    revocation_endpoint: `${issuerUrl}/revoke`
  }

  const successResponse = { data: issuerCfg, status: 200, statusText: 'OK', headers: {} }
  const errorResponse = { data: '', status: 404, statusText: 'NOT FOUND', headers: {} }

  const sandbox = sinon.createSandbox()
  let requestor: any

  beforeEach(() => {
    requestor = sinon.createStubInstance(TestRequestor)
  })

  it('should allow to set the requestor', async () => {
    class TestProviderConfigurationDiscoverer extends ProviderConfigurationDiscoverer {
      public getRequestor(): Requestor {
        return this.requestor
      }
    }

    const discoverer = new TestProviderConfigurationDiscoverer(issuerUrl)
    discoverer.setRequestor(requestor)

    expect(discoverer.getRequestor()).to.equal(requestor)
  })

  it('should get the configuration', async () => {
    requestor.send.returns(new Promise(resolve => {
      setTimeout(() => {
        resolve(successResponse)
      }, 10)
    }))

    const discoverer = new ProviderConfigurationDiscoverer(issuerUrl)
    discoverer.setRequestor(requestor)

    const configuration = await discoverer.getConfiguration()

    // tslint:disable-next-line:no-unused-expression
    expect(requestor.send.calledOnce).to.be.true
    expect(configuration).to.be.eql(issuerCfg)
  })

  it('should cache the configuration', async () => {
    requestor.send.returns(new Promise(resolve => {
      setTimeout(() => {
        resolve({ ...successResponse })
      }, 10)
    }))

    const discoverer = new ProviderConfigurationDiscoverer(issuerUrl)
    discoverer.setRequestor(requestor)

    const configuration = await discoverer.getConfiguration()
    const cachedConfiguration = await discoverer.getConfiguration()

    // tslint:disable-next-line:no-unused-expression
    expect(requestor.send.calledOnce).to.be.true
    expect(configuration).to.be.eql(issuerCfg)
    expect(configuration).to.be.equal(cachedConfiguration)
  })

  it('should throw an error when configuration can\'t be fetched', async () => {
    requestor.send.returns(new Promise(resolve => {
      setTimeout(() => {
        resolve(errorResponse)
      }, 10)
    }))

    const discoverer = new ProviderConfigurationDiscoverer(issuerUrl)
    discoverer.setRequestor(requestor)

    try {
      const configuration = await discoverer.getConfiguration()
    } catch (error) {
      expect(error.constructor.name).to.equal('AppauthHttpError')
      expect(error).to.have.property('message', 'Could not fetch configuration')
      expect(error).to.have.property('response', errorResponse)
    }

    // tslint:disable-next-line:no-unused-expression
    expect(requestor.send.calledOnce).to.be.true
  })

  afterEach(() => {
    sandbox.restore()
  })

})
