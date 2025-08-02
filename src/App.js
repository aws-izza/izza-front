import React from 'react';
import styled from 'styled-components';
import { MapProvider } from './contexts/MapContext';
import SearchSidebar from './components/SearchSidebar';
import Kakaomap from './components/Kakaomap';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
`;

const MapContainer = styled.div`
  flex: 1;
  height: 100vh;
  position: relative;
`;

function App() {
  return (
    <MapProvider>
      <AppContainer>
        <SearchSidebar />
        <MapContainer>
          <Kakaomap />
        </MapContainer>
      </AppContainer>
    </MapProvider>
  );
}

export default App;