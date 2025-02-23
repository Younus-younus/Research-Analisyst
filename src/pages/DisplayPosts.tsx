import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const DisplayPosts = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("about");
    const [aiFeedback, setAiFeedback] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch(`http://localhost:5000/posts/${id}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Research post not found");
                }
                return res.json();
            })
            .then((data) => setPost(data))
            .catch((error) => setError(error.message));
    }, [id]);

    const analyzeResearch = async () => {
        setLoading(true);
        if (!post?.content) {
            setAiFeedback("No research content available for analysis.");
            return;
        }
        try {
            const response = await fetch("http://localhost:5000/analyze-research", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ researchText: post.content }),
            });
            const data = await response.json();
            setAiFeedback(data.summary);
        } catch (err) {
            setAiFeedback("AI analysis failed.");
        }
        setLoading(false);
    };
    if (error) {
        return <p className="text-red-500">Error: {error}. Try refreshing the page or checking the research ID.</p>;
    }

    return (


        <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm ">
            <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 rounded-t-lg bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:bg-gray-800" id="defaultTab" data-tabs-toggle="#defaultTabContent" role="tablist">
                <li className="me-2">
                    <button onClick={() => setActiveTab("about")} id="about-tab" data-tabs-target="#about" type="button" role="tab" aria-controls="about" aria-selected="true" className="inline-block p-4 text-blue-600 rounded-ss-lg hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-blue-500">Research</button>
                </li>
                <li className="me-2">
                    <button onClick={() => { setActiveTab("services"); analyzeResearch(); }} id="services-tab" data-tabs-target="#services" type="button" role="tab" aria-controls="services" aria-selected="false" className="inline-block p-4 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300">Brief and Fact About Research</button>
                </li>
                <li className="me-2">
                    <button onClick={() => setActiveTab("statistics")} id="statistics-tab" data-tabs-target="#statistics" type="button" role="tab" aria-controls="statistics" aria-selected="false" className="inline-block p-4 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300">other</button>
                </li>
            </ul>
            <div id="defaultTabContent">
                <div className={` p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800 ${activeTab === "about" ? "block" : "hidden"}`} id="about" role="tabpanel" aria-labelledby="about-tab">
                    <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">{post?.title || "Loading..."}</h2>
                    <p className="mb-3"><b>Category: {post?.category || "No category available"}</b></p>
                    <p className="mb-3 text-gray-500 dark:text-gray-400">{post?.content || "Content unavailable"}</p>
                </div>
                <div className={`${activeTab === "services" ? "block" : "hidden"} p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800 `} id="services" role="tabpanel" aria-labelledby="services-tab">
                    <h2 className="mb-5 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">AI Summary & Feedback</h2>
                    <ul role="list" className="space-y-4 text-gray-500 dark:text-gray-400">
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
                                    <div className="mt-4 p-3 bg-gray-100 rounded">
                                        <p>{aiFeedback}</p>
                                    </div>
                                )
                            )}
                        </li>
                    </ul>
                </div>
                <div className={` ${activeTab === "statistics" ? "block" : "hidden"} p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800 `} id="statistics" role="tabpanel" aria-labelledby="statistics-tab">
                    <dl className="grid max-w-screen-xl grid-cols-2 gap-8 p-4 mx-auto text-gray-900 sm:grid-cols-3 xl:grid-cols-6 dark:text-white sm:p-8">
                        <div className="flex flex-col">
                            <dt className="mb-2 text-3xl font-extrabold">73M+</dt>
                            <dd className="text-gray-500 dark:text-gray-400">Developers</dd>
                        </div>
                        <div className="flex flex-col">
                            <dt className="mb-2 text-3xl font-extrabold">100M+</dt>
                            <dd className="text-gray-500 dark:text-gray-400">Public repositories</dd>
                        </div>
                        <div className="flex flex-col">
                            <dt className="mb-2 text-3xl font-extrabold">1000s</dt>
                            <dd className="text-gray-500 dark:text-gray-400">Open source projects</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    )
}
export default DisplayPosts;