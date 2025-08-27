import { useState, useEffect } from 'react';
import { landService } from '../services/landService';

export const useLandData = () => {
  const [landAreaRange, setLandAreaRange] = useState({ min: 0, max: 1000 });
  const [landPriceRange, setLandPriceRange] = useState({ min: 0, max: 100000 });
  const [useZoneCategories, setUseZoneCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);

        // 병렬로 API 호출
        const [landAreaResponse, landPriceResponse, useZoneResponse] = await Promise.all([
          landService.getLandAreaRange(),
          landService.getOfficialLandPriceRange(),
          landService.getUseZoneCategories(),
        ]);

        // 토지 면적 범위 설정
        const areaRange = landAreaResponse.data.data;
        setLandAreaRange(areaRange);
        
        // 공시지가 범위 설정
        const priceRange = landPriceResponse.data.data;
        setLandPriceRange(priceRange);
        
        // 용도지역 카테고리 설정
        const categories = useZoneResponse.data.data;
        setUseZoneCategories(categories);

        console.log("토지 데이터 로드 완료:", {
          landAreaRange: areaRange,
          landPriceRange: priceRange,
          useZoneCategories: categories,
        });
      } catch (error) {
        console.error("토지 데이터 로드 실패:", error);
        // API 호출 실패 시 빈 배열로 초기화
        setUseZoneCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  return {
    landAreaRange,
    landPriceRange,
    useZoneCategories,
    isLoading,
  };
};