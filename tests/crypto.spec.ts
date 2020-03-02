import { expect } from 'chai'
import 'mocha'

import { Crypto } from '../src/crypto/crypto'

describe('NodeCrypto', () => {
  const SHA256 = 'a82af4e96b5b8d825a6910b908eccdc4401af1e663db5edf2d7dfb712db96529'

  class TestCrypto extends Crypto {
    public async generateRandom(size: number): Promise<Buffer | Uint8Array> {
      return Promise.resolve(Buffer.from([3, 236, 255, 224, 193]))
    }

    public async sha265(data: string): Promise<Buffer | Uint8Array> {
      return Promise.resolve(Buffer.from(SHA256))
    }

    public base64Encode(data: Buffer | Uint8Array): string {
      return data.toString('base64')
    }
  }

  const crypto = new TestCrypto()

  describe('base64EncodeUrlSave', () => {
    it('should url savely base64 encode a given string', () => {
      const input = Buffer.from([3, 236, 255, 224, 193])
      const expected = 'A-z_4ME'

      const encoded = crypto.base64EncodeUrlSave(input)

      expect(encoded).to.equal(expected)
    })
  })

  describe('generateUrlSaveRandomString', () => {
    it('should generate a url save string of given input length', async () => {
      const expected = 'A-z_4ME'

      const random = await crypto.generateUrlSaveRandomString(5)
      expect(random).to.equal(expected)
    })
  })
})
