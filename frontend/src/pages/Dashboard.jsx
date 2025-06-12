import React, { useState } from "react";

import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Overview from "../components/Overview";

import { useAuthStore } from "../store/useAuthStore";

const Dashboard = () => {
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const { authUser } = useAuthStore();
  const { companyId, activeCompany } = authUser;
  return (
    <div className="flex h-screen flex-col">
      <Navbar
        setShowSwitchModal={setShowSwitchModal}
        showSwitchModal={showSwitchModal}
      />
      {!activeCompany || !companyId ? (
        <Card setShowSwitchModal={setShowSwitchModal} showSwitchModal={showSwitchModal} />
      ) : (
        <Overview setShowSwitchModal={setShowSwitchModal} showSwitchModal={showSwitchModal} />
      )}
    </div>
  );
};

export default Dashboard;
