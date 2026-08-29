const BASE_URL = (import.meta.env.VITE_API_URL || 'https://linkevolution-production.up.railway.app').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function getToken() {
  return localStorage.getItem('le_token')
}

export function clearSession() {
  localStorage.removeItem('le_token')
  localStorage.removeItem('le_user')
}

function parseError(text, status) {
  if (!text) return `Error ${status}`
  try {
    const json = JSON.parse(text)
    const detail = json.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail.map((d) => d.msg || JSON.stringify(d)).join('. ')
    }
    return json.message || text
  } catch {
    return text.slice(0, 240)
  }
}

async function request(path, options = {}) {
  const token = getToken()
  const { headers: extraHeaders, ...rest } = options
  const headers = {
    Accept: 'application/json',
    ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  }

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...rest, headers })
  } catch (err) {
    if (err?.name === 'AbortError') throw err
    throw new ApiError('No se pudo conectar con el servidor. Comprueba tu red.', 0)
  }

  if (res.status === 401) {
    clearSession()
    if (window.location.pathname !== '/login') {
      window.location.assign('/login')
    }
    throw new ApiError('Sesión caducada. Vuelve a iniciar sesión.', 401)
  }

  const text = await res.text()
  if (!res.ok) {
    throw new ApiError(parseError(text, res.status), res.status)
  }
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    throw new ApiError('Respuesta inválida del servidor.', res.status)
  }
}

export const api = {
  login(email, password) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  getConversations(params = {}, signal) {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== '' && v !== 'all') qs.set(k, v)
    })
    const q = qs.toString()
    return request(`/conversations${q ? `?${q}` : ''}`, signal ? { signal } : {})
  },

  getConversation(id, signal) {
    return request(`/conversations/${id}`, signal ? { signal } : {})
  },

  getMessages(conversationId, signal) {
    return request(`/conversations/${conversationId}/messages`, signal ? { signal } : {})
  },

  sendMessage(conversationId, body) {
    return request(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    })
  },

  resolveConversation(conversationId) {
    return request(`/conversations/${conversationId}/resolve`, { method: 'POST' })
  },

  getContacts(params = {}, signal) {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v) qs.set(k, v)
    })
    const q = qs.toString()
    return request(`/contacts${q ? `?${q}` : ''}`, signal ? { signal } : {})
  },

  getContact(id, signal) {
    return request(`/contacts/${id}`, signal ? { signal } : {})
  },

  getAnalytics(signal) {
    return request('/analytics/summary', signal ? { signal } : {})
  },
}

export function asList(data, keys = []) {
  if (Array.isArray(data)) return data
  for (const k of keys) {
    if (Array.isArray(data?.[k])) return data[k]
  }
  return []
}

export function indexById(list) {
  const map = {}
  for (const item of list) {
    if (item?.id != null) map[item.id] = item
  }
  return map
}

export function isAbort(err) {
  return err?.name === 'AbortError'
}
