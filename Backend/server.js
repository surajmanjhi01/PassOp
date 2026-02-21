import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import cors from 'cors'

dotenv.config()

// Connection URL
const url = process.env.MONGO_URL;

// Connect to MongoDB using Mongoose
mongoose.connect(url)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Password Schema
const passwordSchema = new mongoose.Schema({
  site: String,
  username: String,
  password: String
}, { timestamps: true });

const Password = mongoose.model('Password', passwordSchema);

const app = express()
const port = 3000
app.use(bodyParser.json());
app.use(cors());


app.get('/health', (req, res) => {
  res.send('Server is  ok healthy');
});

//get all the passwords
app.get('/get-passwords', async (req, res) => {
  try {
    const passwords = await Password.find({});
    res.json(passwords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to fetch passwords" });
  }
})

//save the passwords
app.post('/save-password', async (req, res) => {
  try {
    const password = new Password(req.body);
    await password.save();
    res.send({ success: true, message: "Password saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to save password" });
  }
})

//Delete the passwords by id
app.delete("/delete-password/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Password.deleteOne({ _id: id });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Delete failed" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})
