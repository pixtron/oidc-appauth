export type RequestMethodT = | 'get' | 'GET' | 'post' | 'POST'

export type ResponseTypeT = 'json' | 'text'

export interface RequestDataI<T = any> {
  [key: string]: T
}

export interface RequestParamsI<T = any> {
  [key: string]: T
}

export interface RequestHeadersI<T = string> {
  [key: string]: T
}

export interface ResponseHeadersI<T = string | Number> {
  [key: string]: T
}

export interface RequestSettingsI {
  url: string
  method?: RequestMethodT
  data?: RequestDataI
  params?: RequestParamsI
  headers?: RequestHeadersI
  responseType?: ResponseTypeT
}

export interface RequestResponseI<T = any> {
  data?: T
  status: number
  statusText: string
  headers: ResponseHeadersI
}

export abstract class Requestor {
  abstract async send(settings: RequestSettingsI): Promise<RequestResponseI>
}
