import { useLocation } from "react-router-dom";
import images from "../assets/images.jpg";
import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";


const SearchResults = () => {
    const location = useLocation();
    const { results, query } = location.state || { results: [], query: "" };
    const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:1000";

    return (
        <>
            <h2 className="text-2xl font-bold mb-4">{query} Researchers</h2>
            <div className="p-8 grid md:grid-cols-2 lg:grid-cols-2 gap-8">
                {results.length === 0 ? (
                    <p>No research's found.</p>
                ) : (
                     <>
                        {results.map((post) => (
                          <Link
                            key={post.id}
                            to={`/posts/${post.id}`}
                            className="block max-w-sm p-6 -200 rounded-lg bg-gray-200 shadow-md bg-blue-50 hover:bg-blue-100"
                          >
                            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900  dark:text-black">
                              {post.title}
                            </h5>
                            <p className="font-normal text-gray-400 dark:text-gray-700">
                              <b>Category: {post.category}</b>
                              <br />
                              {post.content.slice(0, 100)}...
                            </p>
                          </Link>
                        ))}
                        </>
                )}
            </div>
        </>
    );
};

export default SearchResults;
