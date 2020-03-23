import { Json } from './helpers'

export type HttpMethods =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS'

export type QueryString = Record<string, string | number | boolean | undefined>

export interface MonzoRequest {
  body?: QueryString
  headers?: Record<string, Json>
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
