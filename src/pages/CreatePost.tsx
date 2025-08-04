import React, { useContext, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from "../context/AuthContext";
import { createResearchPost } from '../services/firebase';

const CreatePost = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [document, setDocument] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const authContext = useContext(AuthContext);
  const { isLoggedIn } = authContext!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!title || !category || !content) {
      setError("Title, category, and content are required.");
      setLoading(false);
      return;
    }

    try {
      const postData = {
        title,
        content,
        category: category.toUpperCase()
      };

      await createResearchPost(postData, document || undefined);
      
      navigate("/");
    } catch (error: any) {
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return isLoggedIn ? (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold mb-6">Create Research Post</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Research Title *
          </label>
          <input 
            type="text" 
            id="title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
            placeholder="Enter a descriptive title for your research"
            required 
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Research Category *
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
            <option value="space_research">Space Research</option>
            <option value="computer_science">Computer Science</option>
            <option value="biology">Biology</option>
            <option value="chemistry">Chemistry</option>
            <option value="physics">Physics</option>
            <option value="environmental">Environmental Science</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Research Description/Abstract *
          </label>
          <textarea 
            id="content" 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            rows={8} 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
            placeholder="Provide a detailed description of your research, methodology, findings, and conclusions..."
            required 
          />
        </div>

        <div>
          <label htmlFor="document" className="block text-sm font-medium text-gray-700">
            Upload Research Document (Optional)
          </label>
          <input 
            type="file" 
            id="document" 
            accept=".pdf,.doc,.docx,.txt" 
            onChange={(e) => setDocument(e.target.files?.[0] || null)} 
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="mt-1 text-sm text-gray-500">
            📁 Upload documents up to 10MB using Cloudinary storage. Supported formats: PDF, DOC, DOCX, TXT
          </p>
          <p className="mt-1 text-xs text-gray-400">
            ✅ Free Cloudinary hosting | 📤 For larger files, use Google Drive/Dropbox and include links in content
          </p>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          {loading ? 'Publishing Research...' : 'Publish Research'}
        </button>
      </form>
    </div>
  ) : (
    <Navigate to="/login" />
  );
};

export default CreatePost;
