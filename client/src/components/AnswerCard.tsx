import React, { useState } from 'react';
import { ChevronUp, ChevronDown, User, Clock } from 'lucide-react';
import axios from 'axios';

interface Answer {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
  };
  createdAt: string;
  upvotes: string[];
  downvotes: string[];
}

interface AnswerCardProps {
  answer: Answer;
  questionId: string;
}

const AnswerCard: React.FC<AnswerCardProps> = ({ answer, questionId }) => {
  const [votes, setVotes] = useState({
    upvotes: answer.upvotes.length,
    downvotes: answer.downvotes.length,
  });
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    try {
      await axios.post(`/api/questions/${questionId}/answers/${answer._id}/vote`, {
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
      console.error('Error voting on answer:', error);
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
    <div className="card">
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

        {/* Answer Content */}
        <div className="flex-1">
          <p className="text-gray-800 mb-4 whitespace-pre-wrap">
            {answer.content}
          </p>

          {/* Answer Meta */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>{answer.author.username}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatDate(answer.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerCard;