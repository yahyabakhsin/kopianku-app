import axios from 'axios';

// Konfigurasi dasar Axios
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor untuk Request (misalnya menambahkan token otentikasi)
apiClient.interceptors.request.use(
  (config) => {
    // TODO: Ambil token dari state/cookies
    // const token = useAuthStore.getState().token;
    // if (token) {
    //   config.headers.Authorization = \`Bearer \${token}\`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk Response (menangani error global)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // TODO: Handle unauthorized (e.g. redirect to login)
      console.error('Unauthorized, redirecting to login...');
    }
    return Promise.reject(error);
  }
);
