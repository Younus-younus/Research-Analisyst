import { ArrowLeft, Calendar, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

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

const SearchResults = () => {
    const location = useLocation();
    const { results, query } = location.state || { results: [], query: "" };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6">
                <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                </Link>
                <h2 className="text-3xl font-bold text-gray-900">
                    Search Results for "{query}"
                </h2>
                <p className="text-gray-600 mt-2">
                    Found {results.length} research paper{results.length !== 1 ? 's' : ''}
                </p>
            </div>

            {results.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <div className="max-w-md mx-auto">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Research Found</h3>
                        <p className="text-gray-600 mb-6">
                            We couldn't find any research papers matching your search. Try different keywords or browse by category.
                        </p>
                        <Link 
                            to="/" 
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Browse All Research
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map((research: Research) => (
                        <Link
                            key={research.id}
                            to={`/research/${research.id}`}
                            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
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
                            
                            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                                {research.title}
                            </h3>
                            
                            <div className="flex items-center text-sm text-gray-600 mb-3">
                                <User className="h-4 w-4 mr-1" />
                                <span className="mr-4">{research.authorName || 'Anonymous'}</span>
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>{research.createdAt?.toDate?.()?.toLocaleDateString() || 'Recent'}</span>
                            </div>
                            
                            <p className="text-gray-700 line-clamp-3">
                                {research.content}
                            </p>
                            
                            <div className="mt-4 text-sm text-gray-500">
                                {research.views || 0} views
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchResults;
