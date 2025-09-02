import React from 'react';
import {
  FilterTitle,
  CategorySection,
  CategoryTitle,
  CheckboxContainer,
  CheckboxLabel,
  CheckboxInput,
  RequiredLabel,
  SearchButton,
  StyledSearchButton,
} from '../styles';

const AnalysisStep2 = ({
  selectedIndicators,
  landCount,
  isLoadingRangeData,
  onIndicatorChange,
  onPrevious,
  onNext,
  isValid
}) => {
  const locationIndicators = ["토지면적", "공시지가", "전기요금"];
  const infrastructureIndicators = ["송전탑", "인구밀도"];
  const stabilityIndicators = ["변전소", "전기선", "연간재난문자"];

  return (
    <>
      <FilterTitle>
        비교 기준 선택<RequiredLabel>*</RequiredLabel>
      </FilterTitle>

      <CategorySection>
        <CategoryTitle>입지조건</CategoryTitle>
        {locationIndicators.map((indicator) => (
          <CheckboxContainer key={indicator}>
            <CheckboxLabel>
              <CheckboxInput
                type="checkbox"
                checked={selectedIndicators[indicator]}
                onChange={(e) =>
                  onIndicatorChange(indicator, e.target.checked)
                }
              />
              {indicator}
            </CheckboxLabel>
          </CheckboxContainer>
        ))}
      </CategorySection>

      <CategorySection>
        <CategoryTitle>인프라</CategoryTitle>
        {infrastructureIndicators.map((indicator) => (
          <CheckboxContainer key={indicator}>
            <CheckboxLabel>
              <CheckboxInput
                type="checkbox"
                checked={selectedIndicators[indicator]}
                onChange={(e) =>
                  onIndicatorChange(indicator, e.target.checked)
                }
              />
              {indicator}
            </CheckboxLabel>
          </CheckboxContainer>
        ))}
      </CategorySection>

      <CategorySection>
        <CategoryTitle>안정성</CategoryTitle>
        {stabilityIndicators.map((indicator) => (
          <CheckboxContainer key={indicator}>
            <CheckboxLabel>
              <CheckboxInput
                type="checkbox"
                checked={selectedIndicators[indicator]}
                onChange={(e) =>
                  onIndicatorChange(indicator, e.target.checked)
                }
              />
              {indicator}
            </CheckboxLabel>
          </CheckboxContainer>
        ))}
      </CategorySection>

      {/* 토지 개수 표시 */}
      <div
        style={{
          padding: "12px",
          background: "rgba(0, 0, 0, 0.05)",
          borderRadius: "8px",
          margin: "16px 0",
          textAlign: "center",
          fontSize: "14px",
          color: "#333",
        }}
      >
        {landCount !== null ? (
          <span>
            <strong>분석 대상 토지: {landCount.toLocaleString()}개</strong>
          </span>
        ) : (
          "토지 개수를 조회할 수 없습니다"
        )}
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <SearchButton
          onClick={onPrevious}
          style={{
            background: "#FFFFFF",
            color: "#5E9F00",
            border: "1px solid #5E9F00",
          }}
        >
          이전
        </SearchButton>
        <StyledSearchButton
          onClick={onNext}
          disabled={!isValid || isLoadingRangeData}
          variant={isValid ? "success" : ""}
        >
          {isLoadingRangeData ? "로딩 중..." : "다음"}
        </StyledSearchButton>
      </div>
    </>
  );
};

export default AnalysisStep2;