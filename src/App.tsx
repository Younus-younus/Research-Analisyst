import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import { AuthProvider } from "./context/AuthContext";
import CreatePost from './pages/CreatePost';
import DisplayPosts from './pages/DisplayPosts';
import Home from './pages/Home';
import Login from './pages/Login';
import LoginFirebase from './pages/Login_Firebase';
import Register from './pages/Register';
import RegisterFirebase from './pages/Register_Firebase';
import ResearchDetail from './pages/ResearchDetail';
import SavedResearch from './pages/SavedResearch';
import SearchResults from './pages/SearchResult';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/login-firebase" element={<LoginFirebase />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register-firebase" element={<RegisterFirebase />} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route path='/posts/:id' element={<DisplayPosts/>}/>
              <Route path='/research/:id' element={<ResearchDetail/>}/>
              <Route path="/search-results" element={<SearchResults />} />
              <Route path="/saved-research" element={<SavedResearch />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App