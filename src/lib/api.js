const API_URL = import.meta.env.VITE_API_URL || '/api'

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, { headers: { 'Content-Type': 'application/json', ...options.headers }, ...options })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error?.message || `Request failed (${response.status})`)
  }
  return response.status === 204 ? null : response.json()
}

export const api = {
  systems: (query = '') => apiRequest(`/ai-systems${query ? `?${query}` : ''}`),
  createSystem: (body) => apiRequest('/ai-systems', { method: 'POST', body: JSON.stringify(body) }),
  assessments: () => apiRequest('/risk-assessments'),
  createAssessment: (body) => apiRequest('/risk-assessments', { method: 'POST', body: JSON.stringify(body) }),
  vetting: (query = '') => apiRequest(`/vetting-requests${query ? `?${query}` : ''}`),
  createVetting: (body) => apiRequest('/vetting-requests', { method: 'POST', body: JSON.stringify(body) }),
  updateVetting: (id, body) => apiRequest(`/vetting-requests/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  roles: () => apiRequest('/rai-roles'),
  createRole: (body) => apiRequest('/rai-roles', { method: 'POST', body: JSON.stringify(body) }),
  escalations: () => apiRequest('/escalations'),
  createEscalation: (body) => apiRequest('/escalations', { method: 'POST', body: JSON.stringify(body) }),
  updateEscalation: (id, body) => apiRequest(`/escalations/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  roadmap: () => apiRequest('/roadmap'),
  updateMilestone: (id, completed) => apiRequest(`/roadmap/milestones/${id}`, { method: 'PUT', body: JSON.stringify({ completed }) }),
  dashboard: () => apiRequest('/dashboard'),
  kpis: () => apiRequest('/kpis'),
  downloadKpiCsv: () => fetch(`${API_URL}/exports/kpi.csv`).then((response) => { if (!response.ok) throw new Error('Unable to export KPI data'); return response.blob() }),
}
