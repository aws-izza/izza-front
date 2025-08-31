import React from 'react';
import { useFavorites } from '../../hooks/useFavorites';
import { useMapContext } from '../../contexts/MapContext';
import styled from 'styled-components';

const SavedContainer = styled.div`
  padding: 0;
  height: calc(100vh - 200px);
  overflow-y: auto;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyMessage = styled.p`
  font-size: 16px;
  line-height: 1.5;
  margin: 0;
  color: #374151;
`;

const FavoritesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 4px;
`;

const FavoriteItem = styled.div`
  padding: 16px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #5e9f00;
    box-shadow: 0 4px 12px rgba(94, 159, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ItemAddress = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
  flex: 1;
  padding-right: 8px;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #fef2f2;
    color: #dc2626;
    transform: scale(1.1);
  }
`;

const ItemInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  font-size: 12px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoLabel = styled.span`
  font-weight: 500;
  color: #6b7280;
`;

const InfoValue = styled.span`
  color: #1f2937;
  font-weight: 600;
  font-size: 13px;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
`;

const SavedCount = styled.span`
  font-size: 14px;
  color: #374151;
  font-weight: 600;
`;

const ClearAllButton = styled.button`
  background: none;
  border: 1px solid #dc2626;
  color: #dc2626;
  font-size: 12px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #dc2626;
    color: white;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  &:active {
    transform: translateY(0);
  }
`;

const SavedTab = () => {
  const { favorites, removeFromFavorites, clearAllFavorites } = useFavorites();
  const { focusOnLand } = useMapContext();

  const formatPrice = (price) => {
    if (!price) return "-";
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
  };

  const formatArea = (area) => {
    if (!area) return "-";
    const pyeong = Math.round(area * 0.3025);
    return `${new Intl.NumberFormat("ko-KR").format(area)}㎡ (${pyeong.toLocaleString()}평)`;
  };

  const handleItemClick = async (favorite) => {
    const landId = favorite.id;
    await focusOnLand(landId, {
      zoomLevel: 2,
      showSidebar: true,
      showPolygon: true
    });
  };

  const handleRemoveClick = (e, favoriteId) => {
    e.stopPropagation();
    removeFromFavorites(favoriteId);
  };

  const handleClearAll = () => {
    if (window.confirm('모든 찜 목록을 삭제하시겠습니까?')) {
      clearAllFavorites();
    }
  };

  if (favorites.length === 0) {
    return (
      <SavedContainer>
        <EmptyState>
          <EmptyIcon>⭐</EmptyIcon>
          <EmptyMessage>
            아직 찜한 토지가 없습니다.
            <br />
            마음에 드는 토지를 찜해보세요!
          </EmptyMessage>
        </EmptyState>
      </SavedContainer>
    );
  }

  return (
    <SavedContainer>
      <HeaderSection>
        <SavedCount>찜한 토지 {favorites.length}개</SavedCount>
        <ClearAllButton 
          onClick={handleClearAll}
          disabled={favorites.length === 0}
        >
          전체삭제
        </ClearAllButton>
      </HeaderSection>

      <FavoritesList>
        {favorites.map((favorite) => (
          <FavoriteItem 
            key={favorite.id}
            onClick={() => handleItemClick(favorite)}
          >
            <ItemHeader>
              <ItemAddress>{favorite.address}</ItemAddress>
              <RemoveButton 
                onClick={(e) => handleRemoveClick(e, favorite.id)}
                title="찜 해제"
              >
                ×
              </RemoveButton>
            </ItemHeader>
            
            <ItemInfo>
              <InfoItem>
                <InfoLabel>면적</InfoLabel>
                <InfoValue>{formatArea(favorite.landArea)}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>공시지가</InfoLabel>
                <InfoValue>{formatPrice(favorite.officialLandPrice)}/㎡</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>용도지역</InfoLabel>
                <InfoValue>{favorite.useDistrictName1}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>지목</InfoLabel>
                <InfoValue>{favorite.landCategoryName}</InfoValue>
              </InfoItem>
            </ItemInfo>
          </FavoriteItem>
        ))}
      </FavoritesList>
    </SavedContainer>
  );
};

export default SavedTab;