import { AlertTriangle, ArrowLeft, Bookmark, BookmarkCheck, Calendar, CheckCircle, Download, Eye, MessageCircle, Send, Trash2, User, X, XCircle } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Skeleton } from '../components/Skeleton';
import { AuthContext } from '../context/AuthContext';
import { addComment, checkIfResearchSaved, deleteComment, getCommentsByResearchId, getResearchById, saveResearch, unsaveResearch } from '../services/firebase';

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

interface Comment {
  id: string;
  researchId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  createdAt?: any;
  updatedAt?: any;
}

const ResearchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [research, setResearch] = useState<Research | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState('');
  
  // Professional confirmation and notification states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [deletingComment, setDeletingComment] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Save/bookmark states
  const [isSaved, setIsSaved] = useState(false);
  const [savingResearch, setSavingResearch] = useState(false);
  
  const authContext = useContext(AuthContext);
  const { isLoggedIn, user } = authContext!

  // Auto-hide toast notifications
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000); // Hide after 4 seconds
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  useEffect(() => {
    const fetchResearch = async () => {
      if (!id) return;
      
      try {
        const researchData = await getResearchById(id);
        setResearch(researchData);
        
        // Fetch comments after research is loaded
        await fetchComments();
      } catch (error: any) {
        setError(error.message || 'Failed to load research');
      } finally {
        setLoading(false);
      }
    };

    fetchResearch();
  }, [id]);

  // Check if research is saved by current user
  useEffect(() => {
    const checkSaveStatus = async () => {
      if (user && id) {
        try {
          const saved = await checkIfResearchSaved(user.uid, id);
          setIsSaved(saved);
        } catch (error) {
          console.error('Error checking save status:', error);
        }
      }
    };

    checkSaveStatus();
  }, [user, id]);

  const fetchComments = async () => {
    if (!id) return;
    
    try {
      setCommentsLoading(true);
      const commentsData = await getCommentsByResearchId(id);
      setComments(commentsData);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;

    try {
      setSubmittingComment(true);
      await addComment(id, newComment);
      setNewComment('');
      await fetchComments(); // Refresh comments
      showToast('Comment posted successfully!', 'success');
    } catch (error: any) {
      console.error('Error adding comment:', error);
      showToast(error.message || 'Failed to add comment', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setCommentToDelete(commentId);
    setShowDeleteConfirm(true);
  };

  // Professional save functionality
  const handleSaveToggle = async () => {
    if (!user) {
      showToast('Please login to save research', 'error');
      return;
    }

    setSavingResearch(true);
    try {
      if (isSaved) {
        await unsaveResearch(user.uid, id!);
        setIsSaved(false);
        showToast('Research removed from saved items', 'success');
      } else {
        await saveResearch(user.uid, id!);
        setIsSaved(true);
        showToast('Research saved successfully!', 'success');
      }
    } catch (error) {
      console.error('Error toggling save status:', error);
      showToast('Failed to update save status', 'error');
    } finally {
      setSavingResearch(false);
    }
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      setDeletingComment(true);
      await deleteComment(commentToDelete);
      await fetchComments(); // Refresh comments
      showToast('Comment deleted successfully!', 'success');
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      showToast(error.message || 'Failed to delete comment', 'error');
    } finally {
      setDeletingComment(false);
      setShowDeleteConfirm(false);
      setCommentToDelete(null);
    }
  };

  const cancelDeleteComment = () => {
    setShowDeleteConfirm(false);
    setCommentToDelete(null);
  };

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
        
        {/* Header with Author Info and Save Button */}
        <div className="flex items-center justify-between mb-6">
          {/* Author Info */}
          <div className="flex items-center space-x-4">
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

          {/* Save Button */}
          {isLoggedIn && (
            <button
              onClick={handleSaveToggle}
              disabled={savingResearch}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${isSaved 
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
                ${savingResearch ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                border border-gray-200 shadow-sm
              `}
            >
              {savingResearch ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  {isSaved ? (
                    <BookmarkCheck className="h-4 w-4" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </>
              )}
            </button>
          )}
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

      {/* Comments Section */}
      <div className="mt-8 border-t pt-8">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="h-5 w-5 text-gray-600" />
          <h3 className="text-xl font-semibold">Discussion ({comments.length})</h3>
        </div>

        {/* Add Comment Form */}
        {isLoggedIn ? (
          <form onSubmit={handleSubmitComment} className="mb-8">
            <div className="flex items-start gap-4">
              {user?.photoURL && (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'User'}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts on this research..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                  required
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-center">
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
              {' '}to join the discussion and share your thoughts on this research.
            </p>
          </div>
        )}

        {/* Comments List */}
        {commentsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-1"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-4">
                {comment.authorPhoto ? (
                  <img 
                    src={comment.authorPhoto} 
                    alt={comment.authorName}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900">{comment.authorName}</span>
                    <span className="text-sm text-gray-500">
                      {comment.createdAt?.toDate?.()?.toLocaleDateString() || 'Just now'}
                    </span>
                    {user?.uid === comment.authorId && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="ml-auto text-red-500 hover:text-red-700 p-1"
                        title="Delete comment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Professional Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-200"
          onClick={cancelDeleteComment}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl transform animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Delete Comment</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this comment? This will permanently remove it from the discussion.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDeleteComment}
                disabled={deletingComment}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteComment}
                disabled={deletingComment}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deletingComment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Professional Toast Notifications */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg max-w-md transform animate-in slide-in-from-top-2 duration-300 ${
            toast.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex-shrink-0">
              {toast.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <p className="font-medium">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="ml-auto flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchDetail;
