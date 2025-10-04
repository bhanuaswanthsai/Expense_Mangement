import axios from 'axios'

export function apiClient(token) {
  const instance = axios.create({
    baseURL: '/api',
  })
  instance.interceptors.request.use(config => {
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })
  return instance
}
