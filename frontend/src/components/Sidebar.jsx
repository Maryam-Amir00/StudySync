import { Link, useRouterState } from "@tanstack/react-router";

const Sidebar = () => {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const isActive = (path) => pathname === path;

  return (
    <div style={styles.sidebar}>
      <h2>Menu</h2>

      <ul style={styles.list}>
        <li style={isActive("/dashboard/profile") ? styles.active : null}>
          <Link to="/dashboard/profile" style={styles.link}>
            👤 My Profile
          </Link>
        </li>

        <li style={isActive("/dashboard/my-groups") ? styles.active : null}>
          <Link to="/dashboard/my-groups" style={styles.link}>
            👥 My Groups
          </Link>
        </li>

        <li style={isActive("/dashboard/my-posts") ? styles.active : null}>
          <Link to="/dashboard/my-posts" style={styles.link}>
            📝 My Posts
          </Link>
        </li>
      </ul>
    </div>
  );
};

const styles = {
  sidebar: {
    width: "250px",
    height: "100vh",
    backgroundColor: "#1e293b",
    color: "white",
    padding: "20px",
  },
  list: {
    listStyle: "none",
    padding: 0,
    marginTop: "20px",
  },
  link: {
    color: "white",
    textDecoration: "none",
    display: "block",
    padding: "10px",
  },
  active: {
    backgroundColor: "#334155",
    borderRadius: "5px",
  },
};

export default Sidebar;