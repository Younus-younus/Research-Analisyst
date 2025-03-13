import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const CreatePost = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  const { isLoggedIn } = useContext(AuthContext);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:1000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Reset error state
  
    if (!title || !category || !content) {
      setError("All fields are required.");
      return;
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`, // Send token in Authorization header
      },
        body: JSON.stringify({
          title,
          content,
          category: category.toUpperCase(),
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to create post");
      }
  
      const data = await response.json();
      console.log("Post created:", data);
  
      // Navigate to another page (e.g., post list or details page)
      navigate("/");
  
    } catch (error: any) {
      setError(error.message || "Something went wrong");
    }
  };
  

  return  isLoggedIn ?(
    <div className="max-w-2xl mx-auto bg-w1hite rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold mb-6">Create Research Post</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Select a category</option>
            <option value="laboratory">Laboratory Research</option>
            <option value="neuroscience">Neuroscience</option>
            <option value="medical">Medical Studies</option>
            <option value="SPACE_RESEARCH">Space_Research</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Post
        </button>
      </form>
    </div>
  ) : (
    <Navigate to="/login" />
);
};

export default CreatePost;