import { useCallback, useState } from 'react';
import { usePolygonManager } from './usePolygonManager';
import { landService } from '../services/landService';

/**
 * Custom hook for managing pinned (selected/fixed) polygons
 * Provides functionality to pin/unpin polygons that persist until explicitly cleared
 */
export const usePolygonPin = () => {
  const { showSelectedPolygon, hideSelectedPolygon } = usePolygonManager();
  const [pinnedLandId, setPinnedLandId] = useState(null);

  /**
   * Pin a polygon for a specific land (make it persistent)
   * @param {string|number} landId - The ID of the land whose polygon to pin
   * @param {string} landType - The type of the land (e.g., "LAND")
   * @param {object} map - The Kakao map instance
   * @returns {Promise<boolean>} Success status
   */
  const pinPolygon = useCallback(async (landId, landType, map) => {
    try {
      console.log(`폴리곤 고정: ${landId}`);
      
      // Get polygon data from API
      const response = await landService.getPolygon(landId, landType);
      console.log("고정된 토지 폴리곤 데이터:", response.data);
      
      const polygonDataList = response.data.data.polygon;
      
      // Show the selected polygon (this makes it persistent)
      showSelectedPolygon(polygonDataList, map);
      
      // Track the pinned land ID
      setPinnedLandId(landId);
      
      return true;
    } catch (error) {
      console.error("폴리곤 고정 실패:", error);
      return false;
    }
  }, [showSelectedPolygon]);

  /**
   * Unpin the currently pinned polygon
   * @returns {void}
   */
  const unpinPolygon = useCallback(() => {
    console.log("폴리곤 고정 해제");
    hideSelectedPolygon();
    setPinnedLandId(null);
  }, [hideSelectedPolygon]);

  /**
   * Check if a specific land's polygon is currently pinned
   * @param {string|number} landId - The land ID to check
   * @returns {boolean}
   */
  const isPolygonPinned = useCallback((landId) => {
    return pinnedLandId === landId;
  }, [pinnedLandId]);

  /**
   * Get the ID of the currently pinned land
   * @returns {string|number|null}
   */
  const getPinnedLandId = useCallback(() => {
    return pinnedLandId;
  }, [pinnedLandId]);

  /**
   * Toggle polygon pin state for a specific land
   * @param {string|number} landId - The ID of the land
   * @param {string} landType - The type of the land
   * @param {object} map - The Kakao map instance
   * @returns {Promise<boolean>} New pin state (true if pinned, false if unpinned)
   */
  const togglePolygonPin = useCallback(async (landId, landType, map) => {
    if (isPolygonPinned(landId)) {
      unpinPolygon();
      return false;
    } else {
      const success = await pinPolygon(landId, landType, map);
      return success;
    }
  }, [isPolygonPinned, unpinPolygon, pinPolygon]);

  return {
    pinPolygon,
    unpinPolygon,
    togglePolygonPin,
    isPolygonPinned,
    getPinnedLandId,
    pinnedLandId
  };
};

export default usePolygonPin;