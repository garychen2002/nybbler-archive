import { apiClearToken, apiSetToken, auth } from './api'

/**
 * Restores existing session from local storage, if one is present.
 */
export function restoreSession() {
  const token = localStorage.getItem('session_token')
  if (token) apiSetToken(token)
}

/**
 * Creates an application session to complete sign-in after receiving
 * an authorization code.
 *
 * @param code OAuth2 authorization code
 */
export async function signIn(code: string) {
  const { token } = await auth.get<{ token: string }>('/callback', { query: { code } })
  apiSetToken(token)
  localStorage.setItem('session_token', token)
}

/**
 * Invalidates the application session and forgets the session token.
 */
export async function signOut() {
  localStorage.removeItem('session_token')
  apiClearToken()
  await auth.post<void>('/signout')
}
