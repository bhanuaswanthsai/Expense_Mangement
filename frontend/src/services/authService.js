import { apiClient } from './api.js'

export async function signup(payload) {
  const { data } = await apiClient().post('/auth/signup', payload)
  return data
}

export async function login(email, password) {
  const { data } = await apiClient().post('/auth/login', { email, password })
  return data
}

export async function getMe(token) {
  const { data } = await apiClient(token).get('/auth/me')
  return data
}
