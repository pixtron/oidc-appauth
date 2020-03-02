import { expect } from 'chai'
import 'mocha'

import { DefaultUrlUtility } from '../src/url-utility/default-url-utility'

describe('DefaultUrlUtility', () => {
  const urlUtility = new DefaultUrlUtility()
  describe('parseUrl', () => {
    it('should parse an url', () => {
      const exampleUrl = 'https://example.org/?key1=value1&key2=value2#hash'
      const url = urlUtility.parseUrl(exampleUrl)

      expect(url.href).to.equal(exampleUrl)
      expect(url.protocol).to.equal('https:')
      expect(url.host).to.equal('example.org')
      expect(url.hash).to.equal('#hash')
      expect(url.searchParams.constructor.name).to.equal('URLSearchParams')
      expect(url.searchParams.toString()).to.equal('key1=value1&key2=value2')
    })

    it('should allow to parse hash as query string', () => {
      const exampleUrl = 'https://example.org/#key1=value1&key2=value2'
      const url = urlUtility.parseUrl(exampleUrl, true)

      expect(url.href).to.equal('https://example.org/?key1=value1&key2=value2')
      expect(url.hash).to.equal('')
      expect(url.searchParams.toString()).to.equal('key1=value1&key2=value2')
    })

    it('should remove the original query string when parsing hash as query string', () => {
      const exampleUrl = 'https://example.org/?realquery=shouldgo#key1=value1&key2=value2'
      const url = urlUtility.parseUrl(exampleUrl, true)

      expect(url.href).to.equal('https://example.org/?key1=value1&key2=value2')
      expect(url.searchParams.toString()).to.equal('key1=value1&key2=value2')
    })
  })

  describe('buildUrl', () => {
    it('should build an url', () => {
      const exampleUrl = 'https://example.org/pathname/'
      const url = urlUtility.buildUrl(exampleUrl)

      expect(url).to.equal(exampleUrl)
    })

    it('should add query params to the url', () => {
      const exampleUrl = 'https://example.org/pathname/'
      const params = { key1: 'value1', key2: 'value2' }
      const url = urlUtility.buildUrl(exampleUrl, params)

      expect(url).to.equal(`${exampleUrl}?key1=value1&key2=value2`)
    })

    it('should url encode the query string', () => {
      const exampleUrl = 'https://example.org/pathname/'
      const params = { key1: 'value1', key2: 'http://www.example.org' }
      const url = urlUtility.buildUrl(exampleUrl, params)

      expect(url).to.equal(`${exampleUrl}?key1=value1&key2=http%3A%2F%2Fwww.example.org`)
    })

    it('should sort the url parameters', () => {
      const exampleUrl = 'https://example.org/pathname/'
      const params = { b: 'valueb', a: 'valuea' }
      const url = urlUtility.buildUrl(exampleUrl, params)

      expect(url).to.equal(`${exampleUrl}?a=valuea&b=valueb`)
    })
  })
})
