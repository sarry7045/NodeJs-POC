import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000/api", // Ensure this matches your backend
});

instance.interceptors.request.use(
  (config) => {
      const token = localStorage.getItem("token");
      if (token) {
          config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiration
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
      if (error.response?.status === 403) {

          try {
              // Request a new token using refreshToken
              const refreshToken = localStorage.getItem("refreshToken");
              if (!refreshToken) {
                  throw error;
              }

              const res = await axios.post("http://localhost:5000/api/auth/refresh", { refreshToken });

              localStorage.setItem("token", res.data.token);
              error.config.headers.Authorization = `Bearer ${res.data.token}`;

              return axios(error.config); // Retry the original request
          } catch (refreshError) {
              localStorage.removeItem("token");
              localStorage.removeItem("refreshToken");
              window.location.href = "/login"; // Redirect to login
              return Promise.reject(refreshError);
          }
      }
      return Promise.reject(error);
  }
);

export default instance;