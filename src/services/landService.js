import { apiClient } from './api.js';

// 토지 관련 API 서비스
export const landService = {
  // 토지 검색 (좌표 기반)
  searchPoints: (params) => 
    apiClient.get('/api/v1/land-search/points', { params }),
  
  // 토지 상세 정보
  getDetail: (id, params) => 
    apiClient.get(`/api/v1/land-search/polygon/${id}`, { params }),
  
  // 폴리곤 데이터 조회 (id와 polygonType 필요)
  getPolygon: (id, polygonType) => 
    apiClient.get(`/api/v1/land-search/polygon/${id}?polygonType=${polygonType}`),
};

export default landService;