import React, { useEffect, useRef, useState } from 'react';
import { useMapFilters } from '../../hooks/useMapFilters';
import { useMapSearch } from '../../hooks/useMapSearch';
import { useLandData } from '../../hooks/useLandData';
import { useMapContext } from '../../contexts/MapContext';
import { landService } from '../../services/landService';
import UseZoneDropdown from './shared/UseZoneDropdown';
import RangeSlider from './shared/RangeSlider';
import SearchAutoComplete from './SearchAutoComplete';
import {
  SearchBox,
  FilterSection,
  FilterTitle,
  SearchButton,
} from './styles';

const ExploreTab = () => {
  // Context에서 필터 상태 가져오기
  const { searchFilters, updateFilter, updateFilters } = useMapFilters();
  const { searchWithCurrentFilters, isLoading: searchLoading } = useMapSearch();
  const { focusOnLand } = useMapContext();

  // 공통 데이터 훅 사용
  const { landAreaRange, landPriceRange, useZoneCategories, isLoading } = useLandData();

  // 검색 입력창 ref
  const searchInputRef = useRef(null);

  // 주소 검색 로딩 상태
  const [isAddressSearching, setIsAddressSearching] = useState(false);

  // 데이터 로드 완료 시 필터 초기화
  useEffect(() => {
    if (!isLoading && landAreaRange && landPriceRange) {
      updateFilters({
        landAreaMin: landAreaRange.min,
        landAreaMax: landAreaRange.max,
        officialLandPriceMin: landPriceRange.min,
        officialLandPriceMax: landPriceRange.max,
      });
    }
  }, [isLoading, landAreaRange, landPriceRange, updateFilters]);


  const handleSearch = () => {
    console.log("적용하기 버튼 클릭 - 현재 필터:", searchFilters);
    // Context의 현재 필터로 검색 실행
    searchWithCurrentFilters();
  };

  const formatNumber = (num) => {
    return num ? num.toLocaleString() : '0';
  };

  // 숫자 입력 핸들러 (토지면적)
  const handleAreaInputChange = (type, value) => {
    // RangeSlider에서 이미 validation된 값이 넘어오므로 그대로 사용
    const numValue = typeof value === 'string' ? parseInt(value.replace(/,/g, '')) || 0 : value;
    
    if (type === 'min') {
      updateFilters({
        landAreaMin: numValue,
      });
    } else {
      updateFilters({
        landAreaMax: numValue,
      });
    }
  };

  // 숫자 입력 핸들러 (공시지가)
  const handlePriceInputChange = (type, value) => {
    // RangeSlider에서 이미 validation된 값이 넘어오므로 그대로 사용
    const numValue = typeof value === 'string' ? parseInt(value.replace(/,/g, '')) || 0 : value;
    
    if (type === 'min') {
      updateFilters({
        officialLandPriceMin: numValue,
      });
    } else {
      updateFilters({
        officialLandPriceMax: numValue,
      });
    }
  };

  // 검색어 변경 핸들러
  const handleSearchChange = (value) => {
    updateFilter("query", value);
  };

  // 자동완성 항목 선택 핸들러
  const handleSuggestionSelect = (suggestion) => {
    updateFilter("query", suggestion);
  };

  // 주소 검색 핸들러
  const handleAddressSearch = async (address) => {
    if (!address.trim()) return;

    setIsAddressSearching(true);
    try {
      const response = await landService.searchByAddress(address);
      
      if (response.data && response.data.success && response.data.data) {
        const landDetail = response.data.data;
        
        // id 필드를 사용하여 토지에 포커스
        if (landDetail.id) {
          await focusOnLand(landDetail.id, { 
            zoomLevel: 2, 
            showSidebar: true, 
            showPolygon: true, 
            disableSearch: false 
          });
        }
      } else {
        console.warn('검색 결과가 없습니다:', address);
        alert('검색 결과를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('주소 검색 오류:', error);
      alert('주소 검색 중 오류가 발생했습니다.');
    } finally {
      setIsAddressSearching(false);
    }
  };

  return (
    <>
      <SearchBox>
        <SearchAutoComplete
          placeholder="주소로 검색하세요"
          value={searchFilters.query}
          onChange={handleSearchChange}
          onSelect={handleSuggestionSelect}
          onSearch={handleAddressSearch}
          searchInputRef={searchInputRef}
        />
      </SearchBox>

      <FilterSection>
        <FilterTitle>필터지역</FilterTitle>

        <UseZoneDropdown
          value={searchFilters.useZoneCategory}
          onChange={(e) => updateFilter("useZoneCategory", e.target.value)}
          useZoneCategories={useZoneCategories}
          isLoading={isLoading}
        />

        <RangeSlider
          label="토지면적(m²)"
          min={landAreaRange.min}
          max={landAreaRange.max}
          value={[searchFilters.landAreaMin, searchFilters.landAreaMax]}
          onChange={(values) =>
            updateFilters({
              landAreaMin: values[0],
              landAreaMax: values[1],
            })
          }
          onInputChange={handleAreaInputChange}
          formatNumber={formatNumber}
          isLoading={isLoading}
        />

        <RangeSlider
          label="공시지가(원/m²)"
          min={landPriceRange.min}
          max={landPriceRange.max}
          value={[
            searchFilters.officialLandPriceMin,
            searchFilters.officialLandPriceMax,
          ]}
          onChange={(values) =>
            updateFilters({
              officialLandPriceMin: values[0],
              officialLandPriceMax: values[1],
            })
          }
          onInputChange={handlePriceInputChange}
          formatNumber={formatNumber}
          isLoading={isLoading}
        />
      </FilterSection>

      <SearchButton
        onClick={handleSearch}
        disabled={isLoading || searchLoading || isAddressSearching}
      >
        {isLoading
          ? "데이터 로딩 중..."
          : searchLoading
          ? "검색 중..."
          : isAddressSearching
          ? "주소 검색 중..."
          : "적용하기"}
      </SearchButton>
    </>
  );
};

export default ExploreTab;