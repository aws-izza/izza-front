import { useState, useCallback } from "react";

export const usePolygonManager = () => {
  const [polygonState, setPolygonState] = useState({
    polygons: [], // 여러 폴리곤을 저장하는 배열로 변경
    state: "idle", // 'idle', 'showing', 'hiding'
  });

  // 상태 전환 시 자동 정리
  const setState = useCallback((newState) => {
    setPolygonState((prev) => {
      if (prev.state === "showing" && newState !== "showing") {
        // 모든 폴리곤 정리
        if (prev.polygons && prev.polygons.length > 0) {
          console.log("폴리곤 정리:", prev.polygons.length, "개");
          prev.polygons.forEach((polygon) => {
            polygon.setMap(null);
          });
        }
        return {
          polygons: [],
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
    (polygonDataList, map) => {
      setState("showing");

      // 기존 폴리곤들 정리
      setPolygonState((prev) => {
        if (prev.polygons && prev.polygons.length > 0) {
          prev.polygons.forEach((polygon) => {
            polygon.setMap(null);
          });
        }
        return prev;
      });

      if (
        polygonDataList &&
        Array.isArray(polygonDataList) &&
        polygonDataList.length > 0
      ) {
        console.log("폴리곤 그룹 생성:", polygonDataList.length, "개 그룹");

        const createdPolygons = [];

        // 각 폴리곤 그룹을 순회하며 폴리곤 생성
        polygonDataList.forEach((polygonData, groupIndex) => {
          if (
            polygonData &&
            Array.isArray(polygonData) &&
            polygonData.length > 0
          ) {
            console.log(
              `폴리곤 그룹 ${groupIndex + 1} 생성:`,
              polygonData.length,
              "개 좌표"
            );

            // 좌표 배열을 카카오맵 LatLng 객체로 변환
            const polygonPath = polygonData.map(
              (point) =>
                new window.kakao.maps.LatLng(
                  point.y || point.lat,
                  point.x || point.lng
                )
            );

            // 폴리곤 생성 (모든 폴리곤을 같은 색상으로 표시)
            const polygon = new window.kakao.maps.Polygon({
              map: map,
              path: polygonPath,
              strokeWeight: 2,
              strokeColor: "#FF0000",
              strokeOpacity: 0.8,
              fillColor: "#FF0000",
              fillOpacity: 0.2,
            });

            createdPolygons.push(polygon);
          }
        });

        setPolygonState({
          polygons: createdPolygons,
          state: "showing",
        });

        console.log("폴리곤 생성 완료:", createdPolygons.length, "개");
      } else {
        console.warn("폴리곤 데이터가 없거나 잘못된 형식:", polygonDataList);
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
      if (prev.polygons && prev.polygons.length > 0) {
        console.log("폴리곤 강제 정리:", prev.polygons.length, "개");
        prev.polygons.forEach((polygon) => {
          polygon.setMap(null);
        });
      }
      return {
        polygons: [],
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
