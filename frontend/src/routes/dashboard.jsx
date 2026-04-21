import CreateGroup from "../components/CreateGroup";
import Sidebar from "../components/Sidebar";
import { Outlet } from "@tanstack/react-router";

const Dashboard = () => {
  return (
    <div style={{ display: "flex" }}>
      
      <Sidebar />

      <div style={{ flex: 1, padding: 20 }}>
        <h1>Dashboard</h1>

        <CreateGroup />

        <hr style={{ margin: "20px 0" }} />

        {/* ✅ THIS IS THE FIX */}
        <Outlet />

      </div>

    </div>
  );
};

export default Dashboard;