import axios from 'axios'

const DEFAULT_BASE_URL = 'http://localhost:5000'

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || DEFAULT_BASE_URL

export const api = axios.create({
  baseURL: API_BASE_URL,
})


