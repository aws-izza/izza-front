import React, { useState } from "react";
import {
  SidebarContainer,
  Header,
  Logo,
  Title,
  TabContainer,
  Tab,
} from "./SearchSidebar/styles";
import ExploreTab from "./SearchSidebar/ExploreTab";
import AnalysisTab from "./SearchSidebar/AnalysisTab";
import MarketTab from "./SearchSidebar/MarketTab";

const SearchSidebar = () => {
  const [activeTab, setActiveTab] = useState("탐색");

  return (
    <SidebarContainer>
      <Header>
        <Logo>🦊</Logo>
        <Title>
          원하는 조건에 맞는
          <br />
          부지를 찾아보세요!
        </Title>
      </Header>

      <TabContainer>
        <Tab active={activeTab === "탐색"} onClick={() => setActiveTab("탐색")}>
          탐색
        </Tab>
        <Tab 
          active={activeTab === "분석"} 
          onClick={() => setActiveTab("분석")}
        >
          분석
        </Tab>
        <Tab active={activeTab === "저장"} onClick={() => setActiveTab("저장")}>
          저장
        </Tab>
      </TabContainer>

      {activeTab === "탐색" && <ExploreTab />}
      {activeTab === "분석" && <AnalysisTab />}
      {activeTab === "시장" && <MarketTab />}
    </SidebarContainer>
  );
};

export default SearchSidebar;