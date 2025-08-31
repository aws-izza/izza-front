import React, { useState } from "react";
import {
  SidebarContainer,
  Header,
  Logo,
  Title,
  TabContainer,
  Tab,
} from "./SearchSidebar/styles";
import IzZaLogo from "./SearchSidebar/IzZaLogo";
import ExploreTab from "./SearchSidebar/ExploreTab";
import AnalysisTab from "./SearchSidebar/AnalysisTab";
import MarketTab from "./SearchSidebar/MarketTab";
import SavedTab from "./SearchSidebar/SavedTab";

const SearchSidebar = () => {
  const [activeTab, setActiveTab] = useState("탐색");

  return (
    <SidebarContainer>
      <Header>
        <Logo>
          <IzZaLogo width={72} height={32} />
        </Logo>
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
      {activeTab === "저장" && <SavedTab />}
      {activeTab === "시장" && <MarketTab />}
    </SidebarContainer>
  );
};

export default SearchSidebar;