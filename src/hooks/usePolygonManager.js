import { useState, useCallback } from "react";

export const usePolygonManager = () => {
  const [polygonState, setPolygonState] = useState({
    polygon: null,
    state: "idle", // 'idle', 'showing', 'hiding'
  });

  // 상태 전환 시 자동 정리
  const setState = useCallback((newState) => {
    setPolygonState((prev) => {
      if (prev.state === "showing" && newState !== "showing") {
        // 폴리곤 정리
        if (prev.polygon) {
          console.log("폴리곤 정리");
          prev.polygon.setMap(null);
        }
        return {
          polygon: null,
          state: newState,
        };
      }
      return {
        ...prev,
        state: newState,
      };
    });
    console.log("폴리곤 상태 변경:", newState);
  }, []);

  const showPolygon = useCallback(
    (polygonData, map) => {
      setState("showing");

      // 기존 폴리곤 정리
      setPolygonState((prev) => {
        if (prev.polygon) {
          prev.polygon.setMap(null);
        }
        return prev;
      });

      if (polygonData && Array.isArray(polygonData) && polygonData.length > 0) {
        console.log("폴리곤 생성:", polygonData.length, "개 좌표");

        // 좌표 배열을 카카오맵 LatLng 객체로 변환
        const polygonPath = polygonData.map(
          (point) =>
            new window.kakao.maps.LatLng(
              point.y || point.lat,
              point.x || point.lng
            )
        );

        // 폴리곤 생성
        const polygon = new window.kakao.maps.Polygon({
          map: map,
          path: polygonPath,
          strokeWeight: 2,
          strokeColor: "#FF0000",
          strokeOpacity: 0.8,
          fillColor: "#FF0000",
          fillOpacity: 0.2,
        });

        setPolygonState({
          polygon: polygon,
          state: "showing",
        });

        console.log("폴리곤 생성 완료");
      } else {
        console.warn("폴리곤 데이터가 없거나 잘못된 형식:", polygonData);
        setState("idle");
      }
    },
    [setState]
  );

  const hidePolygon = useCallback(() => {
    setState("idle");
  }, [setState]);

  const cleanup = useCallback(() => {
    setPolygonState((prev) => {
      if (prev.polygon) {
        console.log("폴리곤 강제 정리");
        prev.polygon.setMap(null);
      }
      return {
        polygon: null,
        state: "idle",
      };
    });
  }, []);

  return {
    polygonState,
    showPolygon,
    hidePolygon,
    cleanup,
    setState,
  };
};
