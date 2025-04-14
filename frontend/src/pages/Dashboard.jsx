import React from "react";
import Navbar from "../components/Navbar";
import Card from "../components/Card";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="bg-base flex flex-grow items-center justify-center px-4 py-12">
        <Card />
      </div>
    </div>
  );
};

export default Dashboard;
