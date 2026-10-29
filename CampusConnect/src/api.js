const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data;
}

export const api = {
  getEvents: () => request('/events'),
  search: (q) => request(`/search?q=${encodeURIComponent(q)}`),
  createEvent: (event) => request('/events', { method: 'POST', body: JSON.stringify(event) }),
  updateEvent: (id, event) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(event) }),
  deleteEvent: (id) => request(`/events/${id}`, { method: 'DELETE' }),
  registerForEvent: (id, details) => request(`/events/${id}/register`, { method: 'POST', body: JSON.stringify(details) }),
  getClubs: (email = '') => request(`/clubs${email ? `?email=${encodeURIComponent(email)}` : ''}`),
  createClub: (club) => request('/clubs', { method: 'POST', body: JSON.stringify(club) }),
  updateClub: (id, club) => request(`/clubs/${id}`, { method: 'PUT', body: JSON.stringify(club) }),
  deleteClub: (id) => request(`/clubs/${id}`, { method: 'DELETE' }),
  joinClub: (id, details) => request(`/clubs/${id}/join`, { method: 'POST', body: JSON.stringify(details) }),
  leaveClub: (id, details) => request(`/clubs/${id}/join`, { method: 'DELETE', body: JSON.stringify(details) }),
  getStudents: () => request('/students'),
  getRegistrations: (email) => request(`/events/registrations?email=${encodeURIComponent(email)}`),
  cancelRegistration: (id, details) => request(`/events/${id}/register`, { method: 'DELETE', body: JSON.stringify(details) }),
};
