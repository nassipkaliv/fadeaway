const ACCESS_KEY = 'fadeaway_access';
const REFRESH_KEY = 'fadeaway_refresh';

// In dev → empty string, all /api/* go through Vite proxy to localhost:8000.
// In prod → set VITE_API_URL in Vercel to your Render backend URL (no trailing slash).
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const url = (path) => `${API_BASE}${path}`;

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: ({ access, refresh }) => {
    if (access) localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

async function refreshAccessToken() {
  const refresh = tokenStore.getRefresh();
  if (!refresh) return null;
  const res = await fetch(url('/api/auth/refresh/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) {
    tokenStore.clear();
    return null;
  }
  const data = await res.json();
  tokenStore.set({ access: data.access });
  return data.access;
}

export async function apiFetch(path, { method = 'GET', body, auth = false, headers = {} } = {}) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  if (auth) {
    const access = tokenStore.getAccess();
    if (access) opts.headers.Authorization = `Bearer ${access}`;
  }

  let res = await fetch(url(path), opts);

  if (res.status === 401 && auth) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      opts.headers.Authorization = `Bearer ${newAccess}`;
      res = await fetch(url(path), opts);
    }
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err = new Error(data?.detail || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function toMoney(value) {
  return Number(value || 0);
}

export function mapSneaker(item) {
  if (!item) return null;
  return {
    id: item.id,
    brand: item.brand,
    title: item.title,
    info: item.info,
    category: item.category_name || '',
    finalPrice: toMoney(item.final_price),
    originalPrice: toMoney(item.original_price),
    ratings: item.ratings,
    rateCount: item.rate_count,
    tag: item.tag,
    tagline: item.tagline,
    heroImage: item.hero_image,
    quantity: 1,
    path: '/product-details/',
    images: (item.images || []).map((img) => img.url),
  };
}

export const api = {
  listSneakers: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const data = await apiFetch(`/api/sneakers/${qs ? `?${qs}` : ''}`);
    return (data?.results || []).map(mapSneaker);
  },
  getSneaker: async (id) => {
    const data = await apiFetch(`/api/sneakers/${id}/`);
    return mapSneaker(data);
  },
  listCategories: async () => {
    const data = await apiFetch('/api/categories/');
    return data?.results || [];
  },
  register: (payload) => apiFetch('/api/auth/register/', { method: 'POST', body: payload }),
  login: async (payload) => {
    const data = await apiFetch('/api/auth/login/', { method: 'POST', body: payload });
    tokenStore.set(data);
    return data;
  },
  me: () => apiFetch('/api/auth/me/', { auth: true }),
  createOrder: (payload) =>
    apiFetch('/api/orders/', { method: 'POST', body: payload, auth: true }),
  listOrders: () => apiFetch('/api/orders/', { auth: true }),
};
