/**
 * Provider configuration
 *
 * @see: https://openid.net/specs/openid-connect-discovery-1_0-17.html#ProviderMetadata
 */
export interface ProviderConfigurationI {
  [key: string]: string
  authorization_endpoint: string
  token_endpoint: string
  revocation_endpoint: string
}
