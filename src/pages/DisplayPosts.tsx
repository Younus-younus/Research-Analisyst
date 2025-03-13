import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navigate, Outlet, useNavigate } from "react-router-dom";

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

const DisplayPosts = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("about");
    const [aiFeedback, setAiFeedback] = useState("");
    const [loading, setLoading] = useState(false);
    const [userQuestion, setUserQuestion] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [followingState, setFollowingState] = useState<{ [key: string]: boolean }>({});
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`http://localhost:5000/posts/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("authToken")}`, // Send token in Authorization header
            },
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Research post not found");
                }
                return res.json();
            })
            .then((data) => setPost(data))
            .catch((error) => setError(error.message));

    }, [id]);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            alert("You must be logged in to view this page!");
            navigate("/login"); // Redirect to login
        } else {
            const userData = decodeToken(token);
            if (userData) {
                setCurrentUserId(userData.userId);
            }
        }
    }, []);


    // 🔥 Fetch Follow Status on Page Load 🔥
    useEffect(() => {
        if (!currentUserId) return;

        const fetchFollowStatus = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/follow/status`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ followerId: currentUserId, researcherIds: post.map(r => r.id) }),
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
    }, [currentUserId, post]);

    const handleFollow = async (researcherId: string) => {
        if (!currentUserId || !researcherId) return;
        const token = localStorage.getItem("authToken");
        if (!token) {
            alert("You must be logged in to analyze research!");
            navigate("/login");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/follow/follow", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`, // Send token in Authorization header
                },
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
        const token = localStorage.getItem("authToken");
        if (!token) {
            alert("You must be logged in to analyze research!");
            navigate("/login");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/follow/unfollow", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`, // Send token in Authorization header
                },
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

    const analyzeResearch = async () => {
        setLoading(true);
        const token = localStorage.getItem("authToken"); // Retrieve token from localStorage

        if (!post?.content) {
            setAiFeedback("No research content available for analysis.");
            setLoading(false);
            return;
        }
        console.log(post.content)
        if (!token) {
            console.error("No token found. User may not be logged in.");
            navigate("/login");
            return;
        }
        try {
            const response = await fetch("http://localhost:5000/analyze-research", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`, // Send token in Authorization header
                },
                body: JSON.stringify({ researchText: post.content }),
            });
            if (!response.ok) {
                // Handle HTTP errors (e.g., 500, 400)
                console.error("HTTP error!", response.status);
                setAiFeedback(`AI analysis failed. HTTP error: ${response.status}`);
                setLoading(false);
                return;
            }
            const data = await response.json();
            console.log("Received AI feedback:", data); // Debug log
            setAiFeedback(data); // Store the entire JSON object
        } catch (err) {
            setAiFeedback("AI analysis failed.");
        }
        setLoading(false);
    };

    const askAI = async () => {
        if (!userQuestion.trim()) {
            setAiResponse("Please enter a question.");
            return;
        }
        const token = localStorage.getItem("authToken");
        if (!token) {
            console.error("No token found. User may not be logged in.");
            navigate("/login");
            return;
        }

        setChatLoading(true);
        setAiResponse(""); // Clear previous response

        try {
            const response = await fetch("http://localhost:5000/ask-ai", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`, // Send token in Authorization header
                },
                body: JSON.stringify({ question: userQuestion, researchText: post?.content }),
            });

            const data = await response.json();

            if (data.response) {
                // Display the AI's plain text response
                setAiResponse(data.response);
            } else {
                // Assuming it's a structured JSON response
                setAiResponse(data.answer);  // Or however you want to display other types of structured info if it exists
            }


        } catch (error) {
            setAiResponse("Failed to get a response from AI.");
        }

        setChatLoading(false);
    };
    if (error) {
        return <p className="text-red-500">Error: {error}. Try refreshing the page or checking the research ID.</p>;
    }

    return (


        <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm bg-gray-200">
            <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 rounded-t-lg  dark:border-gray-700 bg-gray-300" id="defaultTab" data-tabs-toggle="#defaultTabContent" role="tablist">
                <li className="me-2">
                    <button onClick={() => setActiveTab("about")} id="about-tab" data-tabs-target="#about" type="button" role="tab" aria-controls="about" aria-selected="true" className={`${activeTab === "about" ? "dark:text-blue-500 text-blue-600 rounded-ss-lg" : ""}inline-block p-4  hover:bg-gray-200 hover:rounded  dark:hover:bg-gray-400 `}>Research</button>
                </li>
                <li className="me-2">
                    <button onClick={() => { setActiveTab("services"); analyzeResearch(); }} id="services-tab" data-tabs-target="#services" type="button" role="tab" aria-controls="services" aria-selected="false" className={`${activeTab === "services" ? "dark:text-blue-500 text-blue-600 rounded-ss-lg" : ""}inline-block p-4 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-400 `}>Brief and Fact About Research</button>
                </li>
                <li className="me-2">
                    <button onClick={() => setActiveTab("statistics")} id="statistics-tab" data-tabs-target="#statistics" type="button" role="tab" aria-controls="statistics" aria-selected="false" className={`${activeTab === "statistics" ? "dark:text-blue-500 text-blue-600 rounded-ss-lg" : ""}inline-block p-4 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-400 `}>other</button>
                </li>
                <li className="items-center inline-flex">
                    <button
                        onClick={() => followingState[post?.userId] ? handleUnfollow(post?.userId) : handleFollow(post?.userId)}
                        className="px-4 py-3 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                        {followingState[post?.userId] ? "Unfollow" : "Follow"}
                    </button>
                </li>
            </ul>
            <div id="defaultTabContent">
                <div className={` p-4 rounded-lg md:p-8 dark:bg-gray-200 ${activeTab === "about" ? "block" : "hidden"}`} id="about" role="tabpanel" aria-labelledby="about-tab">
                    <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-gray-900 ">{post?.title || "Loading..."}</h2>
                    <p className="mb-3"><b>Category: {post?.category || "No category available"}</b></p>
                    <p className="mb-3 text-gray-500 dark:text-gray-500">{post?.content || "Content unavailable"}</p>
                </div>
                <div className={`${activeTab === "services" ? "block" : "hidden"} p-4  md:p-8 bg-gray-200 shadow-md `} id="services" role="tabpanel" aria-labelledby="services-tab">
                    <h2 className="mb-5 text-2xl font-extrabold tracking-tight text-gray-900 ">AI Summary & Feedback</h2>
                    <ul role="list" className="space-y-4 ">
                        <li className="flex space-x-2 rtl:space-x-reverse items-center">
                            <svg className="shrink-0 w-3.5 h-3.5 text-blue-600 dark:text-blue-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                            </svg>
                            <span className="leading-tight">{post?.title || "Loading..."}</span>
                        </li>
                        <li className="flex space-x-2 rtl:space-x-reverse items-center">
                            {loading ? (
                                <div className="mt-4 p-3 bg-gray-100 rounded">
                                    <p>Analyzing research... Please wait.</p>
                                </div>
                            ) : (
                                aiFeedback && (
                                    <div className="mt-4 p-3 ">
                                        {typeof aiFeedback === 'string' ? (
                                            <p>{aiFeedback}</p> // If it's just a simple error message
                                        ) : (
                                            <div>
                                                {/* Display the structured data here */}
                                                {/* Example: Display the research overview */}
                                                {aiFeedback.research_overview && (
                                                    <div>
                                                        <p><strong>Research Overview:</strong></p>
                                                        <p>Topic: {aiFeedback.research_overview.topic}</p>
                                                        <p>Methodology: {aiFeedback.research_overview.methodology}</p>
                                                        <p>Goal: {aiFeedback.research_overview.goal}</p>
                                                        <br />
                                                    </div>
                                                )}

                                                {/* Example: Display Key Findings */}
                                                {aiFeedback.key_findings && aiFeedback.key_findings.length > 0 && (
                                                    <div>
                                                        <hr />
                                                        <p><strong>Key Findings:</strong></p>
                                                        <ul>
                                                            {aiFeedback.key_findings.map((finding, index) => (
                                                                <li key={index}>
                                                                    <p>Area: {finding.area}</p>
                                                                    <p>Summary: {finding.summary}</p>
                                                                    <p>Details: {finding.details}</p>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        <br />
                                                    </div>
                                                )}
                                                {aiFeedback.conclusion && (
                                                    <div>
                                                        <hr />
                                                        <p><strong>conclusion:</strong>{aiFeedback.conclusion}</p>
                                                        <br />
                                                    </div>
                                                )}
                                                {aiFeedback.feedback && (
                                                    <div>
                                                        <hr />
                                                        <p><strong>Feedback:</strong>{aiFeedback.feedback}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )
                            )}
                        </li>
                    </ul>
                </div>
                <div className={` ${activeTab === "statistics" ? "block" : "hidden"} p-4 bg-white rounded-lg md:p-8 dark:bg-gray-200 shadow-md`} id="statistics" role="tabpanel" aria-labelledby="statistics-tab">
                    <div className="grid max-w-screen-xl   mx-auto text-gray-900">
                        <div className="flex flex-col">
                            {/* AI Chatting Bot */}
                            <div className="flex flex-col space-y-3">
                                {aiResponse && (
                                    <div className="mt-3">
                                        <strong>AI Response:</strong>
                                        <p>{aiResponse}</p>
                                        <br />
                                    </div>
                                )}
                                <h2 className="text-xl font-semibold mb-3">Ask AI a Question About This Research</h2>
                                <textarea
                                    className="w-full p-2 border rounded-md dark:bg-gray-300 "
                                    placeholder="Type your question here..."
                                    value={userQuestion}
                                    onChange={(e) => setUserQuestion(e.target.value)}
                                />
                                <button onClick={askAI} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                    {chatLoading ? "Asking AI..." : "Ask AI"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default DisplayPosts;