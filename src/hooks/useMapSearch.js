import { useCallback, useRef } from 'react';
import { useMapContext } from '../contexts/MapContext';
import { landService } from '../services/landService';

export const useMapSearch = () => {
  const { 
    searchFilters, 
    mapState, 
    setSearchResults, 
    setIsLoading,
    searchResults,
    isLoading
  } = useMapContext();

  // 디바운싱을 위한 타이머 ref
  const debounceTimerRef = useRef(null);

  // 실제 API 호출 함수
  const performSearch = useCallback(async (bounds) => {
    setIsLoading(true);
    
    try {
      if (!bounds) {
        console.warn('지도 영역 정보가 없습니다.');
        setIsLoading(false);
        return;
      }

      const params = {
        // 지도 좌표 정보
        southWestLat: bounds.sw.lat,
        southWestLng: bounds.sw.lng,
        northEastLat: bounds.ne.lat,
        northEastLng: bounds.ne.lng,
        zoomLevel: bounds.level,
        
        // 사용자 필터 (빈 값은 제외)
        ...(searchFilters.useZoneCategory && { useZoneCategories: searchFilters.useZoneCategory }),
        landAreaMin: searchFilters.landAreaMin,
        landAreaMax: searchFilters.landAreaMax,
        officialLandPriceMin: searchFilters.officialLandPriceMin,
        officialLandPriceMax: searchFilters.officialLandPriceMax,
      };

      console.log('검색 파라미터:', params);

      const response = await landService.searchPoints(params);
      console.log('검색 결과:', response.data);
      
      setSearchResults(response.data.data || []);
      
    } catch (error) {
      console.error('검색 실패:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchFilters, setSearchResults, setIsLoading]);

  // 디바운싱이 적용된 검색 함수
  const searchPoints = useCallback((customBounds = null, delay = 300) => {
    const bounds = customBounds || mapState.bounds;
    
    // 기존 타이머 취소
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 새로운 타이머 설정
    debounceTimerRef.current = setTimeout(() => {
      performSearch(bounds);
    }, delay);
  }, [mapState.bounds, performSearch]);

  // 즉시 검색 (디바운싱 없이)
  const searchWithCurrentFilters = useCallback(() => {
    performSearch(mapState.bounds);
  }, [performSearch, mapState.bounds]);

  // 디바운싱 타이머 정리를 위한 함수
  const cancelPendingSearch = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  return { 
    searchPoints, 
    searchWithCurrentFilters,
    cancelPendingSearch,
    searchResults,
    isLoading
  };
};