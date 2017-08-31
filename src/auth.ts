import Debug = require('debug')

import { oneLineTrim } from 'common-tags'
import { MonzoRequest } from './api'

const debug = Debug('monzolib:auth')

export const getAuthRequestUrl = (appInfo: AppInfo): string => {
  return oneLineTrim`
    https://auth.getmondo.co.uk/
    ?client_id=${appInfo.clientId}
    &redirect_uri=${appInfo.redirectUri}
    &response_type='code'
    &state=${appInfo.state}
  `
}

export const accessTokenRequest = (
  appInfo: AppInfo,
  authCode: string
): MonzoRequest => {
  debug('getAccessToken')

  return {
    path: '/oauth2/token',
    method: 'POST',
    body: {
      client_id: appInfo.clientId,
      client_secret: appInfo.clientSecret,
      code: authCode,
      grant_type: 'authorization_code',
      redirect_uri: appInfo.redirectUri
    }
  }
}

export const refreshAccess = (
  appInfo: AppInfo,
  refreshToken: string
): MonzoRequest => {
  debug('refreshAccess')

  return {
    path: '/oauth2/token',
    method: 'POST',
    body: {
      client_id: appInfo.clientId,
      client_secret: appInfo.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    }
  }
}

export const verifyAccess = (accessToken: string): MonzoRequest => {
  debug('verifyAccess with =>', accessToken)

  return {
    path: '/ping/whoami',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  }
}

export interface AppInfo {
  clientId: string
  clientSecret: string
  redirectUri: string
  state: string
}

export interface AuthTokenPair {
  accessToken: string
  refreshToken: string
}
