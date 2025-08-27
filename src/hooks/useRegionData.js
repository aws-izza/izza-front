import { useState, useEffect } from 'react';
import { landService } from '../services/landService';

export const useRegionData = () => {
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);

  // 초기 지역 데이터 로드
  useEffect(() => {
    const loadRegions = async () => {
      try {
        setIsLoading(true);
        const response = await landService.getRegions('');
        const regionData = response.data.data;
        setRegions(regionData);
        
        console.log("지역 데이터 로드 완료:", regionData);
      } catch (error) {
        console.error("지역 데이터 로드 실패:", error);
        setRegions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRegions();
  }, []);

  // 광역시도 선택 시 시군구 로드
  useEffect(() => {
    const loadDistricts = async () => {
      if (!selectedRegion) {
        setDistricts([]);
        setSelectedDistrict('');
        return;
      }

      try {
        setIsLoadingDistricts(true);
        const response = await landService.getRegions(selectedRegion);
        const regionData = response.data.data;
        setDistricts(regionData);
        setSelectedDistrict('');
        
        console.log("시군구 데이터 로드 완료:", regionData);
      } catch (error) {
        console.error("시군구 데이터 로드 실패:", error);
        setDistricts([]);
      } finally {
        setIsLoadingDistricts(false);
      }
    };

    loadDistricts();
  }, [selectedRegion]);

  const handleRegionChange = (e) => {
    setSelectedRegion(e.target.value);
  };

  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
  };

  return {
    regions,
    districts,
    selectedRegion,
    selectedDistrict,
    isLoading,
    isLoadingDistricts,
    handleRegionChange,
    handleDistrictChange,
  };
};