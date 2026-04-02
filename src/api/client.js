const BASE_URL = import.meta.env.VITE_API_URL || 'https://linkevolution-production.up.railway.app'

function getToken() {
  return localStorage.getItem('le_token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const url = `${BASE_URL}${path}`

  let res
  try {
    res = await fetch(url, { ...options, headers })
  } catch (networkErr) {
    console.error('[api] Network error:', networkErr)
    throw networkErr
  }

  if (res.status === 401) {
    localStorage.removeItem('le_token')
    window.location.href = '/login'
    return
  }

  const text = await res.text()

  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`)
  }

  try {
    return text ? JSON.parse(text) : null
  } catch (parseErr) {
    console.error('[api] JSON parse error:', parseErr)
    throw new Error(`Invalid JSON response: ${text}`)
  }
}

export const api = {
  login(email, password) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  getConversations(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return request(`/conversations${qs ? `?${qs}` : ''}`)
  },

  getMessages(conversationId) {
    return request(`/conversations/${conversationId}/messages`)
  },

  sendMessage(conversationId, content) {
    return request(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, message_type: 'text' }),
    })
  },

  getContacts(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return request(`/contacts${qs ? `?${qs}` : ''}`)
  },

  getAnalytics() {
    return request('/analytics/summary')
  },
}
