import { expect } from 'chai'
import 'mocha'

import { NodeCrypto } from '../src/crypto/node-crypto'

describe('NodeCrypto', () => {
  const crypto = new NodeCrypto()

  describe('generateRandom', () => {
    it('should generate a buffer with random octets', async () => {
      const size = 32
      const buffer = await crypto.generateRandom(size)
      expect(buffer.length).to.equal(size)
    })
  })

  describe('sha265', () => {
    it('should return a buffer with the sha256 of a given string', async () => {
      const input = 'some random string'
      const expected = '4342e08d01f24ac451bc3bbff686408563b5c26d386d0c18879244f5e7974d7d'

      const buffer = await crypto.sha265(input)

      expect(buffer.toString('hex')).to.equal(expected)
    })
  })

  describe('base64Encode', () => {
    it('should base64 encode a given string', () => {
      const input = Buffer.from('some random string')
      const expected = 'c29tZSByYW5kb20gc3RyaW5n'

      const encoded = crypto.base64Encode(input)

      expect(encoded).to.equal(expected)
    })
  })
})
