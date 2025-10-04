import { apiClient } from './api.js'

export async function createUser(token, payload) {
  const { data } = await apiClient(token).post('/users', payload)
  return data
}

export async function listUsers(token) {
  const { data } = await apiClient(token).get('/users')
  return data
}

export async function updateUser(token, id, payload) {
  const { data } = await apiClient(token).put(`/users/${id}`, payload)
  return data
}
