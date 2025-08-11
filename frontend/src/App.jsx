import { useState, useEffect } from "react";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from "axios";
import { FaEdit, FaTrash, FaCode, FaRobot, FaHistory, FaBars, FaTimes, FaGithub } from "react-icons/fa";

function App() {
  const [code, setCode] = useState(`function sum() {\n  return 1 + 1;\n}`);
  const [review, setReview] = useState("");
  const [pastReviews, setPastReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' or 'history'

  useEffect(() => {
    fetchPastReviews();
    // Set initial sidebar state based on screen size
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  async function fetchPastReviews() {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:3000/ai/past-prompts");
      setPastReviews(response.data || []);
    } catch (error) {
      console.error("Error fetching past reviews:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function reviewCode() {
    if (!code.trim()) return;
    
    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:3000/ai/get-review",
        { code }
      );
      setReview(response.data.review || "");
      fetchPastReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateReview(id) {
    try {
      const response = await axios.put(
        `http://localhost:3000/ai/past-prompts/${id}`,
        { code, review }
      );
      setReview(response.data.review);
      fetchPastReviews();
      setSelectedReview(null);
    } catch (error) {
      console.error("Error updating review:", error);
    }
  }

  async function deleteReview(id) {
    try {
      await axios.delete(`http://localhost:3000/ai/past-prompts/${id}`);
      fetchPastReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  }

  function handleEditReview(item) {
    setSelectedReview(item);
    setCode(item.code);
    setReview("");
  }

  function handleCodeReview() {
    setSelectedReview(null);
    setCode("");
    setReview("");
  }

  function handleReviewClick(item) {
    setSelectedReview(item);
    setCode(item.code);
    setReview(item.review);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800/30 backdrop-blur-sm border-b border-gray-700/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <FaCode className="h-8 w-8 text-blue-400" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
                AI Code Reviewer
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/your-repo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <FaGithub className="h-6 w-6" />
              </a>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700/50 focus:outline-none transition-colors duration-200"
              >
                {isSidebarOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed lg:static lg:translate-x-0 w-80 bg-gray-800/30 backdrop-blur-sm border-r border-gray-700/30 transition-transform duration-300 ease-in-out z-40 h-full overflow-hidden flex flex-col`}
        >
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <FaHistory className="h-5 w-5 text-blue-400" />
                <h2 className="ml-2 text-lg font-semibold text-gray-200">Previous Reviews</h2>
              </div>
              <button
                onClick={handleCodeReview}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-1.5 px-3 rounded-lg transition-all duration-200 flex items-center text-sm shadow-lg hover:shadow-blue-500/25"
              >
                <FaCode className="mr-1.5" />
                New
              </button>
            </div>
            <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
              {pastReviews.length > 0 ? (
                pastReviews.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-700/30 backdrop-blur-sm rounded-lg p-3 hover:bg-gray-600/30 transition-all duration-200 border border-gray-600/30 group"
                  >
                    <div className="flex justify-between items-start">
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => handleReviewClick(item)}
                      >
                        <p className="text-sm text-gray-300 truncate font-mono group-hover:text-white transition-colors duration-200">
                          {item.code.substring(0, 50)}...
                        </p>
                      </div>
                      <div className="flex space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => handleEditReview(item)}
                          className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200 p-1 hover:bg-gray-600/50 rounded"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => deleteReview(item.id)}
                          className="text-red-400 hover:text-red-300 transition-colors duration-200 p-1 hover:bg-gray-600/50 rounded"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FaHistory className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No reviews yet</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Code Editor */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-700/30 overflow-hidden shadow-xl">
              <div className="p-4 border-b border-gray-700/30 flex items-center justify-between">
                <div className="flex items-center">
                  <FaCode className="h-5 w-5 text-blue-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-200">Code Editor</h3>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCode('')}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="p-4">
                <Editor
                  value={code}
                  onValueChange={setCode}
                  highlight={(code) =>
                    prism.highlight(
                      code,
                      prism.languages.javascript,
                      "javascript"
                    )
                  }
                  padding={15}
                  style={{
                    fontFamily: '"Fira Code", monospace',
                    fontSize: 14,
                    minHeight: "200px",
                    backgroundColor: "#1a1a1a",
                    color: "#ffffff",
                    borderRadius: "8px",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
                  }}
                />
                <button
                  onClick={reviewCode}
                  disabled={isLoading}
                  className="mt-4 w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25"
                >
                  <FaRobot className="mr-2" />
                  {isLoading ? "Reviewing..." : "Get AI Review"}
                </button>
              </div>
            </div>

            {/* AI Review */}
            {review && (
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-700/30 overflow-hidden shadow-xl">
                <div className="p-4 border-b border-gray-700/30 flex items-center">
                  <FaRobot className="h-5 w-5 text-green-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-200">AI Review</h3>
                </div>
                <div className="p-4">
                  <Markdown
                    className="prose prose-invert max-w-none prose-headings:text-gray-200 prose-p:text-gray-300 prose-strong:text-blue-400 prose-code:text-green-400 prose-pre:bg-gray-900/50 prose-pre:border prose-pre:border-gray-700/50"
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {review}
                  </Markdown>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}

export default App;
