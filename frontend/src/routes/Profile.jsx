import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  // Safety (important)
  if (!user) return <p>Loading user...</p>;

  return (
    <div>
      <h2>My Profile</h2>

      <div style={{ marginTop: "20px" }}>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
    </div>
  );
};

export default Profile;