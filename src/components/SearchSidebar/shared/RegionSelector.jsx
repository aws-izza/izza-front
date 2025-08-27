import React from 'react';
import { DropdownContainer, DropdownLabel, Dropdown } from '../styles';

const RegionSelector = ({
  regions,
  districts,
  selectedRegion,
  selectedDistrict,
  onRegionChange,
  onDistrictChange,
  isLoading = false,
  isLoadingDistricts = false,
}) => {
  return (
    <>
      <DropdownContainer>
        <DropdownLabel>분석 지역</DropdownLabel>
        <Dropdown 
          value={selectedRegion}
          onChange={onRegionChange}
          disabled={isLoading}
        >
          <option value="">광역시도</option>
          {regions.map((region) => (
            <option key={region.code} value={region.code}>
              {region.name}
            </option>
          ))}
        </Dropdown>
      </DropdownContainer>
      
      <DropdownContainer>
        <DropdownLabel>시구</DropdownLabel>
        <Dropdown 
          value={selectedDistrict}
          onChange={onDistrictChange}
          disabled={!selectedRegion || isLoadingDistricts}
        >
          <option value="">
            {isLoadingDistricts ? "로딩 중..." : "시구"}
          </option>
          {districts.map((district) => (
            <option key={district.code} value={district.code}>
              {district.name}
            </option>
          ))}
        </Dropdown>
      </DropdownContainer>
    </>
  );
};

export default RegionSelector;