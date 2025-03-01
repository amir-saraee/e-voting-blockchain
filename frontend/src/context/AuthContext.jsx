import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Function to set user data in state and localStorage
  const setAuthData = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Function to clear user data from state and localStorage
  const clearAuthData = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // On component mount, restore user from localStorage if available
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:3001/api/auth/login", {
        email,
        password,
      });
      const userData = res.data; // { id, email, role, token }
      setAuthData(userData);
      if (userData.role === "admin") {
        navigate("/admin/elections");
      } else {
        navigate("/voter");
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const register = async (email, password, age, education) => {
    try {
      const res = await axios.post("http://localhost:3001/api/auth/register", {
        email,
        password,
        age,
        education,
      });
      const userData = res.data; // { id, email, role, token }
      setAuthData(userData);
      navigate("/voter");
    } catch (error) {
      console.error("Registration failed", error);
    }
  };

  const logout = () => {
    clearAuthData();
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
