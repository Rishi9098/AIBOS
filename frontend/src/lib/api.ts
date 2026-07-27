const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('aibos_access_token');
}

export function setAuthSession(token: string, role: string, userId: string, username: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('aibos_access_token', token);
  localStorage.setItem('aibos_user_role', role);
  localStorage.setItem('aibos_user_id', userId);
  localStorage.setItem('aibos_username', username);
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('aibos_access_token');
  localStorage.removeItem('aibos_user_role');
  localStorage.removeItem('aibos_user_id');
  localStorage.removeItem('aibos_username');
}

export function getAuthUser() {
  if (typeof window === 'undefined') return null;
  return {
    token: localStorage.getItem('aibos_access_token'),
    role: localStorage.getItem('aibos_user_role'),
    userId: localStorage.getItem('aibos_user_id'),
    username: localStorage.getItem('aibos_username'),
  };
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAuthSession();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/')) {
      window.location.href = '/';
    }
  }

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.detail) {
        errorMessage = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch (e) {
      // ignore json parse error
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  get: <T = any>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T = any>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T = any>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T = any>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
