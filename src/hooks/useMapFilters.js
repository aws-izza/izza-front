import { useCallback } from 'react';
import { useMapContext } from '../contexts/MapContext';

export const useMapFilters = () => {
  const { 
    searchFilters, 
    updateFilter, 
    resetFilters,
    setSearchFilters 
  } = useMapContext();

  // 여러 필터를 한번에 업데이트
  const updateFilters = useCallback((filters) => {
    setSearchFilters(prev => ({ ...prev, ...filters }));
  }, [setSearchFilters]);

  // 특정 필터 값 가져오기
  const getFilterValue = useCallback((key) => {
    return searchFilters[key];
  }, [searchFilters]);

  // 필터가 기본값과 다른지 확인
  const hasActiveFilters = useCallback(() => {
    const initialFilters = {
      query: '',
      useZoneCategory: '',
      landAreaMin: 0,
      landAreaMax: 1000,
      officialLandPriceMin: 0,
      officialLandPriceMax: 100000
    };

    return Object.keys(searchFilters).some(key => {
      return searchFilters[key] !== initialFilters[key];
    });
  }, [searchFilters]);

  return { 
    searchFilters,
    updateFilter,
    updateFilters,
    resetFilters,
    getFilterValue,
    hasActiveFilters
  };
};