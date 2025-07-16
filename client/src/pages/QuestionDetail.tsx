import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, User, Clock, MessageCircle } from 'lucide-react';
import axios from 'axios';
import AnswerCard from '../components/AnswerCard';
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

const QuestionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [votes, setVotes] = useState({ upvotes: 0, downvotes: 0 });
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);

  useEffect(() => {
    if (id) {
      fetchQuestion();
    }
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const response = await axios.get(`/api/questions/${id}`);
      setQuestion(response.data);
      setVotes({
        upvotes: response.data.upvotes.length,
        downvotes: response.data.downvotes.length,
      });
    } catch (error) {
      console.error('Error fetching question:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await axios.post(`/api/questions/${id}/vote`, {
        voteType,
      });

      if (userVote === voteType) {
        // Remove vote
        setVotes(prev => ({
          ...prev,
          [voteType === 'upvote' ? 'upvotes' : 'downvotes']: prev[voteType === 'upvote' ? 'upvotes' : 'downvotes'] - 1,
        }));
        setUserVote(null);
      } else {
        // Add new vote or change vote
        setVotes(prev => {
          const newVotes = { ...prev };
          if (userVote) {
            // Remove previous vote
            newVotes[userVote === 'upvote' ? 'upvotes' : 'downvotes']--;
          }
          // Add new vote
          newVotes[voteType === 'upvote' ? 'upvotes' : 'downvotes']++;
          return newVotes;
        });
        setUserVote(voteType);
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setSubmittingAnswer(true);
    try {
      await axios.post(`/api/questions/${id}/answers`, {
        content: answerContent,
      });
      setAnswerContent('');
      fetchQuestion(); // Refresh to show new answer
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Question not found</h2>
        <p className="text-gray-600">The question you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Question */}
      <div className="card mb-8">
        <div className="flex space-x-4">
          {/* Voting Section */}
          <div className="flex flex-col items-center space-y-1">
            <button
              onClick={() => handleVote('upvote')}
              className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                userVote === 'upvote' ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              <ChevronUp className="w-6 h-6" />
            </button>
            <span className="text-lg font-medium text-gray-700">
              {votes.upvotes - votes.downvotes}
            </span>
            <button
              onClick={() => handleVote('downvote')}
              className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                userVote === 'downvote' ? 'text-red-600' : 'text-gray-500'
              }`}
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>

          {/* Question Content */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {question.title}
            </h1>
            <p className="text-gray-800 mb-6 whitespace-pre-wrap">
              {question.content}
            </p>

            {/* Question Meta */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{question.author.username}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(question.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-4 h-4" />
                <span>{question.answers.length} answers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answer Form */}
      {user ? (
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
          <form onSubmit={handleSubmitAnswer}>
            <textarea
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              rows={6}
              className="input-field resize-none mb-4"
              placeholder="Write your answer here. Be helpful and provide detailed explanations."
              required
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingAnswer || !answerContent.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingAnswer ? 'Submitting...' : 'Submit Answer'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card mb-8 text-center">
          <p className="text-gray-600 mb-4">
            Please sign in to answer this question
          </p>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary"
          >
            Sign In
          </button>
        </div>
      )}

      {/* Answers */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          {question.answers.length} {question.answers.length === 1 ? 'Answer' : 'Answers'}
        </h3>
        
        {question.answers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No answers yet. Be the first to answer!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {question.answers.map((answer) => (
              <AnswerCard
                key={answer._id}
                answer={answer}
                questionId={question._id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDetail;