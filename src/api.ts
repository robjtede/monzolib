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
  path: string
  qs?: QueryString
  body?: QueryString
  headers?: JSONMap
  method?: HttpMethods
  json?: boolean
}

export const monzoApiAuthRoot = 'https://api.monzo.com'
export const monzoApiRoot = 'https://api.monzo.com'
