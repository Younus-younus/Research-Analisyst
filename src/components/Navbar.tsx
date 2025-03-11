import React, { useContext,useState } from "react";
import { Link } from 'react-router-dom';
import { Microscope } from 'lucide-react';
import { AuthContext } from "../context/AuthContext";


const Navbar = () => {
    const { isLoggedIn, logout } =  useContext(AuthContext);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        logout(); // Update context state
    };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Microscope className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">ScienceShare</span>
          </Link>
          
          <div className="flex space-x-4">
          {!isLoggedIn ? (
            <>
            <Link to="/login" className="text-gray-600 px-4 py-2 hover:text-blue-600">Login</Link>
            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Register
            </Link>
            </>
            ) : (
              <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  onClick={handleLogout}
                  style={{ textDecoration: "none" }}
              >
                  <i className="fa-solid fa-user"></i>&nbsp;<b>Logout</b>
              </button>
      )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;