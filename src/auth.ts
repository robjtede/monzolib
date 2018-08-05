import Debug = require('debug')

import { MonzoRequest, monzoAuthRoot } from './api'

const debug = Debug('monzolib:auth')

export function getAuthRequestUrl(appInfo: AppInfo): string {
  debug('getAuthRequestUrl')
  const url = new URL(monzoAuthRoot)

  url.searchParams.set('client_id', appInfo.client_id)
  url.searchParams.set('redirect_uri', appInfo.redirect_uri)
  url.searchParams.set('response_type', appInfo.response_type)
  url.searchParams.set('state', appInfo.state)

  return url.toString()
}

export function parseAuthUrl(authUrl: string, state: string): string {
  debug('parseAuthUrl')
  const url = new URL(authUrl)

  const urlState = url.searchParams.get('state')
  if (urlState && state !== urlState) throw new Error('auth state mismatch')

  const urlCode = url.searchParams.get('code')
  if (urlCode) return urlCode
  else throw new Error('no auth code found')
}

// http call returns a MonzoAccessResponse
export function accessTokenRequest(
  appInfo: AppInfo,
  authCode: string
): MonzoRequest {
  debug('accessTokenRequest')

  return {
    path: '/oauth2/token',
    method: 'POST',
    body: {
      client_id: appInfo.client_id,
      client_secret: appInfo.client_secret,
      code: authCode,
      grant_type: 'authorization_code',
      redirect_uri: appInfo.redirect_uri
    }
  }
}

export function refreshAccessRequest(
  appInfo: AppInfo,
  refreshToken: string
): MonzoRequest {
  debug('refreshAccessRequest')

  return {
    path: '/oauth2/token',
    method: 'POST',
    body: {
      client_id: appInfo.client_id,
      client_secret: appInfo.client_secret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    }
  }
}

export function verifyAccessRequest(accessToken: string): MonzoRequest {
  debug('verifyAccessRequest with =>', accessToken)

  return {
    path: '/ping/whoami',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  }
}

export interface AppInfo {
  client_id: string
  client_secret: string
  redirect_uri: string
  response_type: string
  state: string
}

export interface AuthTokenPair {
  accessToken: string
  refreshToken: string
}

export interface MonzoAccessResponse {
  access_token: string
  client_id: string
  expires_in: number
  refresh_token?: string
  token_type: string
  scope: string
  user_id: string
}
