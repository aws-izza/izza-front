import React from 'react';
import { useFavorites } from '../../../hooks/useFavorites';
import UseZoneDropdown from '../shared/UseZoneDropdown';
import RegionSelector from '../shared/RegionSelector';
import {
  DropdownContainer,
  DropdownLabel,
  SearchButton,
  RequiredLabel,
  StyledSearchButton,
} from '../styles';

const AnalysisStep1 = ({
  regions,
  districts,
  analysisSelectedRegion,
  analysisSelectedDistrict,
  selectedUseZone,
  useZoneCategories,
  isLoading,
  isLoadingDistricts,
  landCount,
  selectedStarLands,
  onRegionChange,
  onDistrictChange,
  onUseZoneChange,
  onShowStarModal,
  onNext,
  isValid
}) => {
  const { favorites } = useFavorites();

  return (
    <>
      <DropdownContainer>
        <DropdownLabel>지역 선택<RequiredLabel>*</RequiredLabel></DropdownLabel>
        <RegionSelector
          regions={regions}
          districts={districts}
          selectedRegion={analysisSelectedRegion}
          selectedDistrict={analysisSelectedDistrict}
          onRegionChange={onRegionChange}
          onDistrictChange={onDistrictChange}
          isLoading={isLoading}
          isLoadingDistricts={isLoadingDistricts}
        />
      </DropdownContainer>
      
      <DropdownContainer>
        <DropdownLabel>용도지역<RequiredLabel>*</RequiredLabel></DropdownLabel>
        <UseZoneDropdown
          value={selectedUseZone}
          onChange={onUseZoneChange}
          useZoneCategories={useZoneCategories}
          isLoading={isLoading}
          showLabel={false}
        />
      </DropdownContainer>
      
      {/* 찜 토지 불러오기 버튼 */}
      <div style={{ margin: '16px 0' }}>
        <SearchButton
          onClick={onShowStarModal}
          style={{
            width: '100%',
            background: '#fbbf24',
            color: 'white',
            border: 'none',
            marginBottom: '8px'
          }}
        >
          {selectedStarLands.length > 0 
            ? `즐겨찾기에서 불러오기 (${selectedStarLands.length}개 선택됨)` 
            : `즐겨찾기에서 불러오기`
          }
        </SearchButton>
      </div>

      {/* 토지 개수 표시 */}
      {(analysisSelectedRegion && analysisSelectedDistrict) && (
        <div style={{ 
          padding: '12px', 
          background: 'rgba(0, 0, 0, 0.05)', 
          borderRadius: '8px', 
          margin: '16px 0',
          textAlign: 'center',
          fontSize: '14px',
          color: '#333'
        }}>
          {landCount !== null ? (
            <span>
              <strong>분석 대상 토지: {landCount.toLocaleString()}개</strong>
            </span>
          ) : (
            '토지 개수를 조회할 수 없습니다'
          )}
        </div>
      )}
      
      <StyledSearchButton 
        onClick={onNext}
        disabled={!isValid}
        variant={isValid ? 'success' : ''}
      >
        다음
      </StyledSearchButton>
    </>
  );
};

export default AnalysisStep1;