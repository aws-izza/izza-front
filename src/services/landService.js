import { apiClient } from "./api.js";

// 토지 관련 API 서비스
export const landService = {
  // 토지 검색 (좌표 기반)
  searchPoints: (params) =>
    apiClient.get("/api/v1/land-search/points", { params }),

  // 토지 상세 정보
  getDetail: (id, params) =>
    apiClient.get(`/api/v1/land-search/polygon/${id}`, { params }),

  // 폴리곤 데이터 조회 (id와 polygonType 필요)
  getPolygon: (id, polygonType) =>
    apiClient.get(
      `/api/v1/land-search/polygon/${id}?polygonType=${polygonType}`
    ),

  // 기본 정보 API들
  // 토지 면적 범위 조회
  getLandAreaRange: () => apiClient.get("/api/v1/base-info/land-area-range"),

  // 공시지가 범위 조회
  getOfficialLandPriceRange: () =>
    apiClient.get("/api/v1/base-info/official-land-price-range"),

  // 용도지역 카테고리 조회
  getUseZoneCategories: () =>
    apiClient.get("/api/v1/base-info/use-zone-categories"),

  // 주소 자동완성
  getAutoComplete: (q) =>
    apiClient.get("/api/v1/ac/auto-complete", { params: { q } }),

  // 토지 상세 정보 조회
  getLandDetail: (landId) =>
    apiClient.get(`/api/v1/land-search/land/${landId}`),

  // 지역 정보 조회 (인구, 전기료, 재해 정보)
  getAreaInfo: (landId) =>
    apiClient.get(`/api/v1/land-search/area/${landId}`),

  // 지역 정보 조회 (시도, 시군구)
  getRegions: (prefix) =>
    apiClient.get(`/api/v1/base-info/regions?prefix=${prefix}`),
};

export default landService;
