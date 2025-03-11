import { useLocation } from "react-router-dom";
import images from "../assets/images.jpg";
import React, { useEffect, useState } from "react";

const decodeToken = (token: string) => {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const decodedData = JSON.parse(atob(base64));
        return decodedData;
    } catch (error) {
        console.error("Invalid token", error);
        return null;
    }
};

const SearchResults = () => {
    const location = useLocation();
    const { results, query } = location.state || { results: [], query: "" };
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [followingState, setFollowingState] = useState<{ [key: string]: boolean }>({}); 

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            const userData = decodeToken(token);
            if (userData) {
                setCurrentUserId(userData.userId);
            }
        }
    }, []);

    // 🔥 Fetch Follow Status on Page Load 🔥
    useEffect(() => {
        if (!currentUserId || results.length === 0) return;

        const fetchFollowStatus = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/follow/status`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ followerId: currentUserId, researcherIds: results.map(r => r.id) }),
                });

                const data = await response.json();
                if (data.success) {
                    setFollowingState(data.followingState); // { "researcherId1": true, "researcherId2": false }
                }
            } catch (error) {
                console.error("Error fetching follow status:", error);
            }
        };

        fetchFollowStatus();
    }, [currentUserId, results]);

    const handleFollow = async (researcherId: string) => {
        if (!currentUserId || !researcherId) return;

        try {
            const response = await fetch("http://localhost:5000/api/follow/follow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ followerId: currentUserId, followingId: researcherId }),
            });

            const data = await response.json();
            if (data.success) {
                setFollowingState(prev => ({ ...prev, [researcherId]: true }));
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleUnfollow = async (researcherId: string) => {
        if (!currentUserId || !researcherId) return;

        try {
            const response = await fetch("http://localhost:5000/api/follow/unfollow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ followerId: currentUserId, followingId: researcherId }),
            });

            const data = await response.json();
            if (data.success) {
                setFollowingState(prev => ({ ...prev, [researcherId]: false }));
            }
        } catch (error) {
            console.error("Unfollow error:", error);
        }
    };

    return (
        <>
            <h2 className="text-2xl font-bold mb-4">{query} Researchers</h2>
            <div className="p-8 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {results.length === 0 ? (
                    <p>No researchers found.</p>
                ) : (
                    results.map((result) => (
                        <div key={result.id} className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm bg-blue-100 dark:border-gray-200">
                            <div className="flex flex-col items-center pb-10">
                                <img className="w-24 h-24 mb-3 rounded-full shadow-lg" src={images} alt="Researcher" />
                                <h5 className="mb-1 text-xl font-medium text-gray-900">{result.username.toUpperCase()}</h5>
                                <span className="text-sm text-gray-500 dark:text-gray-400">{result.email}</span>
                                <div className="flex mt-4 md:mt-6">
                                    <button
                                        onClick={() => followingState[result.id] ? handleUnfollow(result.id) : handleFollow(result.id)}
                                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                    >
                                        {followingState[result.id] ? "Unfollow" : "Follow"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
};

export default SearchResults;
