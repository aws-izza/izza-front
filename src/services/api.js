// API 서비스 레이어 (현업에서 많이 사용)
import axios from "axios";
import API_CONFIG from "../config/api";

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 (토큰 추가 등)
apiClient.interceptors.request.use(
  (config) => {
    // 토큰이 있으면 헤더에 추가
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 개발환경에서 요청 로깅
    if (API_CONFIG.IS_DEVELOPMENT) {
      console.log("🚀 API Request:", config.method?.toUpperCase(), config.url);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 (에러 처리 등)
apiClient.interceptors.response.use(
  (response) => {
    if (API_CONFIG.IS_DEVELOPMENT) {
      console.log("✅ API Response:", response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    if (API_CONFIG.IS_DEVELOPMENT) {
      console.error("❌ API Error:", error.response?.status, error.config?.url);
    }

    // 401 에러시 로그아웃 처리 등
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// axios 인스턴스만 export (다른 서비스에서 사용)
export { apiClient };
export default apiClient;
