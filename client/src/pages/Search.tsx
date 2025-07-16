import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import axios from 'axios';
import QuestionCard from '../components/QuestionCard';

interface Question {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    username: string;
  };
  createdAt: string;
  answers: any[];
  upvotes: string[];
  downvotes: string[];
}

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const searchQuery = searchParams.get('q');
    if (searchQuery) {
      setQuery(searchQuery);
      performSearch(searchQuery);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const response = await axios.get(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      setResults(response.data);
    } catch (error) {
      console.error('Error searching:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query.trim());
      // Update URL without navigation
      window.history.pushState({}, '', `/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Search Questions</h1>
        <form onSubmit={handleSearch} className="relative">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for questions, topics, or keywords..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary"
          >
            Search
          </button>
        </form>
      </div>

      {/* Search Results */}
      {loading ? (
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : hasSearched ? (
        <div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {results.length > 0 
                ? `Found ${results.length} result${results.length === 1 ? '' : 's'} for "${searchParams.get('q')}"`
                : `No results found for "${searchParams.get('q')}"`
              }
            </h2>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-12">
              <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No questions found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search terms or browse popular questions
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>Search tips:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Use different keywords</li>
                  <li>Check your spelling</li>
                  <li>Try more general terms</li>
                  <li>Use fewer words</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {results.map((question) => (
                <QuestionCard key={question._id} question={question} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Search for Questions
          </h3>
          <p className="text-gray-600">
            Enter keywords to find relevant questions and discussions
          </p>
        </div>
      )}
    </div>
  );
};

export default Search;