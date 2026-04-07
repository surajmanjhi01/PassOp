import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import cors from 'cors'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

dotenv.config({ path: fileURLToPath(new URL('./.env', import.meta.url)) })

// Connection URL
const url = process.env.MONGO_URL;
const jwtSecret = process.env.JWT_SECRET || 'dev_secret_change_me';

// Connect to MongoDB using Mongoose
mongoose.connect(url)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Password Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }
}, { timestamps: true });

const passwordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  site: { type: String, required: true, trim: true },
  username: { type: String, required: true, trim: true },
  password: { type: String, required: true, trim: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Password = mongoose.model('Password', passwordSchema);

const app = express()
const port = 3000
app.use(bodyParser.json());
app.use(cors());

const createToken = (userId) => jwt.sign({ userId }, jwtSecret, { expiresIn: '7d' });

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(String(password), 12);
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword
    });

    const token = createToken(user._id);
    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(String(password), user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = createToken(user._id);
    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Login failed' });
  }
});


app.get('/health', (req, res) => {
  res.send('Server is    healthy');
});

//get all the passwords
app.get('/get-passwords', authMiddleware, async (req, res) => {
  try {
    const passwords = await Password.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(passwords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to fetch passwords" });
  }
})

//save the passwords
app.post('/save-password', authMiddleware, async (req, res) => {
  try {
    const { site, username, password } = req.body;
    if (!site || !username || !password) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const passwordDoc = new Password({
      userId: req.userId,
      site: String(site).trim(),
      username: String(username).trim(),
      password: String(password).trim()
    });

    await passwordDoc.save();
    return res.send({ success: true, message: "Password saved successfully", data: passwordDoc });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to save password" });
  }
})

//update password by id
app.put('/update-password/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { site, username, password } = req.body;
    if (!site || !username || !password) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const updated = await Password.findOneAndUpdate(
      { _id: id, userId: req.userId },
      {
        site: String(site).trim(),
        username: String(username).trim(),
        password: String(password).trim()
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Password entry not found' });
    }

    return res.json({ success: true, message: 'Password updated', data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to update password' });
  }
});

//Delete the passwords by id
app.delete("/delete-password/:id", authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Password.deleteOne({ _id: id, userId: req.userId });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Delete failed" });
  }
});

app.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('_id name email');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})
