import { apiClearToken, apiSetToken, auth } from './api'

/**
 * Creates an application session to complete sign-in after receiving
 * an authorization code.
 *
 * @param code OAuth2 authorization code
 */
export async function signIn(code: string) {
  const { token } = await auth.get<{ token: string }>('/callback', { query: { code } })
  apiSetToken(token)
}

/**
 * Invalidates the application session and forgets the session token.
 */
export async function signOut() {
  await auth.post<void>('/signout')
  apiClearToken()
}
