import React, { useState, useEffect, useRef } from 'react';
import { useMapFilters } from '../../hooks/useMapFilters';
import { useMapSearch } from '../../hooks/useMapSearch';
import { useAutoComplete } from '../../hooks/useAutoComplete';
import { useLandData } from '../../hooks/useLandData';
import UseZoneDropdown from './shared/UseZoneDropdown';
import RangeSlider from './shared/RangeSlider';
import {
  SearchBox,
  SearchInput,
  SearchIcon,
  AutoCompleteContainer,
  AutoCompleteItem,
  HighlightedText,
  LoadingItem,
  NoResultsItem,
  FilterSection,
  FilterTitle,
  SearchButton,
} from './styles';

const ExploreTab = () => {
  // Context에서 필터 상태 가져오기
  const { searchFilters, updateFilter, updateFilters } = useMapFilters();
  const { searchWithCurrentFilters, isLoading: searchLoading } = useMapSearch();

  // 자동완성 기능
  const {
    suggestions,
    isLoading: autoCompleteLoading,
    showSuggestions,
    searchSuggestions,
    hideSuggestions,
    showSuggestionsList,
    cancelPendingSearch,
  } = useAutoComplete();

  // 공통 데이터 훅 사용
  const { landAreaRange, landPriceRange, useZoneCategories, isLoading } = useLandData();
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // 검색 입력창 ref
  const searchInputRef = useRef(null);

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

  // 컴포넌트 언마운트 시 자동완성 타이머 정리
  useEffect(() => {
    return () => {
      cancelPendingSearch();
    };
  }, [cancelPendingSearch]);

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

  // 검색어와 일치하는 부분을 하이라이팅하는 함수
  const highlightMatchedText = (text, query) => {
    if (!query || !text || query.trim() === "") return text;

    const trimmedQuery = query.trim();

    // 특수 문자 이스케이프 처리
    const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    try {
      // 대소문자 구분 없이 전역 검색
      const regex = new RegExp(`(${escapedQuery})`, "gi");

      // 매칭되는 부분이 있는지 먼저 확인
      if (!regex.test(text)) {
        return text;
      }

      // 다시 regex를 초기화 (test로 인해 lastIndex가 변경됨)
      const splitRegex = new RegExp(`(${escapedQuery})`, "gi");
      const parts = text.split(splitRegex);

      return parts
        .map((part, index) => {
          // 빈 문자열은 건너뛰기
          if (part === "") return null;

          // 검색어와 일치하는 부분인지 확인 (대소문자 구분 없이)
          if (part.toLowerCase() === trimmedQuery.toLowerCase()) {
            return <HighlightedText key={index}>{part}</HighlightedText>;
          }
          return <span key={index}>{part}</span>;
        })
        .filter(Boolean); // null 값 제거
    } catch (error) {
      // 정규식 오류 발생 시 원본 텍스트 반환
      console.warn("하이라이팅 처리 중 오류:", error);
      return text;
    }
  };

  // 검색어 입력 핸들러
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    updateFilter("query", value);

    // 자동완성 검색 실행 (200ms 후 자동 실행)
    searchSuggestions(value, 200);
    setHighlightedIndex(-1);
  };

  // 자동완성 항목 선택 핸들러
  const handleSuggestionSelect = (suggestion) => {
    updateFilter("query", suggestion);
    hideSuggestions();
    setHighlightedIndex(-1);

    // 포커스를 검색창에서 제거
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  // 키보드 이벤트 핸들러
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        hideSuggestions();
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  // 검색창 포커스 핸들러
  const handleSearchInputFocus = () => {
    if (suggestions.length > 0) {
      showSuggestionsList();
    }
  };

  // 검색창 블러 핸들러 (약간의 지연을 두어 클릭 이벤트가 먼저 처리되도록)
  const handleSearchInputBlur = () => {
    setTimeout(() => {
      hideSuggestions();
      setHighlightedIndex(-1);
    }, 200);
  };

  return (
    <>
      <SearchBox>
        <SearchInput
          ref={searchInputRef}
          type="text"
          placeholder="주소로 검색하세요"
          value={searchFilters.query}
          onChange={handleSearchInputChange}
          onFocus={handleSearchInputFocus}
          onBlur={handleSearchInputBlur}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        <SearchIcon>🔍</SearchIcon>

        {showSuggestions && (
          <AutoCompleteContainer>
            {autoCompleteLoading ? (
              <LoadingItem>검색 중...</LoadingItem>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <AutoCompleteItem
                  key={index}
                  className={index === highlightedIndex ? "highlighted" : ""}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {highlightMatchedText(suggestion, searchFilters.query)}
                </AutoCompleteItem>
              ))
            ) : (
              <NoResultsItem>검색 결과가 없습니다</NoResultsItem>
            )}
          </AutoCompleteContainer>
        )}
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
        disabled={isLoading || searchLoading}
      >
        {isLoading
          ? "데이터 로딩 중..."
          : searchLoading
          ? "검색 중..."
          : "적용하기"}
      </SearchButton>
    </>
  );
};

export default ExploreTab;