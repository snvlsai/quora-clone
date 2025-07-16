import React, { useState, useEffect } from 'react';
import { User, Calendar, MessageCircle, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import QuestionCard from '../components/QuestionCard';

interface UserStats {
  questionsCount: number;
  answersCount: number;
  totalUpvotes: number;
}

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

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats>({ questionsCount: 0, answersCount: 0, totalUpvotes: 0 });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    try {
      const [statsResponse, questionsResponse] = await Promise.all([
        axios.get('/api/users/stats'),
        axios.get('/api/users/questions'),
      ]);
      
      setStats(statsResponse.data);
      setQuestions(questionsResponse.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="card mb-8">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{user.username}</h1>
            <p className="text-gray-600 mb-4">{user.email}</p>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Member since {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600 mb-2">
            {stats.questionsCount}
          </div>
          <div className="text-gray-600">Questions Asked</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">
            {stats.answersCount}
          </div>
          <div className="text-gray-600">Answers Given</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2 flex items-center justify-center space-x-1">
            <ChevronUp className="w-6 h-6" />
            <span>{stats.totalUpvotes}</span>
          </div>
          <div className="text-gray-600">Total Upvotes</div>
        </div>
      </div>

      {/* User's Questions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>Your Questions</span>
          </h2>
        </div>

        {questions.length === 0 ? (
          <div className="card text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No questions yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start engaging with the community by asking your first question!
            </p>
            <button
              onClick={() => navigate('/ask')}
              className="btn-primary"
            >
              Ask Your First Question
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question) => (
              <QuestionCard key={question._id} question={question} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;