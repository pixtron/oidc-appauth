
import { DefaultUrlUtility } from '../url-utility/default-url-utility'
// using eventemitter3 over node's events for browser compatibility
import { EventEmitter } from 'eventemitter3'
import { UrlUtility } from '../url-utility/url-utility'

export abstract class AuthenticationResponseListener extends EventEmitter {
  protected urlUtility: UrlUtility = new DefaultUrlUtility()

  constructor(protected redirectUri: string) {
    super()
  }

  public setUrlUtility(urlUtility: UrlUtility): void {
    this.urlUtility = urlUtility
  }

  public async abstract start(): Promise<void>

  public async abstract stop(): Promise<void>
}
