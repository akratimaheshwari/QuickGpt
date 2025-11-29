import React, { useState } from "react";
import SideBar from "./components/SideBar";
import { Route, Routes, useLocation } from "react-router-dom";
import ChatBox from "./components/ChatBox";
import Credits from "./pages/Credits";
import Community from "./pages/Community";
import Loading from "./pages/Loading";
import { assets } from "./assets/assets";
import './assets/prism.css'
import { useAppContext } from "./context/AppContext";
import Login from "./pages/Login";
import {Toaster} from 'react-hot-toast'

const App = () => {
  const {user,loadingUser} = useAppContext()

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {pathname} = useLocation()

  if(pathname === '/loading'|| loadingUser) return <Loading/>

  return (
    <>
    <Toaster/>
    <div className="relative dark:bg-gradient-to-b from-[#242124] to-[#000000] dark:text-white h-screen w-screen flex overflow-hidden">
      
      {/* Mobile menu icon */}
      {!isMenuOpen && (
        <img
          src={assets.menu_icon}
          alt="menu"
          className="absolute top-3 left-3 w-8 h-8 cursor-pointer md:hidden invert dark:invert-0"
          onClick={() => setIsMenuOpen(true)}
        />
      )}

      {/* Sidebar */}
      <SideBar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      {/* Main content area */}
      {user ? (

      
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<ChatBox />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/community" element={<Community />} />
        </Routes>
      </div>
      ) : (
        <div className="bg-gradient-to-b from-[#242124] to-[#000000] flex items-center justify-center h-screen w-screen">
          <Login/>
        </div>
      )}
    </div>
    </>
    
  );
};

export default App;
