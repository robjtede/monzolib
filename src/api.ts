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
  json?: boolean
  method?: HttpMethods
  path: string
  qs?: QueryString
}

export const monzoApiRoot = 'https://api.monzo.com'
