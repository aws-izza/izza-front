import React, { createContext, useContext, useState, useCallback } from 'react';
import { landService } from '../services/landService';

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

  // 분석 관련 상태
  const [analysisStep, setAnalysisStep] = useState(1);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [showAnalysisResults, setShowAnalysisResults] = useState(false);
  const [selectedIndicators, setSelectedIndicators] = useState({
    토지면적: false,
    공시지가: false,
    전기요금: false,
    송전탑: false,
    인구밀도: false,
    변전소: false,
    전기선: false,
    연간재난문자: false,
  });
  const [indicatorWeights, setIndicatorWeights] = useState({
    토지면적: 80,
    공시지가: 80,
    전기요금: 80,
    송전탑: 80,
    인구밀도: 80,
    변전소: 80,
    전기선: 80,
    연간재난문자: 80,
  });
  const [indicatorRanges, setIndicatorRanges] = useState({});
  const [sliderValues, setSliderValues] = useState({});
  const [selectedUseZone, setSelectedUseZone] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  
  // 분석용 지역 선택 상태 (별도 관리)
  const [analysisSelectedRegion, setAnalysisSelectedRegion] = useState('');
  const [analysisSelectedDistrict, setAnalysisSelectedDistrict] = useState('');

  // 선택된 아이템 상태
  const [selectedItems, setSelectedItems] = useState([]);

  // 토지 상세 사이드바 상태
  const [landDetailSidebar, setLandDetailSidebar] = useState({
    isOpen: false,
    landId: null,
    openedFromAnalysis: false // Track if opened from top 10 analysis results
  });

  // 포커스된 토지 상태 (특정 토지에 집중할 때 사용)
  const [focusedLand, setFocusedLand] = useState(null);

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
    if (window.mapInstance && window.kakao && window.kakao.maps) {
      const position = new window.kakao.maps.LatLng(lat, lng);

      // Use the same pattern as the working GROUP marker click
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

  // 토지에 포커스하는 범용 함수 (지도 이동, 포커스 모드 활성화, 폴리곤 표시, 상세정보 표시)
  const focusOnLand = useCallback(async (landId, options = {}) => {
    const {
      zoomLevel = 2,
      showSidebar = true,
      showPolygon = true,
      disableSearch = false,
      openedFromAnalysis = false,
      moveMap = true
    } = options;

    try {

      // 1. 토지 상세 정보 가져오기
      const landDetailResponse = await landService.getLandDetail(landId);
      if (!landDetailResponse.data || !landDetailResponse.data.data) {
        throw new Error('토지 정보를 가져올 수 없습니다');
      }

      const landDetail = landDetailResponse.data.data;

      // 2. 포커스된 토지 상태 설정
      setFocusedLand({
        id: landId,
        data: landDetail,
        showPolygon,
        timestamp: Date.now()
      });

      // 3. 상세 사이드바 표시
      if (showSidebar) {
        setLandDetailSidebar({
          isOpen: true,
          landId: landId,
          openedFromAnalysis: openedFromAnalysis
        });
      }

      // 4. 지도 이동 (moveMap 옵션이 true인 경우에만)
      if (moveMap && landDetail.centerPoint && landDetail.centerPoint.lat && landDetail.centerPoint.lng) {
        moveMapToLocation(landDetail.centerPoint.lat, landDetail.centerPoint.lng, zoomLevel);
      }

      return { success: true, landDetail };
    } catch (error) {
      console.error('토지 포커스 실패:', error);
      setFocusedLand(null);
      return { success: false, error };
    }
  }, [setLandDetailSidebar, setFocusedLand, moveMapToLocation]);

  // 토지 포커스 해제 함수
  const clearLandFocus = useCallback(() => {
    setFocusedLand(null);
    
    // 상세 사이드바도 닫기
    setLandDetailSidebar({
      isOpen: false,
      landId: null,
      openedFromAnalysis: false
    });
  }, [setFocusedLand, setLandDetailSidebar]);

  // 기존 showLandDetails 함수 유지 (하위 호환성)
  const showLandDetails = useCallback(async (landId, zoomLevel = 1, openedFromAnalysis = false) => {
    return await focusOnLand(landId, { 
      zoomLevel, 
      openedFromAnalysis 
    });
  }, [focusOnLand]);

  const value = {
    // 상태
    searchFilters,
    mapState,
    searchResults,
    isLoading,
    analysisStep,
    analysisResults,
    showAnalysisResults,
    selectedIndicators,
    indicatorWeights,
    indicatorRanges,
    sliderValues,
    selectedUseZone,
    isAnalyzing,
    analysisError,
    analysisSelectedRegion,
    analysisSelectedDistrict,
    selectedItems,
    landDetailSidebar,
    focusedLand,

    // 액션
    setSearchFilters,
    updateFilter,
    resetFilters,
    setMapState,
    updateMapState,
    setSearchResults,
    setIsLoading,
    setAnalysisStep,
    setAnalysisResults,
    setShowAnalysisResults,
    setSelectedIndicators,
    setIndicatorWeights,
    setIndicatorRanges,
    setSliderValues,
    setSelectedUseZone,
    setIsAnalyzing,
    setAnalysisError,
    setAnalysisSelectedRegion,
    setAnalysisSelectedDistrict,
    setSelectedItems,
    setLandDetailSidebar,
    setFocusedLand,
    moveMapToLocation,
    moveMapToRegion,
    focusOnLand,
    clearLandFocus,
    showLandDetails
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