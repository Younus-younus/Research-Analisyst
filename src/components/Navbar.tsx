import { LogOut, Microscope, User } from 'lucide-react';
import { useContext } from "react";
import { Link } from 'react-router-dom';
import { AuthContext } from "../context/AuthContext";
import { logoutUser } from "../services/firebase";

const Navbar = () => {
    const authContext = useContext(AuthContext);
    const { isLoggedIn, user, logout } = authContext!;

    const handleLogout = async () => {
        try {
            await logoutUser();
            logout();
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <nav className="bg-white shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center space-x-2">
                        <Microscope className="h-8 w-8 text-blue-600" />
                        <span className="text-xl font-bold text-gray-800">Research Analyst</span>
                    </Link>
                    
                    <div className="flex items-center space-x-4">
                        {!isLoggedIn ? (
                            <>
                                <Link 
                                    to="/login-firebase" 
                                    className="text-gray-600 px-4 py-2 hover:text-blue-600 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/register-firebase" 
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Register
                                </Link>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    {user?.photoURL ? (
                                        <img 
                                            src={user.photoURL} 
                                            alt={user.displayName || 'User'}
                                            className="w-8 h-8 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                            <User className="h-4 w-4 text-white" />
                                        </div>
                                    )}
                                    <span className="text-gray-700 font-medium">
                                        {user?.displayName || 'Researcher'}
                                    </span>
                                </div>
                                <button
                                    className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;