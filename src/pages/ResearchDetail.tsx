import { ArrowLeft, Calendar, Download, Eye, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Skeleton } from '../components/Skeleton';
import { getResearchById } from '../services/firebase';

interface Research {
  id: string;
  title: string;
  content: string;
  category: string;
  authorName: string;
  authorPhoto?: string;
  documentURL?: string;
  documentName?: string;
  documentSize?: number;
  createdAt?: any;
  views?: number;
}

const ResearchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [research, setResearch] = useState<Research | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResearch = async () => {
      if (!id) return;
      
      try {
        const researchData = await getResearchById(id);
        setResearch(researchData);
      } catch (error: any) {
        setError(error.message || 'Failed to load research');
      } finally {
        setLoading(false);
      }
    };

    fetchResearch();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 animate-pulse">
        {/* Back button skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <Skeleton width="24px" height="24px" />
          <Skeleton width="100px" height="20px" />
        </div>

        {/* Category badge skeleton */}
        <Skeleton width="140px" height="28px" className="rounded-full mb-4" />

        {/* Title skeleton */}
        <Skeleton width="70%" height="36px" className="mb-6" />

        {/* Author info skeleton */}
        <div className="flex items-center gap-4 mb-6">
          <Skeleton width="48px" height="48px" className="rounded-full" />
          <div className="flex-1">
            <Skeleton width="150px" height="20px" className="mb-1" />
            <div className="flex items-center gap-4">
              <Skeleton width="100px" height="16px" />
              <Skeleton width="80px" height="16px" />
            </div>
          </div>
        </div>

        {/* Document section skeleton */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <Skeleton width="200px" height="20px" className="mb-2" />
          <Skeleton width="100%" height="48px" className="rounded-lg" />
        </div>

        {/* Content skeleton */}
        <div className="space-y-3">
          <Skeleton width="100%" height="20px" />
          <Skeleton width="95%" height="20px" />
          <Skeleton width="85%" height="20px" />
          <Skeleton width="90%" height="20px" />
          <Skeleton width="80%" height="20px" />
          <Skeleton width="95%" height="20px" />
          <Skeleton width="85%" height="20px" />
        </div>
      </div>
    );
  }

  if (error || !research) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Research Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The research you are looking for does not exist.'}</p>
          <Link to="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
      {/* Header */}
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="flex items-center justify-between mb-4">
          <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full">
            {research.category}
          </span>
          <div className="flex items-center text-gray-500 text-sm">
            <Eye className="h-4 w-4 mr-1" />
            {research.views || 0} views
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{research.title}</h1>
        
        {/* Author Info */}
        <div className="flex items-center space-x-4 mb-6">
          {research.authorPhoto && (
            <img 
              src={research.authorPhoto} 
              alt={research.authorName}
              className="w-12 h-12 rounded-full"
            />
          )}
          <div>
            <div className="flex items-center text-gray-700">
              <User className="h-4 w-4 mr-2" />
              <span className="font-medium">{research.authorName || 'Anonymous'}</span>
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                {research.createdAt?.toDate?.()?.toLocaleDateString() || 'Recent'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Document Download */}
      {research.documentURL && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Research Document</h3>
              <p className="text-sm text-gray-600">
                {research.documentName ? `${research.documentName}` : 'Download the research document'}
                {research.documentSize && ` (${Math.round(research.documentSize / 1024)}KB)`}
              </p>
            </div>
            {research.documentURL.startsWith('data:') ? (
              <a
                href={research.documentURL}
                download={research.documentName || 'research-document'}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </a>
            ) : (
              <a
                href={research.documentURL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                View Document
              </a>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="prose max-w-none">
        <h2 className="text-xl font-semibold mb-4">Abstract</h2>
        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
          {research.content}
        </div>
      </div>

      {/* AI Analysis Section - Placeholder for future implementation */}
      <div className="mt-8 border-t pt-8">
        <h3 className="text-xl font-semibold mb-4">AI Analysis</h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            🤖 AI-powered research analysis coming soon! This feature will provide insights, 
            summaries, and answer questions about this research paper.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResearchDetail;
