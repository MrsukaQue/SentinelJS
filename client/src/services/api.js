const request = async (path, options = {}) => {
  const response = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const body =
    response.status === 204
      ? { data: null }
      : await response.json().catch(() => ({ error: { message: 'API unavailable' } }));
  if (!response.ok) {
    const error = new Error(body.error?.message || 'Request failed');
    error.status = response.status;
    error.code = body.error?.code;
    throw error;
  }
  return body.data;
};

export const api = {
  login: (credentials) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (credentials) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(credentials) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  scans: () => request('/scans'),
  scan: (id) => request(`/scans/${id}`),
  findings: (id, filters = {}) => request(`/scans/${id}/findings?${new URLSearchParams(filters)}`),
  createScan: (url) => request('/scans', { method: 'POST', body: JSON.stringify({ url }) }),
  deleteScan: (id) => request(`/scans/${id}`, { method: 'DELETE' }),
};
