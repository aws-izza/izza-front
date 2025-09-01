import React, { useEffect, useRef } from "react";
import { landService } from "../services/landService.js";
import { useMapContext } from "../contexts/MapContext";
import { useMapSearch } from "../hooks/useMapSearch";
import { usePolygonManager } from "../hooks/usePolygonManager";
import LandDetailSidebar from "./LandDetailSidebar";
import MarkerIcon from "../images/Marker.svg";

/* global kakao */
const Kakaomap = () => {
  const {
    updateMapState,
    searchResults,
    landDetailSidebar,
    setLandDetailSidebar,
    showLandDetails,
    focusedLand,
    setFocusedLand,
    focusOnLand,
  } = useMapContext();
  const { searchPoints, cancelPendingSearch } = useMapSearch();
  const {
    showPolygon,
    hidePolygon,
    showSelectedPolygon,
    hideSelectedPolygon,
    setState,
  } = usePolygonManager();

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
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_API_KEY}&autoload=false&libraries=clusterer`;
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

  // 마커 렌더링 (검색 결과 + 포커스된 토지)
  useEffect(() => {
    if (!window.mapInstance) return;
    const map = window.mapInstance;

    let currentMarkers = window.currentMarkers || [];

    // 마커 이미지 정의
    const markerImage = new kakao.maps.MarkerImage(
      MarkerIcon,
      new kakao.maps.Size(28, 28),
      { offset: new kakao.maps.Point(14, 28) }
    );

    // 기존 마커들 삭제
    currentMarkers.forEach((marker) => {
      if (marker && marker.setMap) marker.setMap(null);
    });
    currentMarkers = [];
    window.currentMarkers = [];

    // 렌더링할 항목들 수집
    let itemsToRender = [];

    if (searchResults && searchResults.length > 0) {
      itemsToRender = [...searchResults];
    }

    if (focusedLand && focusedLand.data) {
      const existsInSearchResults = itemsToRender.some(
        (item) =>
          item.id === focusedLand.id || item.id === focusedLand.id.toString()
      );

      if (!existsInSearchResults && focusedLand.data.centerPoint) {
        itemsToRender.push({
          id: focusedLand.id,
          type: "LAND",
          name: focusedLand.data.address,
          point: {
            lat: focusedLand.data.centerPoint.lat,
            lng: focusedLand.data.centerPoint.lng,
          },
          isFocused: true,
        });
      }
    }

    if (itemsToRender.length === 0) {
      console.log("렌더링할 마커가 없습니다.");
      return;
    }

    console.log("마커 렌더링:", itemsToRender.length, "개");

    // 클러스터러 초기화 (최초 1회만 생성)
    if (!window.clusterer) {
      window.clusterer = new kakao.maps.MarkerClusterer({
        map: map,
        averageCenter: true,
        minLevel: 1,
        maxLevel: 3, // 줌레벨 1~3에서 클러스터링
        styles: [
          {
            width: "40px",
            height: "40px",
            background: "#BAF18F",
            borderRadius: "50%",
            textAlign: "center",
            lineHeight: "40px",
            fontWeight: "bold",
            fontSize: "14px",
            boxShadow: "0 0 8px rgba(94,159,0,0.4)",
          },
        ],
      });

      // 클러스터 클릭 이벤트 (한 번만 등록)
      kakao.maps.event.addListener(
        window.clusterer,
        "clusterclick",
        (cluster) => {
          const newLevel = Math.max(1, map.getLevel() - 2); // 2단계 확대
          map.setLevel(newLevel, { anchor: cluster.getCenter() });
        }
      );
    }

    // 클러스터/마커 초기화
    window.clusterer.clear();
    currentMarkers.forEach((m) => m.setMap && m.setMap(null));
    currentMarkers = [];

    // 현재 줌 레벨
    const level = map.getLevel();

    if (level <= 3) {
      // 줌레벨 1~3 → 클러스터 모드
      const markers = itemsToRender.map((item) => {
        const marker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(item.point.lat, item.point.lng),
          image: markerImage,
        });

        // 개별 마커 클릭 이벤트 (상세 패널 열기)
        kakao.maps.event.addListener(marker, "click", async () => {
          if (item.type === "LAND") {
            console.log(`LAND 클릭: ${item.name}, ID: ${item.id}`);
            await focusOnLand(item.id, { moveMap: false });

            setLandDetailSidebar({
              isOpen: true,
              landId: item.id,
              openedFromAnalysis: false,
            });
          }
        });

        // hover → 폴리곤 표시
        kakao.maps.event.addListener(marker, "mouseover", () => {
          landService
            .getPolygon(item.id, item.type)
            .then((res) => {
              const polygonDataList = res.data.data.polygon;
              showPolygon(polygonDataList, map);
            })
            .catch((err) => console.error("폴리곤 로드 실패:", err));
        });

        kakao.maps.event.addListener(marker, "mouseout", () => {
          hidePolygon();
        });

        return marker;
      });

      window.clusterer.addMarkers(markers);
    } else {
      // 줌레벨 4 이상 → 개별 마커 모드
      itemsToRender.forEach((item) => {
        if (item.type === "GROUP") {
          // GROUP 타입은 CustomOverlay로 생성 (두 개 요소로 구성)
          const overlayElement = document.createElement("div");
          overlayElement.style.cssText = `
            display: flex;
            align-items: center;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            border-radius: 20px;
            overflow: hidden;
          `;

          // 숫자 부분 (녹색 배경)
          const countElement = document.createElement("div");
          countElement.style.cssText = `
            background: #5e9f00;
            color: white;
            padding: 8px 12px;
            font-size: 13px;
            font-weight: bold;
            min-width: 30px;
            text-align: center;
          `;
          countElement.textContent = item.count;

          // 지역명 부분 (흰색 배경)
          const nameElement = document.createElement("div");
          nameElement.style.cssText = `
            background: white;
            color: #333;
            padding: 8px 12px;
            font-size: 13px;
            font-weight: bold;
            white-space: nowrap;
          `;
          nameElement.textContent = item.name || "마커";

          overlayElement.appendChild(countElement);
          overlayElement.appendChild(nameElement);

          const position = new kakao.maps.LatLng(item.point.lat, item.point.lng);

          // GROUP 마커 클릭 이벤트
          overlayElement.addEventListener("click", () => {
            setStateRef.current("idle");
            console.log(`GROUP 클릭: ${item.name}`);
            const newLevel = Math.max(1, map.getLevel() - 2);
            map.setCenter(position);
            map.setLevel(newLevel);
          });

          // 마우스 오버 이벤트
          overlayElement.addEventListener("mouseenter", () => {
            landService
              .getPolygon(item.id, item.type)
              .then((res) => {
                const polygonDataList = res.data.data.polygon;
                showPolygon(polygonDataList, map);
              })
              .catch((err) => console.error("폴리곤 로드 실패:", err));
          });

          overlayElement.addEventListener("mouseleave", () => {
            hidePolygon();
          });

          const customOverlay = new kakao.maps.CustomOverlay({
            map: map,
            position: position,
            content: overlayElement,
            yAnchor: 1,
          });

          currentMarkers.push(customOverlay);
        } else if (item.type === "LAND") {
          // LAND 타입은 Marker로 생성
          const marker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(item.point.lat, item.point.lng),
            image: markerImage,
            map: map,
          });

          // 클릭 이벤트
          kakao.maps.event.addListener(marker, "click", async () => {
            console.log(`LAND 클릭: ${item.name}, ID: ${item.id}`);
            await focusOnLand(item.id, { moveMap: false });

            setLandDetailSidebar({
              isOpen: true,
              landId: item.id,
              openedFromAnalysis: false,
            });
          });

          // hover → 폴리곤 표시
          kakao.maps.event.addListener(marker, "mouseover", () => {
            landService
              .getPolygon(item.id, item.type)
              .then((res) => {
                const polygonDataList = res.data.data.polygon;
                showPolygon(polygonDataList, map);
              })
              .catch((err) => console.error("폴리곤 로드 실패:", err));
          });

          kakao.maps.event.addListener(marker, "mouseout", () => {
            hidePolygon();
          });

          currentMarkers.push(marker);
        }
      });

      window.currentMarkers = currentMarkers;
    }
  }, [
    hidePolygon,
    searchResults,
    showPolygon,
    showSelectedPolygon,
    focusOnLand,
    setLandDetailSidebar,
    focusedLand,
  ]);

  // 사이드바 상태 변경 시 지도 크기 재조정
  useEffect(() => {
    if (window.mapInstance) {
      // 약간의 지연을 두어 CSS 트랜지션이 완료된 후 지도 크기 재조정
      setTimeout(() => {
        window.mapInstance.relayout();
      }, 300);
    }
  }, [landDetailSidebar.isOpen]);

  return (
    <>
      <div
        id="map"
        style={{
          width: "100%",
          height: "100vh",
          transition: "margin-right 0.3s ease-in-out",
          marginRight: landDetailSidebar.isOpen ? "400px" : "0",
        }}
      ></div>
      <LandDetailSidebar
        isOpen={landDetailSidebar.isOpen}
        onClose={() => {
          setLandDetailSidebar({
            isOpen: false,
            landId: null,
            openedFromAnalysis: false,
          });
          setFocusedLand(null); // 포커스된 토지도 제거
        }}
        landId={landDetailSidebar.landId}
        openedFromAnalysis={landDetailSidebar.openedFromAnalysis}
      />
    </>
  );
};

export default Kakaomap;
