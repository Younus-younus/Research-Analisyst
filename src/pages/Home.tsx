import { Beaker, BookOpen, Brain, HeartPulse, Telescope, User } from 'lucide-react';
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ResearchCardSkeleton } from '../components/Skeleton';
import { AuthContext } from '../context/AuthContext';
import { getAllResearches, getResearchesByCategory, getUserResearches, searchResearches } from '../services/firebase';

interface Research {
  id: string;
  title: string;
  content: string;
  category: string;
  authorName: string;
  authorPhoto?: string;
  createdAt?: any;
  views?: number;
}

const Home = () => {
  const [allResearches, setAllResearches] = useState<Research[]>([]);
  const [userResearches, setUserResearches] = useState<Research[]>([]);
  const [showUserResearches, setShowUserResearches] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const { isLoggedIn, user } = authContext!;

  useEffect(() => {
    fetchAllResearches();
    if (user) {
      fetchUserResearches();
    }
  }, [user]);

  // Refresh data when component mounts (e.g., returning from create post page)
  useEffect(() => {
    if (user && showUserResearches) {
      fetchUserResearches();
    }
  }, [showUserResearches]);

  const fetchAllResearches = async () => {
    try {
      setLoading(true);
      const researches = await getAllResearches();
      setAllResearches(researches);
    } catch (error) {
      console.error("Error fetching researches:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserResearches = async () => {
    if (!user) return;
    try {
      const researches = await getUserResearches(user.uid);
      setUserResearches(researches);
    } catch (error) {
      console.error("Error fetching user researches:", error);
    }
  };

  const handleCategorySearch = async (category: string) => {
    try {
      setLoading(true);
      const researches = await getResearchesByCategory(category);
      navigate("/search-results", { state: { results: researches, query: category } });
    } catch (error) {
      console.error("Error fetching category results:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTextSearch = async () => {
    if (!query.trim()) {
      console.error("Search query is empty");
      return;
    }
    try {
      setLoading(true);
      const results = await searchResearches(query);
      navigate("/search-results", { state: { results, query } });
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  };

  const displayResearches = showUserResearches ? userResearches : allResearches;

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

      {/* Search Bar */}
      <section className="max-w-2xl mx-auto">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search research papers, topics, or keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleTextSearch()}
          />
          <button
            onClick={handleTextSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
        </div>
      </section>

      {/* Research Categories */}
      <section>
        <h2 className="text-2xl font-bold text-center mb-8">Browse Research by Category</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <button onClick={() => handleCategorySearch("LABORATORY")}>
            <div className="bg-white p-6 rounded-lg shadow-md hover:bg-blue-100 transition-colors">
              <Beaker className="h-12 w-12 text-blue-600 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Laboratory Research</h3>
              <p className="text-gray-600">Discover breakthrough laboratory findings and experimental results</p>
            </div>
          </button>
          <button onClick={() => handleCategorySearch("NEUROSCIENCE")}>
            <div className="bg-white p-6 rounded-lg shadow-md hover:bg-blue-100 transition-colors">
              <Brain className="h-12 w-12 text-purple-600 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Neuroscience</h3>
              <p className="text-gray-600">Explore cutting-edge discoveries in brain research</p>
            </div>
          </button>
          <button onClick={() => handleCategorySearch("MEDICAL")}>
            <div className="bg-white p-6 rounded-lg shadow-md hover:bg-blue-100 transition-colors">
              <HeartPulse className="h-12 w-12 text-red-600 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Medical Studies</h3>
              <p className="text-gray-600">Access the latest medical research and clinical trials</p>
            </div>
          </button>
          <button onClick={() => handleCategorySearch("SPACE_RESEARCH")}>
            <div className="bg-white p-6 rounded-lg shadow-md hover:bg-blue-100 transition-colors">
              <Telescope className="h-12 w-12 text-indigo-600 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Space Research</h3>
              <p className="text-gray-600">Discover new findings in astronomy and space science</p>
            </div>
          </button>
        </div>
      </section>

      {/* Research Posts Section */}
      <section className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setShowUserResearches(false)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                !showUserResearches ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              All Research
            </button>
            {isLoggedIn && (
              <button
                onClick={() => {
                  setShowUserResearches(true);
                  fetchUserResearches(); // Refresh user research when switching to My Research
                }}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  showUserResearches ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <User className="h-4 w-4" />
                My Research ({userResearches.length})
              </button>
            )}
          </div>
          {isLoggedIn && (
            <Link 
              to="/create-post" 
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Share Your Research
            </Link>
          )}
        </div>

        {loading ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">
              {showUserResearches ? 'Your Research Papers' : 'Latest Research Papers'}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <ResearchCardSkeleton key={index} />
              ))}
            </div>
          </div>
        ) : displayResearches.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">
              {showUserResearches 
                ? "You haven't published any research yet. Start sharing your work!" 
                : "No research papers found."}
            </p>
            {showUserResearches && (
              <Link 
                to="/create-post" 
                className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Publish Your First Research
              </Link>
            )}
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6">
              {showUserResearches ? 'Your Research Papers' : 'Latest Research Papers'}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayResearches.map((research) => (
                <Link
                  key={research.id}
                  to={`/research/${research.id}`}
                  className="block p-6 bg-gray-50 rounded-lg shadow-sm hover:bg-blue-50 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                      {research.category}
                    </span>
                    {research.authorPhoto && (
                      <img 
                        src={research.authorPhoto} 
                        alt={research.authorName}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                  </div>
                  <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 line-clamp-2">
                    {research.title}
                  </h5>
                  <p className="text-sm text-gray-600 mb-2">
                    By {research.authorName || 'Anonymous'}
                  </p>
                  <p className="font-normal text-gray-700 line-clamp-3">
                    {research.content}
                  </p>
                  <div className="mt-4 flex justify-between text-sm text-gray-500">
                    <span>{research.createdAt?.toDate?.()?.toLocaleDateString() || 'Recent'}</span>
                    <span>{research.views || 0} views</span>
                  </div>
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