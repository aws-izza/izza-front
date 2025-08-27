// 환경별 API 설정
const environments = {
  development: {
    BASE_URL: "https://api.izza-nopizza.com/dev/",
    API_VERSION: "v1",
  },
  staging: {
    BASE_URL: "https://we-do-not-have-staging-fuckhead.com/kys/",
    API_VERSION: "v1",
  },
  production: {
    BASE_URL: "https://api.izza-nopizza.com/prod/",
    API_VERSION: "v1",
  },
};

// 현재 환경 감지
const getCurrentEnvironment = () => {
  if (process.env.NODE_ENV === "production") {
    return process.env.REACT_APP_STAGE === "staging" ? "staging" : "production";
  }
  return "development";
};

const currentEnv = getCurrentEnvironment();
const config = environments[currentEnv];

// 디버깅용 로그
console.log('🔍 Environment Debug:', {
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_STAGE: process.env.REACT_APP_STAGE,
  currentEnv,
  config
});

const API_CONFIG = {
  // 현재 환경의 설정
  ...config,

  // 환경 정보
  ENVIRONMENT: currentEnv,
  IS_DEVELOPMENT: currentEnv === "development",
  IS_PRODUCTION: currentEnv === "production",

  // URL 생성 헬퍼
  getFullUrl: (endpoint) => {
    const baseUrl = process.env.REACT_APP_API_BASE_URL || config.BASE_URL;
    return `${baseUrl}${endpoint}`;
  },

  // 디버그 정보 (개발환경에서만)
  debug: () => {
    if (currentEnv === "development") {
      console.log("🔧 API Config:", {
        environment: currentEnv,
        baseUrl: config.BASE_URL,
        version: config.API_VERSION,
      });
    }
  },
};

export default API_CONFIG;
