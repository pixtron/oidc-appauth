
import * as crypto from 'crypto'
import { Crypto } from './crypto'

export class NodeCrypto extends Crypto {
  public async generateRandom(size: number): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(size, (error, buffer) => {
        if (error) return reject(error)
        resolve(buffer)
      })
    })
  }

  public async sha265(data: string): Promise<Buffer> {
    return crypto.createHash('sha256').update(data, 'ascii').digest()
  }

  public base64Encode(data: Buffer): string {
    return data.toString('base64')
  }
}
