import React from 'react';
import RangeSlider from '../shared/RangeSlider';
import {
  FilterTitle,
  CategorySection,
  CategoryTitle,
  IndicatorRow,
  IndicatorName,
  WeightInputContainer,
  WeightLabel,
  WeightInput,
  RequiredLabel,
  SearchButton,
  StyledSearchButton,
  ErrorContainer,
  ErrorContent,
  ErrorMessage,
  ErrorCloseButton,
} from '../styles';

const AnalysisStep3 = ({
  selectedIndicators,
  indicatorWeights,
  landAreaRange,
  landPriceRange,
  sliderValues,
  landCount,
  analysisError,
  isAnalyzing,
  isLoading,
  onWeightChange,
  onSliderChange,
  onRangeInputChange,
  onPrevious,
  onExecute,
  onErrorClose,
  formatNumber,
  isValid
}) => {
  const locationIndicators = ["토지면적", "공시지가", "전기요금"];
  const infrastructureIndicators = ["송전탑", "인구밀도"];
  const stabilityIndicators = ["변전소", "전기선", "연간재난문자"];

  const selectedLocationIndicators = locationIndicators.filter(
    key => selectedIndicators[key]
  );
  const selectedInfrastructureIndicators = infrastructureIndicators.filter(
    key => selectedIndicators[key]
  );
  const selectedStabilityIndicators = stabilityIndicators.filter(
    key => selectedIndicators[key]
  );

  return (
    <>
      <FilterTitle>
        기준 값 및 가중치 설정<RequiredLabel>*</RequiredLabel>
      </FilterTitle>

      {/* 입지조건 - 범위 선택 가능 */}
      {selectedLocationIndicators.length > 0 && (
        <CategorySection>
          <CategoryTitle>입지조건</CategoryTitle>
          {selectedLocationIndicators.map(indicator => (
            <div key={indicator}>
              <IndicatorRow>
                <IndicatorName>{indicator}</IndicatorName>
                <WeightInputContainer>
                  <WeightLabel>
                    가중치<RequiredLabel>*</RequiredLabel>:
                  </WeightLabel>
                  <WeightInput
                    type="number"
                    min="1"
                    max="100"
                    value={indicatorWeights[indicator]}
                    onChange={(e) =>
                      onWeightChange(indicator, e.target.value)
                    }
                    onFocus={(e) => e.target.select()}
                    placeholder="1-100"
                  />
                  <WeightLabel>%</WeightLabel>
                </WeightInputContainer>
              </IndicatorRow>

              {(indicator === "토지면적" || indicator === "공시지가") && (
                <RangeSlider
                  label=""
                  min={
                    indicator === "토지면적"
                      ? landAreaRange.min
                      : landPriceRange.min
                  }
                  max={
                    indicator === "토지면적"
                      ? landAreaRange.max
                      : landPriceRange.max
                  }
                  value={sliderValues[indicator] || [0, 1000]}
                  onChange={(values) =>
                    onSliderChange(indicator, values)
                  }
                  onInputChange={(type, value) =>
                    onRangeInputChange(indicator, type, value)
                  }
                  formatNumber={formatNumber}
                  isLoading={isLoading}
                  showInputs={true}
                />
              )}
            </div>
          ))}
        </CategorySection>
      )}

      {/* 인프라 - 가중치만 선택 가능 */}
      {selectedInfrastructureIndicators.length > 0 && (
        <CategorySection>
          <CategoryTitle>인프라</CategoryTitle>
          {selectedInfrastructureIndicators.map(indicator => (
            <IndicatorRow key={indicator}>
              <IndicatorName>{indicator}</IndicatorName>
              <WeightInputContainer>
                <WeightLabel>가중치:</WeightLabel>
                <WeightInput
                  type="number"
                  min="1"
                  max="100"
                  value={indicatorWeights[indicator]}
                  onChange={(e) =>
                    onWeightChange(indicator, e.target.value)
                  }
                  onFocus={(e) => e.target.select()}
                />
                <WeightLabel>%</WeightLabel>
              </WeightInputContainer>
            </IndicatorRow>
          ))}
        </CategorySection>
      )}

      {/* 안정성 - 가중치만 선택 가능 */}
      {selectedStabilityIndicators.length > 0 && (
        <CategorySection>
          <CategoryTitle>안정성</CategoryTitle>
          {selectedStabilityIndicators.map(indicator => (
            <IndicatorRow key={indicator}>
              <IndicatorName>{indicator}</IndicatorName>
              <WeightInputContainer>
                <WeightLabel>가중치:</WeightLabel>
                <WeightInput
                  type="number"
                  min="1"
                  max="100"
                  value={indicatorWeights[indicator]}
                  onChange={(e) =>
                    onWeightChange(indicator, e.target.value)
                  }
                  onFocus={(e) => e.target.select()}
                />
                <WeightLabel>%</WeightLabel>
              </WeightInputContainer>
            </IndicatorRow>
          ))}
        </CategorySection>
      )}

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

      {/* Error display */}
      {analysisError && (
        <ErrorContainer>
          <ErrorContent>
            <ErrorMessage>{analysisError}</ErrorMessage>
            <ErrorCloseButton
              onClick={onErrorClose}
              title="오류 메시지 닫기"
            >
              ×
            </ErrorCloseButton>
          </ErrorContent>
        </ErrorContainer>
      )}

      <div style={{ display: "flex", gap: "10px" }}>
        <SearchButton
          onClick={onPrevious}
          style={{
            background: "#FFFFFF",
            color: "#5E9F00",
            border: "1px solid #5E9F00"
          }}
        >
          이전
        </SearchButton>
        <StyledSearchButton
          onClick={onExecute}
          disabled={!isValid || isAnalyzing}
          variant={isValid ? "success" : ""}
        >
          {isAnalyzing ? "분석 중..." : "분석 실행"}
        </StyledSearchButton>
      </div>
    </>
  );
};

export default AnalysisStep3;