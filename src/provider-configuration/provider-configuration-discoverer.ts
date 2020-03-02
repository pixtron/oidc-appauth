import { AppauthHttpError } from '../errors/appauth-http-error'
import { Requestor, RequestSettingsI } from '../requestor/requestor'
import { AxiosRequestor } from '../requestor/axios-requestor'
import { ProviderConfigurationI } from './provider-configuration'

/**
 * The standard uri under which the provider configuration of an issuer can be found
 * @see https://openid.net/specs/openid-connect-discovery-1_0-17.html#ProviderConfig
 */
const CONFIGURATION_PATH = '/.well-known/openid-configuration'
const CACHE_CONFIGURATION_MS = 3600

/**
 * Provider configuration fetched from issuer
 */
export class ProviderConfigurationDiscoverer {
  protected configuration: ProviderConfigurationI | null = null
  protected lastFetched: Date | null = null
  protected fetchingPromise: Promise<ProviderConfigurationI> | null = null
  protected requestor: Requestor = new AxiosRequestor()

  constructor(protected issuerUrl: string) {}

  public setRequestor(requestor: Requestor) {
    this.requestor = requestor
  }

  public async getConfiguration(): Promise<ProviderConfigurationI> {
    if (this.hasCachedConfiguration()) return this.configuration!

    if (this.fetchingPromise === null) {
      this.fetchingPromise = new Promise(async (resolve, reject) => {
        try {
          this.configuration = await this.fetchConfiguration()
          this.fetchingPromise = null
          resolve(this.configuration)
        } catch (error) {
          this.fetchingPromise = null
          reject(error)
        }
      })
    }

    return this.fetchingPromise
  }

  private async fetchConfiguration(): Promise<ProviderConfigurationI> {
    const options: RequestSettingsI = {
      method: 'GET',
      url: `${this.issuerUrl}${CONFIGURATION_PATH}`
    }

    const response = await this.requestor.send(options)

    if (response.status !== 200) {
      throw new AppauthHttpError('Could not fetch configuration', response)
    }

    this.lastFetched = new Date()
    return response.data
  }

  private hasCachedConfiguration(): boolean {
    if (!this.configuration) return false
    if (!this.lastFetched) return false

    return (this.lastFetched.getTime() + CACHE_CONFIGURATION_MS) >= Date.now()
  }
}
