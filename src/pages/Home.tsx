import { Beaker, Brain, HeartPulse, Telescope } from 'lucide-react';
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";

const Home = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((error) => console.error("Error fetching posts:", error));
  }, []);

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
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Beaker className="h-12 w-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Laboratory Research</h3>
          <p className="text-gray-600">Share your latest laboratory findings and experimental results</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Brain className="h-12 w-12 text-purple-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Neuroscience</h3>
          <p className="text-gray-600">Explore breakthrough discoveries in brain research</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <HeartPulse className="h-12 w-12 text-red-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Medical Studies</h3>
          <p className="text-gray-600">Access the latest medical research and clinical trials</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Telescope className="h-12 w-12 text-indigo-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Space Research</h3>
          <p className="text-gray-600">Discover new findings in astronomy and space science</p>
        </div>
      </div>

      <section className="bg-white rounded-lg shadow-md p-8">
      {posts.length === 0 ? (
  <p>No research's.</p>
) : (
  <>
    <h2 className="text-2xl font-bold mb-6">Latest Research Posts</h2>
    {posts.map((post) => (
      <Link
        key={post.id}
        to={`/posts/${post.id}`}
        className="block max-w-sm p-6 -200 rounded-lg bg-white shadow-md bg-blue-50 hover:bg-blue-100"
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

        <div className="space-y-6 content-center">
          <br />
          <br />
          {/* <p className="text-gray-600 text-center">Login or register to view and share research posts.</p> */}
          <Link to="/create-post" className="w-40 h-10 px-5 py-5 rounded bg-indigo-500  items-center  text-white text-base font-medium">Share Your Research's</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;