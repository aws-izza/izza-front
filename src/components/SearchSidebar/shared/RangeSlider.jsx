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
  step = 1,
  value,
  onChange,
  onInputChange,
  formatNumber,
  isLoading = false,
  showInputs = true,
}) => {
  // 입력 중에는 자유롭게 값 반영
  const handleInputChange = (type, inputValue) => {
    if (!onInputChange) return;
    onInputChange(type, inputValue);
  };

  // 입력창에서 포커스 빠져나올 때 (validation 적용)
  const handleInputBlur = (type, inputValue) => {
    if (!onInputChange) return;

    const numValue = parseInt(inputValue.replace(/,/g, ""), 10);

    if (isNaN(numValue)) {
      // 아무것도 입력 안 했으면 최소값으로 설정
      onInputChange(type, min.toString());
      return;
    }

    let validatedValue = numValue;

    if (type === "min") {
      validatedValue = Math.max(min, numValue); // 최소 보정
      validatedValue = Math.min(validatedValue, value[1]); // 최대값보다 크면 줄임
    } else {
      validatedValue = Math.min(max, numValue); // 최대 보정
      validatedValue = Math.max(validatedValue, value[0]); // 최소값보다 작으면 올림
    }

    onInputChange(type, validatedValue.toString());
  };

  // 슬라이더 이동 시
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
            value={value[0] !== undefined ? formatNumber(value[0]) : ""}
            onChange={(e) => handleInputChange("min", e.target.value)}
            onBlur={(e) => handleInputBlur("min", e.target.value)}
            style={{ width: "45%" }}
          />
          <RangeSeparator>~</RangeSeparator>
          <RangeInput
            type="text"
            value={value[1] !== undefined ? formatNumber(value[1]) : ""}
            onChange={(e) => handleInputChange("max", e.target.value)}
            onBlur={(e) => handleInputBlur("max", e.target.value)}
            style={{ width: "45%" }}
          />
        </RangeInputContainer>
      )}

      <Slider
        range
        min={min}
        max={max}
        step={step || 1}
        value={value}
        onChange={handleSliderChange}
        disabled={isLoading}
        styles={{
          track: { backgroundColor: "#4CAF50" },
          handle: { borderColor: "#4CAF50", backgroundColor: "#fff" },
          rail: { backgroundColor: "#e1e5e9" },
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