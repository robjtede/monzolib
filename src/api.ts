import { Primitive, JSONMap } from 'json-types'

export type HttpMethods =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS'

export interface QueryString {
  [key: string]: Primitive | undefined
}

export interface MonzoRequest {
  body?: QueryString
  headers?: JSONMap
  method?: HttpMethods
  path: string
  qs?: QueryString
}

export const monzoAuthRoot = 'https://auth.monzo.com'
export const monzoApiRoot = 'https://api.monzo.com'

export interface MonzoWhoAmIResponse {
  authenticated: boolean
  client_id: string
  user_id: string
}
