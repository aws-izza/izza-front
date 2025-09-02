import React from 'react';
import { SearchButton, StyledSearchButton } from '../styles';

const StarLandModal = ({
  favorites,
  selectedStarLands,
  onClose,
  onToggleStarLand,
  onSelectAll,
  onApplySelection
}) => {
  const formatPrice = (price) => {
    if (!price) return "-";
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
  };

  const formatArea = (area) => {
    if (!area) return "-";
    const pyeong = Math.round(area * 0.3025);
    return `${new Intl.NumberFormat("ko-KR").format(area)}㎡ (${pyeong.toLocaleString()}평)`;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '600px',
        maxWidth: '90vw',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* 모달 헤더 */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            찜 토지 목록 ({favorites.length}개)
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        {/* 전체 선택 */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={selectedStarLands.length === favorites.length && favorites.length > 0}
              onChange={onSelectAll}
              style={{ marginRight: '8px' }}
            />
            전체 선택
          </label>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            {selectedStarLands.length}개 선택됨
          </span>
        </div>

        {/* 토지 목록 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 20px'
        }}>
          {favorites.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>⭐</div>
              <p style={{ margin: 0 }}>찜한 토지가 없습니다.</p>
            </div>
          ) : (
            favorites.map((favorite) => (
              <div
                key={favorite.id}
                style={{
                  padding: '16px 0',
                  borderBottom: '1px solid #f3f4f6',
                  display: 'flex',
                  alignItems: 'flex-start'
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedStarLands.includes(favorite.id)}
                  onChange={() => onToggleStarLand(favorite.id)}
                  style={{ marginRight: '12px', marginTop: '4px' }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    margin: '0 0 8px 0',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    {favorite.address}
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    fontSize: '12px'
                  }}>
                    <div>
                      <span style={{ color: '#6b7280' }}>면적: </span>
                      <span style={{ color: '#1f2937', fontWeight: '600' }}>
                        {formatArea(favorite.landArea)}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280' }}>공시지가: </span>
                      <span style={{ color: '#1f2937', fontWeight: '600' }}>
                        {formatPrice(favorite.officialLandPrice)}/㎡
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280' }}>용도지역: </span>
                      <span style={{ color: '#1f2937', fontWeight: '600' }}>
                        {favorite.useDistrictName1}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280' }}>지목: </span>
                      <span style={{ color: '#1f2937', fontWeight: '600' }}>
                        {favorite.landCategoryName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 모달 푸터 */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end'
        }}>
          <SearchButton
            onClick={onClose}
            style={{
              background: '#FFFFFF',
              color: '#6b7280',
              border: '1px solid #d1d5db'
            }}
          >
            취소
          </SearchButton>
          <StyledSearchButton
            onClick={onApplySelection}
            variant="success"
          >
            선택 완료 ({selectedStarLands.length}개)
          </StyledSearchButton>
        </div>
      </div>
    </div>
  );
};

export default StarLandModal;