import { apiClient } from './api.js';

// 토지 관련 API 서비스
export const landService = {
  // 토지 검색 (좌표 기반)
  searchPoints: (params) => 
    apiClient.get('/api/v1/land-search/points', { params }),
  
  // 폴리곤 정보
  getDetail: (id, params) => 
    apiClient.get(`/api/v1/land-search/polygon/${id}`, { params }),
};

export default landService;