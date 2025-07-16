import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronUp, ChevronDown, MessageCircle, User, Clock } from 'lucide-react';
import axios from 'axios';

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

interface QuestionCardProps {
  question: Question;
  onVote?: (questionId: string, voteType: 'upvote' | 'downvote') => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onVote }) => {
  const [votes, setVotes] = useState({
    upvotes: question.upvotes.length,
    downvotes: question.downvotes.length,
  });
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    try {
      await axios.post(`/api/questions/${question._id}/vote`, {
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

      if (onVote) {
        onVote(question._id, voteType);
      }
    } catch (error) {
      console.error('Error voting:', error);
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

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex space-x-4">
        {/* Voting Section */}
        <div className="flex flex-col items-center space-y-1">
          <button
            onClick={() => handleVote('upvote')}
            className={`p-1 rounded-full hover:bg-gray-100 transition-colors ${
              userVote === 'upvote' ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-gray-700">
            {votes.upvotes - votes.downvotes}
          </span>
          <button
            onClick={() => handleVote('downvote')}
            className={`p-1 rounded-full hover:bg-gray-100 transition-colors ${
              userVote === 'downvote' ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Question Content */}
        <div className="flex-1">
          <Link
            to={`/question/${question._id}`}
            className="block hover:text-primary-600 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {question.title}
            </h3>
            <p className="text-gray-600 mb-3 line-clamp-3">
              {question.content}
            </p>
          </Link>

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
            <Link
              to={`/question/${question._id}`}
              className="flex items-center space-x-1 hover:text-primary-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{question.answers.length} answers</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;