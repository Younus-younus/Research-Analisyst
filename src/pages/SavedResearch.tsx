import { Bookmark, Calendar, Eye, Microscope, User } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '../components/Skeleton';
import { AuthContext } from '../context/AuthContext';
import { getSavedResearches } from '../services/firebase';

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

const SavedResearch = () => {
  const [savedResearches, setSavedResearches] = useState<Research[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const authContext = useContext(AuthContext);
  const { user } = authContext!;

  useEffect(() => {
    const fetchSavedResearches = async () => {
      if (!user) {
        setError('Please login to view saved research');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const researches = await getSavedResearches(user.uid);
        setSavedResearches(researches);
      } catch (error: any) {
        console.error('Error fetching saved researches:', error);
        setError(error.message || 'Failed to load saved research');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedResearches();
  }, [user]);

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substr(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-3 mb-8">
              <Bookmark className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Saved Research</h1>
            </div>
            
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="flex space-x-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Microscope className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link 
            to="/login-firebase" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-8">
            <Bookmark className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Saved Research</h1>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {savedResearches.length} saved
            </span>
          </div>

          {savedResearches.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark className="h-24 w-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Saved Research Yet</h2>
              <p className="text-gray-600 mb-6">
                Start saving interesting research papers to build your personal collection.
              </p>
              <Link 
                to="/" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
              >
                <Microscope className="h-5 w-5" />
                <span>Explore Research</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {savedResearches.map((research) => (
                <div 
                  key={research.id} 
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <Link 
                        to={`/research/${research.id}`}
                        className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors leading-tight"
                      >
                        {research.title}
                      </Link>
                      
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          <span>{research.authorName || 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>
                            {research.createdAt?.toDate?.()?.toLocaleDateString() || 'Recent'}
                          </span>
                        </div>
                        {research.views && (
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            <span>{research.views} views</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                      {research.category}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {truncateContent(research.content)}
                  </p>

                  <div className="flex justify-between items-center">
                    <Link
                      to={`/research/${research.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline"
                    >
                      Read Full Research →
                    </Link>
                    
                    <div className="flex items-center text-green-600 text-sm">
                      <Bookmark className="h-4 w-4 mr-1 fill-current" />
                      <span>Saved</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedResearch;
