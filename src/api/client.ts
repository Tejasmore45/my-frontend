import axios from 'axios'

// Default to production backend URL
// Override with .env.local for local development
const DEFAULT_BASE_URL = 'https://my-backend-1xnh.onrender.com'

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || DEFAULT_BASE_URL

export const api = axios.create({
  baseURL: API_BASE_URL,
})


