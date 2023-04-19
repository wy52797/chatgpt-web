import axios, { type AxiosResponse } from 'axios'
import { useAuthStore } from '@/store'
import { router } from '@/router'

const service = axios.create({
  baseURL: import.meta.env.VITE_GLOB_API_URL,
})

service.interceptors.request.use(
  (config) => {
    const token = useAuthStore().token
    if (token)
      config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => {
    return Promise.reject(error.response)
  },
)

service.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    if (response.status === 200)
      return response
    throw new Error(response.status.toString())
  },
  (error) => {
    if (error.response.status === 401)
      router.push('/login')
    return Promise.reject(error)
  },
)

export default service
