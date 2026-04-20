import CreateGroup from "../components/CreateGroup";
import GroupsPage from "./groups";

const Dashboard = () => {
  return (
    <div style={{ padding: 20 }}>
      
      <h1>Dashboard</h1>

      {/* CREATE GROUP */}
      <CreateGroup />

      <hr style={{ margin: "20px 0" }} />

      {/* ALL GROUPS */}
      <GroupsPage />

    </div>
  );
};

export default Dashboard;