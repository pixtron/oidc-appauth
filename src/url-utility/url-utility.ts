
import { StringHashI } from '../types'

export abstract class UrlUtility {
  public abstract parseUrl(url: string, useHashAsQuery?: boolean): URL
  public abstract buildUrl(url: string, searchParams?: StringHashI): string
}
