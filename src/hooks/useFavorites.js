import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'izza-favorites';
const FAVORITES_CHANGED_EVENT = 'favorites-changed';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);

  const loadFavorites = () => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      const parsedFavorites = stored ? JSON.parse(stored) : [];
      setFavorites(parsedFavorites);
      return parsedFavorites;
    } catch (error) {
      console.error('즐겨찾기 데이터를 불러오는 중 오류:', error);
      setFavorites([]);
      return [];
    }
  };

  const saveFavorites = (favoritesList) => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoritesList));
      setFavorites(favoritesList);
      // 다른 컴포넌트들에게 변경사항을 알림
      window.dispatchEvent(new CustomEvent(FAVORITES_CHANGED_EVENT, { 
        detail: favoritesList 
      }));
    } catch (error) {
      console.error('즐겨찾기 데이터를 저장하는 중 오류:', error);
    }
  };

  const addToFavorites = (landData) => {
    const newFavorite = {
      id: landData.id || landData.pnu || Date.now().toString(),
      ...landData,
      addedAt: new Date().toISOString()
    };
    
    const updatedFavorites = [newFavorite, ...favorites];
    saveFavorites(updatedFavorites);
  };

  const removeFromFavorites = (landId) => {
    const updatedFavorites = favorites.filter(item => item.id !== landId);
    saveFavorites(updatedFavorites);
  };

  const isFavorite = (landId) => {
    return favorites.some(item => item.id === landId);
  };

  const toggleFavorite = (landData) => {
    const landId = landData.id || landData.pnu || Date.now().toString();
    
    if (isFavorite(landId)) {
      removeFromFavorites(landId);
    } else {
      addToFavorites(landData);
    }
  };

  const clearAllFavorites = () => {
    try {
      localStorage.removeItem(FAVORITES_KEY);
      setFavorites([]);
    } catch (error) {
      console.error('즐겨찾기 전체 삭제 중 오류:', error);
    }
  };

  const getFavoriteCount = () => {
    return favorites.length;
  };

  // 커스텀 이벤트 리스너로 다른 컴포넌트의 변경사항을 감지
  const handleFavoritesChanged = useCallback((event) => {
    setFavorites(event.detail);
  }, []);

  useEffect(() => {
    loadFavorites();
    
    // 커스텀 이벤트 리스너 등록
    window.addEventListener(FAVORITES_CHANGED_EVENT, handleFavoritesChanged);
    
    // 클린업 함수
    return () => {
      window.removeEventListener(FAVORITES_CHANGED_EVENT, handleFavoritesChanged);
    };
  }, [handleFavoritesChanged]);

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    clearAllFavorites,
    getFavoriteCount,
    loadFavorites
  };
};