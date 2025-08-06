import React, { useEffect, useRef } from "react";
import { landService } from "../services/landService.js";
import { useMapContext } from "../contexts/MapContext";
import { useMapSearch } from "../hooks/useMapSearch";
import { usePolygonManager } from "../hooks/usePolygonManager";

/* global kakao */
const Kakaomap = () => {
  const { updateMapState, searchResults } = useMapContext();
  const { searchPoints, cancelPendingSearch } = useMapSearch();
  const { showPolygon, hidePolygon, setState } = usePolygonManager();

  // 함수들을 ref로 저장하여 안정적인 참조 유지
  const updateMapStateRef = useRef(updateMapState);
  const searchPointsRef = useRef(searchPoints);
  const setStateRef = useRef(setState);
  const cancelPendingSearchRef = useRef(cancelPendingSearch);

  // ref 업데이트
  useEffect(() => {
    updateMapStateRef.current = updateMapState;
    searchPointsRef.current = searchPoints;
    setStateRef.current = setState;
    cancelPendingSearchRef.current = cancelPendingSearch;
  });

  useEffect(() => {
    let mapEventListeners = [];

    // 카카오 맵 스크립트 동적 로드
    const loadKakaoMapScript = () => {
      return new Promise((resolve, reject) => {
        if (window.kakao && window.kakao.maps) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_API_KEY}&autoload=false`;
        script.onload = () => {
          window.kakao.maps.load(() => {
            resolve();
          });
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    loadKakaoMapScript()
      .then(() => {
        // 기존 지도 인스턴스가 있다면 정리
        if (window.mapInstance) {
          console.log("기존 지도 인스턴스 정리");
          window.mapInstance = null;
        }

        const container = document.getElementById("map");
        const options = {
          center: new kakao.maps.LatLng(37.481519493, 126.882630605), // 가산디지털단지역
          level: 3,
        };

        const map = new kakao.maps.Map(container, options);

        // 전역으로 지도 인스턴스 저장
        window.mapInstance = map;
        window.currentMarkers = [];

        // 이벤트 리스너들을 배열에 저장하여 나중에 정리할 수 있도록 함
        const clickListener = kakao.maps.event.addListener(map, "click", () => {
          setStateRef.current("idle");
        });
        mapEventListeners.push(clickListener);

        const dragstartListener = kakao.maps.event.addListener(
          map,
          "dragstart",
          () => {
            setStateRef.current("idle");
          }
        );
        mapEventListeners.push(dragstartListener);

        const zoomStartListener = kakao.maps.event.addListener(
          map,
          "zoom_start",
          () => {
            setStateRef.current("idle");
          }
        );
        mapEventListeners.push(zoomStartListener);

        // 지도 idle 이벤트 발생 시마다 마커 갱신
        const idleListener = kakao.maps.event.addListener(map, "idle", () => {
          // 마커 재생성 시 폴리곤 상태 초기화
          setStateRef.current("idle");

          const bounds = map.getBounds();
          const sw = bounds.getSouthWest();
          const ne = bounds.getNorthEast();
          const level = map.getLevel();

          // 지도 상태 업데이트
          const boundsData = {
            sw: { lat: sw.getLat(), lng: sw.getLng() },
            ne: { lat: ne.getLat(), lng: ne.getLng() },
            level: level,
          };

          updateMapStateRef.current({ bounds: boundsData });

          // Context의 searchPoints를 사용하여 현재 필터와 함께 검색
          searchPointsRef.current(boundsData);
        });
        mapEventListeners.push(idleListener);
      })
      .catch((error) => {
        console.error("카카오 맵 로드 실패:", error);
      });

    // cleanup 함수 - 컴포넌트 언마운트 시 이벤트 리스너 정리
    return () => {
      console.log("지도 이벤트 리스너 정리");
      mapEventListeners.forEach((listener) => {
        if (listener) {
          kakao.maps.event.removeListener(window.mapInstance, listener);
        }
      });
      mapEventListeners = [];
    };
  }, []); // 빈 의존성 배열로 한 번만 실행

  // searchResults가 변경될 때마다 마커 렌더링
  useEffect(() => {
    if (!window.mapInstance || !searchResults) {
      return;
    }

    const map = window.mapInstance;
    let currentMarkers = window.currentMarkers || [];

    // 기존 마커들 삭제
    currentMarkers.forEach((marker) => {
      marker.setMap(null);
    });
    currentMarkers = [];
    window.currentMarkers = [];

    if (searchResults.length === 0) {
      console.log("검색 결과가 없습니다.");
      return;
    }

    console.log("마커 렌더링:", searchResults.length, "개");

    searchResults.forEach((item) => {
      console.log("마커 좌표:", item.point.lat, item.point.lng);

      const position = new kakao.maps.LatLng(
        Number(item.point.lat),
        Number(item.point.lng)
      );

      // DOM 요소를 직접 생성
      const overlayElement = document.createElement("div");
      overlayElement.style.cssText = `
        background: white;
        border: 2px solid #333;
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 12px;
        font-weight: bold;
        color: #333;
        text-align: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        cursor: pointer;
        min-width: 60px;
      `;
      overlayElement.textContent =
        item.type === "GROUP"
          ? `${item.name || "마커"} : ${item.count}`
          : `${item.name || "마커"}`;

      // 마우스 오버 이벤트 - 폴리곤 표시
      overlayElement.addEventListener("mouseenter", () => {
        // 폴리곤 데이터 API 호출 (id와 polygonType 모두 전달)
        landService
          .getPolygon(item.id, item.type)
          .then((res) => {
            console.log("폴리곤 데이터:", res.data);
            const polygonDataList = res.data.data.polygon; // 이제 List<List<Polygon>> 형태

            // PolygonManager를 사용하여 여러 폴리곤 표시
            showPolygon(polygonDataList, map);
          })
          .catch((err) => {
            console.error("폴리곤 로드 실패:", err);
          });
      });

      // 마우스 아웃 이벤트 - 폴리곤 제거
      overlayElement.addEventListener("mouseleave", () => {
        hidePolygon();
      });

      // GROUP 타입 마커에 클릭 이벤트 추가
      if (item.type === "GROUP") {
        overlayElement.addEventListener("click", () => {
          // 마커 클릭 시 폴리곤 상태 초기화
          setStateRef.current("idle");

          const currentLevel = map.getLevel();
          const newLevel = Math.max(1, currentLevel - 2); // 줌 레벨 2 올리기 (숫자가 작을수록 확대)

          // 마커 좌표로 지도 중심 이동 및 줌 레벨 변경
          map.setCenter(position);
          map.setLevel(newLevel);

          console.log(`GROUP 마커 클릭: ${item.name}, 새 줌 레벨: ${newLevel}`);
        });
      }

      const customOverlay = new kakao.maps.CustomOverlay({
        map: map,
        position: position,
        content: overlayElement,
        yAnchor: 1,
      });

      // 새로 생성한 마커를 배열에 추가
      currentMarkers.push(customOverlay);
    });

    window.currentMarkers = currentMarkers;
  }, [hidePolygon, searchResults, showPolygon]); // 의존성을 searchResults만으로 최소화

  return <div id="map" style={{ width: "100%", height: "100vh" }}></div>;
};

export default Kakaomap;
