<<<<<<< HEAD
import { createContext, useMemo, useState } from "react";
=======
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
>>>>>>> 92674d26098eb58daedabca22370a931235caefc

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("access");
    const username = localStorage.getItem("username");
<<<<<<< HEAD
    if (!token || !username) return null;
    return { loggedIn: true, username };
  });
=======
    if (token && username) {
      return {
        loggedIn: true,
        username: username,
      };
    }
    return null;
  });
  const [loading] = useState(false);
>>>>>>> 92674d26098eb58daedabca22370a931235caefc

  const login = (data) => {
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);

    localStorage.setItem("username", data.username);

    setUser({
      loggedIn: true,
      username: data.username,
    });
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username"); 

    setUser(null);
  };

  const value = useMemo(
    () => ({ user, login, logout, loading: false }),
    [user]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;