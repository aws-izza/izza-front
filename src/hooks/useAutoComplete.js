import { useState, useCallback, useRef } from "react";
import { landService } from "../services/landService";

export const useAutoComplete = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 디바운싱을 위한 타이머 ref
  const debounceTimerRef = useRef(null);

  // 실제 API 호출 함수
  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await landService.getAutoComplete(query.trim());
      const results = response.data.data.results || [];

      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error("자동완성 API 호출 실패:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 디바운싱이 적용된 검색 함수 (200ms로 더 빠른 반응)
  const searchSuggestions = useCallback(
    (query, delay = 300) => {
      // 기존 타이머 취소
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // 새로운 타이머 설정
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(query);
      }, delay);
    },
    [fetchSuggestions]
  );

  // 자동완성 목록 숨기기
  const hideSuggestions = useCallback(() => {
    setShowSuggestions(false);
  }, []);

  // 자동완성 목록 보이기
  const showSuggestionsList = useCallback(() => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [suggestions.length]);

  // 디바운싱 타이머 정리
  const cancelPendingSearch = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  return {
    suggestions,
    isLoading,
    showSuggestions,
    searchSuggestions,
    hideSuggestions,
    showSuggestionsList,
    cancelPendingSearch,
  };
};
