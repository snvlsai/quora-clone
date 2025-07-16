import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp } from 'lucide-react';
import axios from 'axios';
import QuestionCard from '../components/QuestionCard';
import { useAuth } from '../contexts/AuthContext';

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

const Home: React.FC = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  useEffect(() => {
    fetchQuestions();
  }, [sortBy]);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`/api/questions?sort=${sortBy}`);
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = (questionId: string, voteType: 'upvote' | 'downvote') => {
    // Optimistic update handled in QuestionCard component
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Quora Clone
          </h1>
          <p className="text-gray-600">
            Discover questions, share knowledge, and learn from others
          </p>
        </div>
        {user && (
          <Link
            to="/ask"
            className="mt-4 sm:mt-0 flex items-center space-x-2 btn-primary"
          >
            <Plus className="w-5 h-5" />
            <span>Ask Question</span>
          </Link>
        )}
      </div>

      {/* Sort Options */}
      <div className="flex items-center space-x-4 mb-6">
        <span className="text-sm font-medium text-gray-700">Sort by:</span>
        <div className="flex space-x-2">
          <button
            onClick={() => setSortBy('recent')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              sortBy === 'recent'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setSortBy('popular')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center space-x-1 ${
              sortBy === 'popular'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Popular</span>
          </button>
        </div>
      </div>

      {/* Questions Feed */}
      {questions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No questions yet
          </h3>
          <p className="text-gray-600 mb-6">
            Be the first to ask a question and start the conversation!
          </p>
          {user && (
            <Link to="/ask" className="btn-primary">
              Ask the First Question
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((question) => (
            <QuestionCard
              key={question._id}
              question={question}
              onVote={handleVote}
            />
          ))}
        </div>
      )}

      {/* Call to Action for Non-Users */}
      {!user && questions.length > 0 && (
        <div className="mt-12 text-center py-8 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Join the Community
          </h3>
          <p className="text-gray-600 mb-4">
            Sign up to ask questions, provide answers, and engage with the community
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/register" className="btn-primary">
              Sign Up
            </Link>
            <Link to="/login" className="btn-secondary">
              Login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;