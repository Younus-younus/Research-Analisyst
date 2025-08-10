import { Beaker, BookOpen, Brain, HeartPulse, Search, Telescope, TrendingUp, User } from 'lucide-react';
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

      {/* Professional Search Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Discover Research</h2>
            <p className="text-gray-600">Search thousands of research papers across all scientific disciplines</p>
          </div>
          
          {/* Enhanced Search Bar */}
          <div className="relative max-w-3xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for research papers, topics, authors, or keywords..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-200 focus:border-blue-500 shadow-sm transition-all"
                onKeyPress={(e) => e.key === 'Enter' && handleTextSearch()}
              />
              <button
                onClick={handleTextSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
              >
                Search
              </button>
            </div>
          </div>

          {/* Quick Search Categories */}
          <div className="max-w-3xl mx-auto">
            <p className="text-sm text-gray-500 mb-3 text-center">Quick search by category:</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button 
                onClick={() => handleCategorySearch("LABORATORY")}
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"
              >
                <Beaker className="h-4 w-4 mr-2" />
                Laboratory Research
              </button>
              <button 
                onClick={() => handleCategorySearch("NEUROSCIENCE")}
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600 transition-colors"
              >
                <Brain className="h-4 w-4 mr-2" />
                Neuroscience
              </button>
              <button 
                onClick={() => handleCategorySearch("MEDICAL")}
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
              >
                <HeartPulse className="h-4 w-4 mr-2" />
                Medical Studies
              </button>
              <button 
                onClick={() => handleCategorySearch("SPACE_RESEARCH")}
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-colors"
              >
                <Telescope className="h-4 w-4 mr-2" />
                Space Research
              </button>
            </div>
          </div>

          {/* Search Stats/Info */}
          <div className="flex justify-center items-center gap-6 mt-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>Trending Research</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <span>Updated Daily</span>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <span>Peer-Reviewed Sources</span>
          </div>
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