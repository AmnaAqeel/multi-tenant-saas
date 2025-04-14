// src/layouts/DashboardLayout.jsx
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
