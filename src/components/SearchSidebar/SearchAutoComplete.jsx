import React, { useState } from 'react';
import { useAutoComplete } from '../../hooks/useAutoComplete';
import MagnifyingGlass from './MagnifyingGlass';
import {
  SearchInput,
  SearchIcon,
  AutoCompleteContainer,
  AutoCompleteItem,
  HighlightedText,
  LoadingItem,
  NoResultsItem,
} from './styles';

const SearchAutoComplete = ({ 
  placeholder = "주소로 검색하세요",
  value,
  onChange,
  onSelect,
  onSearch,
  searchInputRef 
}) => {
  const {
    suggestions,
    isLoading: autoCompleteLoading,
    showSuggestions,
    searchSuggestions,
    hideSuggestions,
    showSuggestionsList,
  } = useAutoComplete();

  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const highlightMatchedText = (text, query) => {
    if (!query || !text || query.trim() === "") return text;

    const trimmedQuery = query.trim();
    const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    try {
      const regex = new RegExp(`(${escapedQuery})`, "gi");

      if (!regex.test(text)) {
        return text;
      }

      const splitRegex = new RegExp(`(${escapedQuery})`, "gi");
      const parts = text.split(splitRegex);

      return parts
        .map((part, index) => {
          if (part === "") return null;

          if (part.toLowerCase() === trimmedQuery.toLowerCase()) {
            return <HighlightedText key={index}>{part}</HighlightedText>;
          }
          return <span key={index}>{part}</span>;
        })
        .filter(Boolean);
    } catch (error) {
      console.warn("하이라이팅 처리 중 오류:", error);
      return text;
    }
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    searchSuggestions(inputValue, 200);
    setHighlightedIndex(-1);
  };

  const handleSuggestionSelect = (suggestion) => {
    onSelect(suggestion);
    hideSuggestions();
    setHighlightedIndex(-1);

    if (searchInputRef?.current) {
      searchInputRef.current.blur();
    }

    // 자동완성 항목 선택 시 자동으로 검색 실행 (엔터를 누른 것과 동일 효과)
    if (onSearch) {
      onSearch(suggestion);
    }
  };

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
        } else if (value.trim() && onSearch) {
          // 선택된 자동완성 항목이 없으면 현재 입력값으로 검색 실행
          hideSuggestions();
          setHighlightedIndex(-1);
          onSearch(value.trim());
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

  const handleInputFocus = () => {
    // 현재 입력값이 있으면 API를 다시 호출하여 최신 자동완성 목록을 가져옴
    if (value && value.trim()) {
      searchSuggestions(value.trim(), 0); // 즉시 호출 (디바운스 없음)
    } else if (suggestions.length > 0) {
      showSuggestionsList();
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      hideSuggestions();
      setHighlightedIndex(-1);
    }, 200);
  };

  return (
    <>
      <SearchInput
        ref={searchInputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      <SearchIcon>
        <MagnifyingGlass width={16} height={16} />
      </SearchIcon>

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
                {highlightMatchedText(suggestion, value)}
              </AutoCompleteItem>
            ))
          ) : (
            <NoResultsItem>검색 결과가 없습니다</NoResultsItem>
          )}
        </AutoCompleteContainer>
      )}
    </>
  );
};

export default SearchAutoComplete;