import React from 'react';
import Kakaomap from './components/Kakaomap';

function App() {
  return (
    <div className="App">
      <header style={{ padding: '1rem', fontWeight: 'bold' }}>
        IZZA
      </header>
      <main style={{ padding: '1rem' }}>
        <p>우리는 잇자</p>
        <div>
          <Kakaomap />
        </div>
      </main>
    </div>
  );
}

export default App;
