import { defaults, mande } from 'mande'

// The "mande" library wraps fetch() with sensible default behaviour.
// Documentation: https://github.com/posva/mande#readme

const { VITE_API_BASE_URL } = import.meta.env
console.dir(import.meta.env)

export const apiProjects = mande(VITE_API_BASE_URL + '/api/projects')
export const apiProjectsBinaries = mande(VITE_API_BASE_URL + '/api/projects/binaries')

export function setToken(token: string) {
  defaults.headers['Authorization'] = `Bearer ${token}`
}

export function clearToken() {
  delete defaults.headers['Authorization']
}
