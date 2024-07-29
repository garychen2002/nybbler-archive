import { apiClearToken, apiClearGitAccess, apiSetGitAccess, apiSetToken, auth } from './api'

/**
 * Restores existing session from local storage, if one is present.
 */
export function restoreSession() {
  const token = localStorage.getItem('session_token')
  if (token) apiSetToken(token)
  const access = localStorage.getItem('access_token')
  if (access) apiSetGitAccess(access)
}

/**
 * Creates an application session to complete sign-in after receiving
 * an authorization code.
 *
 * @param code OAuth2 authorization code
 */
export async function signIn(code: string) {
  const { token, access } = await auth.get<{ token: string, access: string }>('/callback', { query: { code } })
  apiSetToken(token)
  apiSetGitAccess(access)
  localStorage.setItem('session_token', token)
  localStorage.setItem('access_token', access)
}

/**
 * Invalidates the application session and forgets the session token.
 */
export async function signOut() {
  localStorage.removeItem('session_token')
  apiClearToken()
  apiClearGitAccess()
  await auth.post<void>('/signout')
}
