const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
	res.send("API is running...");
});

app.post('/signup', async (req, res) => {
  try {
    const { name, email, password, instagram } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, instagram });
    await user.save();

    const userData = { _id: user._id, name: user.name, email: user.email, instagram: user.instagram };
    res.status(201).json({ message: 'Signup successful', user: userData });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const userData = { _id: user._id, name: user.name, email: user.email, instagram: user.instagram };
    res.json({ message: 'Login successful', user: userData });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

mongoose
	.connect(process.env.MONGO_URI)
	.then(() => console.log("MongoDB connected"))
	.catch((err) => console.log(err));

const PORT = 5000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
