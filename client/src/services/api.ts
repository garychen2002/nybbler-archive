import { defaults, mande } from 'mande'

// The "mande" library wraps fetch() with sensible default behaviour.
// Documentation: https://github.com/posva/mande#readme

const { VITE_API_BASE_URL } = import.meta.env

export const auth = mande(VITE_API_BASE_URL + '/auth')
export const apiProjects = mande(VITE_API_BASE_URL + '/api/projects')
export const apiProjectsBinaries = mande(VITE_API_BASE_URL + '/api/projects/binaries')
export const apiFunctions = mande(VITE_API_BASE_URL + '/api/functions')
export const apiUsers = mande(VITE_API_BASE_URL + '/api/users')

defaults.credentials = 'include'

export function apiSetToken(token: string) {
  defaults.headers['Authorization'] = `Bearer ${token}`
}

export function apiClearToken() {
  delete defaults.headers['Authorization']
}
