
export abstract class Crypto {
  public abstract async generateRandom(size: number): Promise<Buffer | Uint8Array>

  public abstract async sha265(data: string): Promise<Buffer | Uint8Array>

  public abstract base64Encode(data: Buffer | Uint8Array): string

  public base64EncodeUrlSave(data: Buffer | Uint8Array): string {
    const subs: any = { '=': '', '+': '-', '/': '_' }
    const encoded = this.base64Encode(data)

    return encoded.replace(/=|\+|\//g, s => subs[s])
  }

  public async generateUrlSaveRandomString(inputSize: number): Promise<string> {
    const random = await this.generateRandom(inputSize)
    return this.base64EncodeUrlSave(random)
  }

  /**
   * Derives the challenge from a given code
   * @see https://tools.ietf.org/html/rfc7636#section-4.2
   */
  public async deriveChallenge(code: string): Promise<string> {
    const shaBuff = await this.sha265(code)
    return this.base64EncodeUrlSave(shaBuff)
  }
}
