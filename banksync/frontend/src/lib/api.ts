import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const resp = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const { access_token, refresh_token } = resp.data;
          localStorage.setItem("access_token", access_token);
          localStorage.setItem("refresh_token", refresh_token);
          error.config.headers.Authorization = `Bearer ${access_token}`;
          return api(error.config);
        } catch {
          localStorage.clear();
          window.location.href = "/login";
        }
      } else {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
