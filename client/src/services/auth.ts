import { auth } from './api'

export async function signIn(email: string) {
  await auth.post<void>('/signin', { email })
}

export async function signOut() {
  await auth.post<void>('/signout')
}
