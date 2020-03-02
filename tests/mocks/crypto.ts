import { Crypto } from '../../src/crypto/crypto'

const SHA256 = 'a82af4e96b5b8d825a6910b908eccdc4401af1e663db5edf2d7dfb712db96529'

export class TestCrypto extends Crypto {
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
