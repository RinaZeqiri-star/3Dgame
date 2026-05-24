const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const bcrypt = require("bcryptjs");
const User = require("./models/User");
const RecyclePost = require("./models/RecyclePost");

const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const API_BASE_URL = "http://172.20.10.14:5000";

const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
	res.send("API is running...");
});

app.post("/signup", async (req, res) => {
	try {
		const { name, email, password, instagram } = req.body;

		const existingUser = await User.findOne({ email });

		if (existingUser) {
			return res.status(400).json({
				error: "Email already exists",
			});
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const user = new User({
			name,
			email,
			password: hashedPassword,
			instagram,
		});

		await user.save();

		const userData = {
			_id: user._id,
			name: user.name,
			email: user.email,
			instagram: user.instagram,
		};

		res.status(201).json({
			message: "Signup successful",
			user: userData,
		});
	} catch (err) {
		console.log(err);

		res.status(500).json({
			error: "Server error",
		});
	}
});

app.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({
				error: "Invalid email or password",
			});
		}

		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			return res.status(400).json({
				error: "Invalid email or password",
			});
		}

		const userData = {
			_id: user._id,
			name: user.name,
			email: user.email,
			instagram: user.instagram,
		};

		res.json({
			message: "Login successful",
			user: userData,
		});
	} catch (err) {
		console.log(err);

		res.status(500).json({
			error: "Server error",
		});
	}
});

app.post("/upload-recycle-media", upload.array("media", 20), (req, res) => {
	try {
		if (!req.files || req.files.length === 0) {
			return res.status(400).json({
				error: "No media uploaded",
			});
		}

		const mediaUrls = req.files.map((file) => {
			return `${API_BASE_URL}/uploads/${file.filename}`;
		});

		res.json({
			message: "Media uploaded",
			mediaUrls,
		});
	} catch (err) {
		console.log(err);

		res.status(500).json({
			error: "Upload failed",
		});
	}
});

app.post("/remove-background", upload.single("image"), async (req, res) => {
	try {
		console.log("Remove background route called");

		if (!req.file) {
			return res.status(400).json({
				error: "No image uploaded",
			});
		}

		if (!process.env.REMOVE_BG_API_KEY) {
			return res.status(500).json({
				error: "REMOVE_BG_API_KEY is missing",
			});
		}

		const formData = new FormData();

		formData.append("image_file", fs.createReadStream(req.file.path));

		formData.append("size", "auto");

		const response = await axios.post("https://api.remove.bg/v1.0/removebg", formData, {
			headers: {
				...formData.getHeaders(),
				"X-Api-Key": process.env.REMOVE_BG_API_KEY,
			},
			responseType: "arraybuffer",
		});

		fs.unlinkSync(req.file.path);

		res.set("Content-Type", "image/png");

		res.send(response.data);
	} catch (err) {
		console.log("REMOVE BG ERROR:");

		console.log(err.response?.data?.toString() || err.message);

		if (req.file) {
			fs.unlinkSync(req.file.path);
		}

		res.status(500).json({
			error: "Background removal failed",
		});
	}
});

app.post("/recycle-posts", async (req, res) => {
	try {
		const { title, description, mediaUris, username } = req.body;

		if (!title || !description || !mediaUris || mediaUris.length === 0) {
			return res.status(400).json({
				error: "Title, description and media are required",
			});
		}

		const post = new RecyclePost({
			title,
			description,
			mediaUris,
			username,
		});

		await post.save();

		res.status(201).json({
			message: "Recycle post created",
			post,
		});
	} catch (err) {
		console.log(err);

		res.status(500).json({
			error: "Server error",
		});
	}
});

app.get("/recycle-posts", async (req, res) => {
	try {
		const posts = await RecyclePost.find().sort({ createdAt: -1 });

		res.json(posts);
	} catch (err) {
		console.log(err);

		res.status(500).json({
			error: "Server error",
		});
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
