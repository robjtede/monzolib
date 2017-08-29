import * as Debug from 'debug'

const debug = Debug('monzolib:auth')

export const getAccessToken = async (
  appInfo: any,
  authCode: string
): Promise<AuthTokenPair> => {
  debug('getAccessToken')

  const opts = {
    uri: 'https://api.monzo.com/oauth2/token',
    method: 'post',
    form: {
      grant_type: 'authorization_code',
      client_id: appInfo.client_id,
      client_secret: appInfo.client_secret,
      redirect_uri: appInfo.redirect_uri,
      code: authCode
    },
    json: true
  }

  try {
    // const res = await rp(opts)
    // debug('getAccessToken =>', res)

    // return {
    //   accessToken: res.access_token,
    //   refreshToken: res.refresh_token
    // }
    return {
      accessToken: 'res.access_token',
      refreshToken: 'res.refresh_token'
    }
  } catch (err) {
    debug('getAccessToken failed =>', err.error)
    throw new Error(err)
  }
}

export const refreshAccess = async (
  appInfo: any,
  refreshToken: string
): Promise<AuthTokenPair> => {
  debug('refreshAccess')

  const opts = {
    uri: 'https://api.monzo.com/oauth2/token',
    method: 'post',
    form: {
      grant_type: 'refresh_token',
      client_id: appInfo.client_id,
      client_secret: appInfo.client_secret,
      refresh_token: refreshToken
    },
    json: true
  }

  try {
    // const res = await rp(opts)
    // debug(
    //   'refreshAccess =>',
    //   res &&
    //   ('refresh_token' in res && res.refresh_token) &&
    //   ('access_token' in res && res.access_token)
    //     ? '✓'
    //     : '✘'
    // )

    return {
      accessToken: 'res.access_token',
      refreshToken: 'res.refresh_token'
    }
  } catch (err) {
    debug('refreshAccess failed =>', err.error)
    throw new Error(err)
  }
}

export const verifyAccess = async (accessToken: string): Promise<boolean> => {
  debug('verifyAccess with =>', accessToken)

  const opts = {
    uri: 'https://api.monzo.com/ping/whoami',
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    json: true
  }

  try {
    // const res = await rp({
    //   ...opts,
    //   simple: false
    // })
    // debug(
    //   'verifyAccess =>',
    //   res && 'authenticated' in res && res.authenticated ? '✓' : '✘'
    // )

    return false
    // return res && 'authenticated' in res && res.authenticated
  } catch (err) {
    debug('verifyAccess failed =>', err.error)

    if (err.name === 'RequestError') throw err
    else throw new Error(err)
  }
}

export interface AuthTokenPair {
  accessToken: string
  refreshToken: string
}
