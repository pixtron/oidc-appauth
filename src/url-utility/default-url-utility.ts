import { StringHashI } from '../types'
import { UrlUtility } from './url-utility'

export class DefaultUrlUtility extends UrlUtility {

  public parseUrl(url: string, useHashAsQuery?: boolean): URL {
    const urlO = new URL(url)

    if (useHashAsQuery === true) {
      this.assignQueryString(urlO.searchParams, urlO.hash)
      urlO.hash = ''
    }

    return urlO
  }

  public buildUrl(url: string, searchParams?: StringHashI): string {
    const urlO = new URL(url)

    if (searchParams) this.assignSearchParamsObj(urlO.searchParams, searchParams)

    urlO.searchParams.sort()

    return urlO.toString()
  }

  private assignQueryString(searchParams: URLSearchParams, query: string): void {
    query = query.trim().replace(/^(\?|&|#)/, '')

    this.emptySearchParams(searchParams)
    this.assignSearchParams(searchParams, new URLSearchParams(query))
  }

  private emptySearchParams(searchParams: URLSearchParams): void {
    [...searchParams.keys()].forEach(key => searchParams.delete(key))
  }

  private assignSearchParams(target: URLSearchParams, source: URLSearchParams): void {
    [...source.entries()].forEach(entry => target.set(entry[0], entry[1]))
  }

  private assignSearchParamsObj(target: URLSearchParams, source: StringHashI): void {
    Object.entries(source).forEach(entry => target.set(entry[0], entry[1]))
  }
}
