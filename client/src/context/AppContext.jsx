import { useContext, useState, createContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;
console.log("BASE URL =", import.meta.env.VITE_SERVER_URL);

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loadingUser, setLoadingUser] = useState(true);

  // -----------------------------
  // FETCH USER DATA
  // -----------------------------
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/data", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setUser(data.user);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  // -----------------------------
  // FETCH USER CHATS
  // -----------------------------
  const fetchUserChats = async () => {
    if (!token) return;

    try {
      const { data } = await axios.get("/api/chat/get", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setChats(data.chats);

        if (data.chats.length > 0) {
          setSelectedChat(data.chats[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };
  // create new chat
  const createNewChat = async () => {
  if (!token) return toast.error("Login first");

  try {
    const { data } = await axios.get("/api/chat/create", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (data.success) {
      await fetchUserChats(); // fetch updated chats list
      toast.success("New chat created");
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
  }
};


  // -----------------------------
  // WHEN USER CHANGES → Fetch Chats
  // -----------------------------
  useEffect(() => {
    if (user) fetchUserChats();
    else {
      setChats([]);
      setSelectedChat(null);
    }
  }, [user]);

  // -----------------------------
  // APPLY THEME
  // -----------------------------
  useEffect(() => {
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");

    localStorage.setItem("theme", theme);
  }, [theme]);

  // -----------------------------
  // WHEN TOKEN CHANGES → Fetch User
  // -----------------------------
  useEffect(() => {
    if (token) fetchUser();
    else setUser(null);
  }, [token]);

  // -----------------------------
  // CONTEXT VALUE
  // -----------------------------
  const value = {
    navigate,
    user,
    setUser,
    fetchUser,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    theme,
    setTheme,
    loadingUser,
    fetchUserChats,
    token,
    setToken,
    axios, 
    createNewChat
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
