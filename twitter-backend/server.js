const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://asmeet0011:Ashmeet2003@twitter.xvbis4s.mongodb.net/twitter?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define tweet schema
const tweetSchema = new mongoose.Schema({
  content: { type: String, required: true },
  imageUrl: String
});

const Tweet = mongoose.model('Tweet', tweetSchema);

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer setup for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Route to handle tweet submission
app.post('/api/tweets', upload.single('image'), async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    console.log('Received file:', req.file);

    if (!req.body.content) {
      console.error('Content is required');
      return res.status(400).json({ error: 'Content is required' });
    }

    const { content } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newTweet = new Tweet({
      content,
      imageUrl
    });

    const savedTweet = await newTweet.save();
    console.log('Tweet saved:', savedTweet);

    res.status(201).json(savedTweet);
  } catch (err) {
    console.error('Error saving tweet:', err);
    res.status(500).json({ error: 'Error saving tweet' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
