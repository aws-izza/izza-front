import React from 'react';
import { DropdownContainer, DropdownLabel, Dropdown } from '../styles';

const UseZoneDropdown = ({ 
  value, 
  onChange, 
  useZoneCategories, 
  isLoading = false,
  label = "용도지역",
  placeholder = "용도지역을 선택하세요",
  showLabel,
  showDefaultOption = true
}) => {
  return (
    <DropdownContainer>
      {showLabel && <DropdownLabel>{label}</DropdownLabel>}
      <Dropdown
        value={value}
        onChange={onChange}
        disabled={isLoading}
      >
        {showDefaultOption && <option value="">{placeholder}</option>}
        {useZoneCategories.map((category) => (
          <option key={category.name} value={category.name}>
            {category.displayName}
          </option>
        ))}
      </Dropdown>
    </DropdownContainer>
  );
};

export default UseZoneDropdown;