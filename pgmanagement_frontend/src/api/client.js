import axios from 'axios';


const envUrl = import.meta.env.VITE_API_BASE_URL || 'https://living-peace-backend.onrender.com/api/v1';


const cleanBaseUrl = String(envUrl)
  .replace(/[\[\]"']/g, '') 
  .trim()
  .replace(/\/+$/, '');     

const api = axios.create({
  baseURL: cleanBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Bearer Token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch 401 Unauthorized & Session Expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

// 1. Auth Services
export const authApi = {
  login: (username, password) => api.post('/auth/login', { username, password }),
};

// 2. Room & Utility Services
export const roomApi = {
  getRooms: (floor) =>
    api.get('/rooms', { params: floor !== 'all' ? { floor } : {} }),
  updateMeter: (roomNumber, currentMeter) =>
    api.patch(`/rooms/${roomNumber}/meter`, { currentMeter }),
  toggleStatus: (roomNumber) =>
    api.patch(`/rooms/${roomNumber}/toggle-status`),
  updateRent: (roomNumber, baseRent) =>
    api.patch(`/rooms/${roomNumber}/rent`, { baseRent }),
};

// 3. Resident Directory Services
export const tenantApi = {
  getTenants: () => api.get('/tenants'),
  createTenant: (data) => api.post('/tenants', data),
  updateTenant: (id, data) => api.put(`/tenants/${id}`, data),
  deleteTenant: (id) => api.delete(`/tenants/${id}`),
};

// 4. Excel / CSV Export Service
export const exportReport = async (rate) => {
  const response = await api.get(`/rooms/export/excel?rate=${rate}`, {
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute(
    'download',
    `Living_Peace_Settlement_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default api;