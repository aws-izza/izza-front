import React from 'react';
import Slider from 'rc-slider';
import {
  SliderContainer,
  SliderLabel,
  SliderValues,
  RangeInputContainer,
  RangeInput,
  RangeSeparator,
} from '../styles';

const RangeSlider = ({
  label,
  min,
  max,
  value,
  onChange,
  onInputChange,
  formatNumber,
  isLoading = false,
  showInputs = true,
}) => {
  const handleInputChange = (type, inputValue) => {
    if (!onInputChange) return;
    
    // 숫자로 변환 (콤마 제거)
    const numValue = parseInt(inputValue.replace(/,/g, '')) || 0;
    
    // validation 적용
    let validatedValue = numValue;
    
    if (type === 'min') {
      // 최소값은 전체 범위의 최소값보다 작을 수 없음
      validatedValue = Math.max(min, numValue);
      // 최소값은 현재 최대값보다 클 수 없음
      validatedValue = Math.min(validatedValue, value[1]);
    } else {
      // 최대값은 전체 범위의 최대값보다 클 수 없음
      validatedValue = Math.min(max, numValue);
      // 최대값은 현재 최소값보다 작을 수 없음
      validatedValue = Math.max(validatedValue, value[0]);
    }
    
    onInputChange(type, validatedValue.toString());
  };

  const handleSliderChange = (values) => {
    if (!onChange) return;
    
    // 슬라이더 값도 validation 적용
    const [minVal, maxVal] = values;
    
    // 범위 내에서만 동작하도록 제한
    const validatedMin = Math.max(min, Math.min(minVal, max));
    const validatedMax = Math.max(min, Math.min(maxVal, max));
    
    // 최소값이 최대값보다 클 수 없도록 보장
    const finalMin = Math.min(validatedMin, validatedMax);
    const finalMax = Math.max(validatedMin, validatedMax);
    
    onChange([finalMin, finalMax]);
  };

  return (
    <SliderContainer>
      <SliderLabel>{label}</SliderLabel>
      
      {showInputs && (
        <RangeInputContainer style={{ marginBottom: "16px" }}>
          <RangeInput 
            type="text" 
            value={formatNumber(value[0])}
            onChange={(e) => handleInputChange('min', e.target.value)}
            style={{ width: '45%' }}
          />
          <RangeSeparator>~</RangeSeparator>
          <RangeInput 
            type="text" 
            value={formatNumber(value[1])}
            onChange={(e) => handleInputChange('max', e.target.value)}
            style={{ width: '45%' }}
          />
        </RangeInputContainer>
      )}
      
      <Slider
        range
        min={min}
        max={max}
        value={value}
        onChange={handleSliderChange}
        disabled={isLoading}
        styles={{
          track: { backgroundColor: "#4CAF50" },
          handle: { borderColor: "#4CAF50", backgroundColor: "#fff" },
          rail: { backgroundColor: "#e1e5e9" }
        }}
      />
      <SliderValues>
        <span>{formatNumber(value[0])}</span>
        <span>{formatNumber(value[1])}</span>
      </SliderValues>
    </SliderContainer>
  );
};

export default RangeSlider;