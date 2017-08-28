import { Primitive } from 'json-types'

export type HttpMethods = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS'

export interface QueryString {
  [key: string]: Primitive | undefined
}

export interface MonzoRequest {
  path: string
  qs?: QueryString
  method?: HttpMethods
  json?: boolean
}

export class MonzoApi {
  private proto: string = 'https://'
  private apiRoot: string = 'api.monzo.com'

  constructor(private accessResponse: string) {}

  public request(
    {
      path = '/ping/whoami',
      qs = {},
      method = 'GET',
      json = true
    }: MonzoRequest = { path: '/ping/whoami' }
  ) {
    const headers = {
      Authorization: `Bearer ${this.accessResponse}`
    }

    const opts = {
      method,
      uri: `${this.proto}${this.apiRoot}${path}`,
      [method === 'GET' ? 'qs' : 'form']: qs,
      headers,
      json
    }

    return rp(opts)
  }
}
