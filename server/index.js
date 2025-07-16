import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quora-clone')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Question Schema
const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [{
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
  }],
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const Question = mongoose.model('Question', questionSchema);

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Question Routes
app.get('/api/questions', async (req, res) => {
  try {
    const { sort = 'recent' } = req.query;
    let sortOption = {};

    if (sort === 'popular') {
      sortOption = { upvotes: -1 };
    } else {
      sortOption = { createdAt: -1 };
    }

    const questions = await Question.find()
      .populate('author', 'username')
      .populate('answers.author', 'username')
      .sort(sortOption);

    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/questions/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username')
      .populate('answers.author', 'username');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/questions', authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;

    const question = new Question({
      title,
      content,
      author: req.user.id,
    });

    await question.save();
    await question.populate('author', 'username');

    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/questions/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { voteType } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const userId = req.user.id;

    // Remove existing votes
    question.upvotes = question.upvotes.filter(id => id.toString() !== userId);
    question.downvotes = question.downvotes.filter(id => id.toString() !== userId);

    // Add new vote
    if (voteType === 'upvote') {
      question.upvotes.push(userId);
    } else if (voteType === 'downvote') {
      question.downvotes.push(userId);
    }

    await question.save();
    res.json({ message: 'Vote recorded' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/questions/:id/answers', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answer = {
      content,
      author: req.user.id,
      upvotes: [],
      downvotes: [],
      createdAt: new Date(),
    };

    question.answers.push(answer);
    await question.save();
    await question.populate('answers.author', 'username');

    res.status(201).json(answer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/questions/:questionId/answers/:answerId/vote', authenticateToken, async (req, res) => {
  try {
    const { voteType } = req.body;
    const question = await Question.findById(req.params.questionId);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answer = question.answers.id(req.params.answerId);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const userId = req.user.id;

    // Remove existing votes
    answer.upvotes = answer.upvotes.filter(id => id.toString() !== userId);
    answer.downvotes = answer.downvotes.filter(id => id.toString() !== userId);

    // Add new vote
    if (voteType === 'upvote') {
      answer.upvotes.push(userId);
    } else if (voteType === 'downvote') {
      answer.downvotes.push(userId);
    }

    await question.save();
    res.json({ message: 'Vote recorded' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// User Routes
app.get('/api/users/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const questionsCount = await Question.countDocuments({ author: userId });
    const answersCount = await Question.aggregate([
      { $unwind: '$answers' },
      { $match: { 'answers.author': new mongoose.Types.ObjectId(userId) } },
      { $count: 'total' }
    ]);

    const totalUpvotes = await Question.aggregate([
      { $match: { author: new mongoose.Types.ObjectId(userId) } },
      { $project: { upvoteCount: { $size: '$upvotes' } } },
      { $group: { _id: null, total: { $sum: '$upvoteCount' } } }
    ]);

    res.json({
      questionsCount,
      answersCount: answersCount[0]?.total || 0,
      totalUpvotes: totalUpvotes[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/users/questions', authenticateToken, async (req, res) => {
  try {
    const questions = await Question.find({ author: req.user.id })
      .populate('author', 'username')
      .populate('answers.author', 'username')
      .sort({ createdAt: -1 });

    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search Route
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query required' });
    }

    const questions = await Question.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } }
      ]
    })
      .populate('author', 'username')
      .populate('answers.author', 'username')
      .sort({ createdAt: -1 });

    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});