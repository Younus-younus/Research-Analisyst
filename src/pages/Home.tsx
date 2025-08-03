import { Beaker, Brain, HeartPulse, Telescope } from 'lucide-react';
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';


const Home = () => {
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const API_BASE_URL = "http://localhost:1000";

  useEffect(() => {
    fetch(`${API_BASE_URL}/posts`)
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((error) => console.error("Error fetching posts:", error));
  }, []);
  const handleSearch = async () => {
    if (!query.trim()) {  // 🔹 Prevents sending an empty query
      console.error("Search query is empty");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/search?query=${query}`);
      const data = await response.json();
      setResults(data);
      navigate("/search-results", { state: { results: data, query } });
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Share Your Research with the World
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Connect with researchers, doctors, and scientists. Share your findings and discover groundbreaking research.
        </p>
      </section>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <button onClick={() => { setQuery("LABORATORY"); handleSearch() }}>
          <div className="bg-white p-6 rounded-lg shadow-md hover:bg-blue-100">
            <Beaker className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Laboratory Researchers</h3>
            <p className="text-gray-600">Find your researchers on laboratory findings and experimental results</p>
          </div>
        </button>
        <button onClick={() => { setQuery("NEUROSCIENCE"); handleSearch() }}>
          <div className="bg-white p-6 rounded-lg shadow-md hover:bg-blue-100">
            <Brain className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Neuroscience</h3>
            <p className="text-gray-600">Find your researchers on breakthrough discoveries in brain research</p>
          </div>
        </button>
        <button onClick={() => { setQuery("MEDICAL"); handleSearch() }}>
          <div className="bg-white p-6 rounded-lg shadow-md hover:bg-blue-100">
            <HeartPulse className="h-12 w-12 text-red-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Medical Studies</h3>
            <p className="text-gray-600">Find your researchers on the latest medical research and clinical trials</p>
          </div>
        </button>
        <button onClick={() => { setQuery("SPACE_RESEARCH"); handleSearch() }}>
          <div className="bg-white p-6 rounded-lg shadow-md hover:bg-blue-100">
            <Telescope className="h-12 w-12 text-indigo-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Space Researchers</h3>
            <p className="text-gray-600">Find your researchers on new findings in astronomy and space science</p>
          </div>
        </button>
      </div>

      <section className="bg-white rounded-lg shadow-md p-8 ">
      <div className="space-y-6 content-center">
          {/* <p className="text-gray-600 text-center">Login or register to view and share research posts.</p> */}
          <Link to="/create-post" className="w-40 h-10 px-5 py-5 rounded bg-indigo-500  items-center  text-white text-base font-medium">Share Your Research's</Link>
          <br />
          <br />
          <br />
        </div>
        {posts.length === 0 ? (
          <>
            <p>No research's.</p>
          </>

        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6">Latest Research Posts</h2>
            <div className='grid md:grid-cols-2 lg:grid-cols-2 gap-8'>
              {posts.map((post) => (
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
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Home;