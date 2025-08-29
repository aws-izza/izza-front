import React, { createContext, useContext, useState, useCallback } from 'react';

const MapContext = createContext();

// 초기 필터 상태
const initialFilters = {
  query: '',
  useZoneCategory: '',
  landAreaMin: 0,
  landAreaMax: 1000,
  officialLandPriceMin: 0,
  officialLandPriceMax: 100000
};

// 초기 지도 상태
const initialMapState = {
  bounds: null,
  level: 3,
  center: { lat: 37.481519493, lng: 126.882630605 }
};

export const MapProvider = ({ children }) => {
  // 필터 상태
  const [searchFilters, setSearchFilters] = useState(initialFilters);
  
  // 지도 상태
  const [mapState, setMapState] = useState(initialMapState);
  
  // 검색 결과 상태
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 분석 결과 상태
  const [analysisResults, setAnalysisResults] = useState(null);
  
  // 선택된 아이템 상태
  const [selectedItems, setSelectedItems] = useState([]);
  
  // 필터 업데이트 함수
  const updateFilter = useCallback((key, value) => {
    setSearchFilters(prev => ({ ...prev, [key]: value }));
  }, []);
  
  // 필터 초기화 함수
  const resetFilters = useCallback(() => {
    setSearchFilters(initialFilters);
  }, []);
  
  // 지도 상태 업데이트 함수
  const updateMapState = useCallback((updates) => {
    setMapState(prev => ({ ...prev, ...updates }));
  }, []);

  // 지도 중심 이동 함수
  const moveMapToLocation = useCallback((lat, lng, level = null) => {
    if (window.mapInstance) {
      const position = new window.kakao.maps.LatLng(lat, lng);
      window.mapInstance.setCenter(position);
      
      if (level !== null) {
        window.mapInstance.setLevel(level);
      }
      
      // 상태도 업데이트
      updateMapState({
        center: { lat, lng },
        ...(level !== null && { level })
      });
    }
  }, [updateMapState]);

  // 지역 경계에 맞게 지도 이동 함수
  const moveMapToRegion = useCallback((bounds) => {
    if (window.mapInstance && bounds) {
      const kakaoMapBounds = new window.kakao.maps.LatLngBounds();
      
      // 경계 좌표들을 추가
      bounds.forEach(coord => {
        kakaoMapBounds.extend(new window.kakao.maps.LatLng(coord.lat, coord.lng));
      });
      
      // 지도를 경계에 맞게 조정
      window.mapInstance.setBounds(kakaoMapBounds);
    }
  }, []);

  const value = {
    // 상태
    searchFilters,
    mapState,
    searchResults,
    isLoading,
    analysisResults,
    selectedItems,
    
    // 액션
    setSearchFilters,
    updateFilter,
    resetFilters,
    setMapState,
    updateMapState,
    setSearchResults,
    setIsLoading,
    setAnalysisResults,
    setSelectedItems,
    moveMapToLocation,
    moveMapToRegion
  };

  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  );
};

// Context 사용을 위한 커스텀 훅
export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapContext must be used within a MapProvider');
  }
  return context;
};

export default MapContext;