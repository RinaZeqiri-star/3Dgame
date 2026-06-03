const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const bcrypt = require("bcryptjs");
const User = require("./models/User");
const RecyclePost = require("./models/RecyclePost");
const Clothing = require("./models/Clothing");

const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const app = express();

app.use(cors());
// Bumped from the 100KB default because clothing items include base64 images
// (snapshot + design) that can easily exceed it.
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static("uploads"));

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
			coins: user.coins,
			totalEarned: user.totalEarned,
			ownedBackgrounds: user.ownedBackgrounds,
			currentBackground: user.currentBackground,
			claimedMilestones: user.claimedMilestones,
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
			coins: user.coins ?? 10,
			totalEarned: user.totalEarned ?? 10,
			ownedBackgrounds: user.ownedBackgrounds ?? [],
			currentBackground: user.currentBackground ?? null,
			claimedMilestones: user.claimedMilestones ?? [],
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

app.post("/coins/add", async (req, res) => {
	try {
		const { userId, amount, reason } = req.body;

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({
				error: "User not found",
			});
		}

		const oldMilestoneCount = Math.floor(user.totalEarned / 50);

		user.coins += amount;
		user.totalEarned += amount;

		const newMilestoneCount = Math.floor(user.totalEarned / 50);
		const milestoneUnlocked = newMilestoneCount > oldMilestoneCount;
		const milestoneNumber = milestoneUnlocked ? newMilestoneCount : null;

		await user.save();

		res.json({
			newBalance: user.coins,
			newTotalEarned: user.totalEarned,
			milestoneUnlocked,
			milestoneNumber,
		});
	} catch (err) {
		console.log(err);

		res.status(500).json({
			error: "Server error",
		});
	}
});

app.post("/backgrounds/buy", async (req, res) => {
	try {
		const { userId, backgroundId, price } = req.body;

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({
				error: "User not found",
			});
		}

		if (user.coins < price) {
			return res.status(400).json({
				error: "Not enough coins",
			});
		}

		if (user.ownedBackgrounds.includes(backgroundId)) {
			return res.status(400).json({
				error: "Already owned",
			});
		}

		user.coins -= price;
		user.ownedBackgrounds.push(backgroundId);

		await user.save();

		const userData = {
			_id: user._id,
			name: user.name,
			email: user.email,
			instagram: user.instagram,
			coins: user.coins,
			totalEarned: user.totalEarned,
			ownedBackgrounds: user.ownedBackgrounds,
			currentBackground: user.currentBackground,
			claimedMilestones: user.claimedMilestones,
		};

		res.json({
			message: "Background purchased",
			user: userData,
		});
	} catch (err) {
		console.log(err);

		res.status(500).json({
			error: "Server error",
		});
	}
});

app.post("/backgrounds/apply", async (req, res) => {
	try {
		const { userId, backgroundId } = req.body;

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({
				error: "User not found",
			});
		}

		if (!user.ownedBackgrounds.includes(backgroundId)) {
			return res.status(400).json({
				error: "Background not owned",
			});
		}

		user.currentBackground = backgroundId;

		await user.save();

		const userData = {
			_id: user._id,
			name: user.name,
			email: user.email,
			instagram: user.instagram,
			coins: user.coins,
			totalEarned: user.totalEarned,
			ownedBackgrounds: user.ownedBackgrounds,
			currentBackground: user.currentBackground,
			claimedMilestones: user.claimedMilestones,
		};

		res.json({
			message: "Background applied",
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
			return `/uploads/${file.filename}`;
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

// Lazy-load the model — saves boot time. First call downloads & caches the
// model (~30 MB) under node_modules/@imgly/background-removal-node, after
// that it's instant.
let removeBgLocal = null;
async function getRemoveBg() {
	if (!removeBgLocal) {
		const mod = await import("@imgly/background-removal-node");
		removeBgLocal = mod.removeBackground;
	}
	return removeBgLocal;
}

app.post("/remove-background", upload.single("image"), async (req, res) => {
	const filePath = req.file?.path;

	try {
		console.log("Remove background route called");

		if (!req.file) {
			return res.status(400).json({ error: "No image uploaded" });
		}

		// Run locally on the server with @imgly/background-removal-node.
		// No API key, no quota, no internet needed after the first run.
		const removeBg = await getRemoveBg();
		const cleanedBlob = await removeBg(filePath);
		const buffer = Buffer.from(await cleanedBlob.arrayBuffer());

		fs.unlinkSync(filePath);

		res.set("Content-Type", "image/png");
		res.set("X-Background-Removed", "true");
		res.send(buffer);
	} catch (err) {
		console.log("=== REMOVE BG ERROR ===");
		console.log(err.message);
		console.log(err.stack);
		console.log("=======================");

		// Fallback: return the original image so the user's flow doesn't break.
		try {
			if (filePath && fs.existsSync(filePath)) {
				const original = fs.readFileSync(filePath);
				fs.unlinkSync(filePath);
				res.set("Content-Type", req.file?.mimetype || "image/jpeg");
				res.set("X-Background-Removed", "false");
				return res.send(original);
			}
		} catch (fallbackErr) {
			console.log("[remove-background] fallback failed:", fallbackErr.message);
		}

		res.status(500).json({ error: "Background removal failed" });
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

const CLOTHING_WEIGHT_KG = {
	tshirt: 0.2,
	"t-shirt": 0.2,
	shirt: 0.25,
	blouse: 0.25,
	top: 0.2,
	sweater: 0.6,
	hoodie: 0.7,
	jumper: 0.6,
	jacket: 1.0,
	coat: 1.4,
	pants: 0.6,
	trousers: 0.6,
	jeans: 0.7,
	skirt: 0.35,
	dress: 0.45,
	shorts: 0.3,
	default: 0.4,
};

const MATERIAL_WATER_L_PER_KG = {
	"organic cotton": 8000,
	cotton: 11000,
	polyester: 60,
	nylon: 600,
	acrylic: 200,
	wool: 5000,
	linen: 4000,
	hemp: 2700,
	viscose: 3500,
	rayon: 3500,
	recycled: 500,
};

const MATERIAL_CO2_KG_PER_KG = {
	"organic cotton": 2.3,
	cotton: 8.0,
	polyester: 9.5,
	nylon: 11.0,
	acrylic: 9.0,
	wool: 30.0,
	linen: 2.5,
	hemp: 1.5,
	viscose: 6.0,
	rayon: 6.0,
	recycled: 2.0,
};

const inferWeightKg = (clothingType) => {
	const t = (clothingType || "").toLowerCase();

	for (const key of Object.keys(CLOTHING_WEIGHT_KG)) {
		if (t.includes(key)) return CLOTHING_WEIGHT_KG[key];
	}

	return CLOTHING_WEIGHT_KG.default;
};

const detectMaterial = (materials) => {
	const m = (materials || "").toLowerCase();

	if (m.includes("organic cotton")) return "organic cotton";
	if (m.includes("recycled")) return "recycled";
	if (m.includes("hemp")) return "hemp";
	if (m.includes("linen")) return "linen";
	if (m.includes("wool")) return "wool";
	if (m.includes("viscose") || m.includes("rayon")) return "viscose";
	if (m.includes("polyester")) return "polyester";
	if (m.includes("nylon")) return "nylon";
	if (m.includes("acrylic")) return "acrylic";
	if (m.includes("cotton")) return "cotton";

	return "cotton";
};

const shippingMultiplier = (madeIn) => {
	const m = (madeIn || "").toLowerCase();

	const nearby = ["eu", "europe", "germany", "italy", "portugal", "spain", "france", "netherlands", "belgium", "albania", "kosovo", "turkey"];
	const far = ["china", "bangladesh", "india", "vietnam", "cambodia", "pakistan", "indonesia"];

	if (nearby.some((x) => m.includes(x))) return 0.92;
	if (far.some((x) => m.includes(x))) return 1.12;

	return 1.0;
};

const washingMultiplier = (washing) => {
	const w = (washing || "").toLowerCase();

	let mult = 1.0;
	if (w.includes("cold") || w.includes("30") || w.includes("20")) mult -= 0.05;
	if (w.includes("60") || w.includes("hot")) mult += 0.05;
	if (w.includes("90")) mult += 0.08;
	if (w.includes("dry clean")) mult += 0.05;

	return mult;
};

async function climatiqEstimateKgCo2(materialKey, weightKg) {
	if (!process.env.CLIMATIQ_API_KEY) return null;

	try {
		const response = await axios.post(
			"https://api.climatiq.io/data/v1/estimate",
			{
				emission_factor: {
					activity_id: "consumer_goods-type_clothing_textile",
					data_version: "^21",
				},
				parameters: {
					money: weightKg * 25,
					money_unit: "usd",
				},
			},
			{
				headers: {
					Authorization: `Bearer ${process.env.CLIMATIQ_API_KEY}`,
					"Content-Type": "application/json",
				},
			},
		);

		const base = response.data.co2e;

		const materialAdjust = (MATERIAL_CO2_KG_PER_KG[materialKey] ?? MATERIAL_CO2_KG_PER_KG.cotton) / MATERIAL_CO2_KG_PER_KG.cotton;

		return base * materialAdjust;
	} catch (err) {
		console.log("Climatiq error:", err.response?.data || err.message);
		return null;
	}
}

app.post("/sustainability-estimate", async (req, res) => {
	try {
		const { materials, madeIn, washingInstructions, clothingType } = req.body;

		const weightKg = inferWeightKg(clothingType);
		const material = detectMaterial(materials);
		const shipMult = shippingMultiplier(madeIn);
		const washMult = washingMultiplier(washingInstructions);

		const climatiqValue = await climatiqEstimateKgCo2(material, weightKg);

		const itemCo2 = climatiqValue !== null ? climatiqValue * shipMult * washMult : (MATERIAL_CO2_KG_PER_KG[material] ?? MATERIAL_CO2_KG_PER_KG.cotton) * weightKg * shipMult * washMult;

		const baselineMaterial = "polyester";
		const baselineCo2 = (await climatiqEstimateKgCo2(baselineMaterial, weightKg)) ?? MATERIAL_CO2_KG_PER_KG[baselineMaterial] * weightKg * 1.1;

		const itemWater = (MATERIAL_WATER_L_PER_KG[material] ?? MATERIAL_WATER_L_PER_KG.cotton) * weightKg;
		const baselineWater = MATERIAL_WATER_L_PER_KG.cotton * weightKg * 1.05;

		const co2SavedPct = Math.max(0, Math.min(95, Math.round((1 - itemCo2 / baselineCo2) * 100)));
		const waterSavedPct = Math.max(0, Math.min(95, Math.round((1 - itemWater / baselineWater) * 100)));

		res.json({
			co2SavedPct,
			waterSavedPct,
			itemCo2Kg: Number(itemCo2.toFixed(2)),
			baselineCo2Kg: Number(baselineCo2.toFixed(2)),
			itemWaterL: Math.round(itemWater),
			baselineWaterL: Math.round(baselineWater),
			source: climatiqValue !== null ? "climatiq" : "local",
		});
	} catch (err) {
		console.log("Sustainability estimate error:", err);

		res.status(500).json({
			error: "Sustainability estimate failed",
		});
	}
});

// ---------------------------------------------------------------------------
// Clothing CRUD — replaces the old client-side localStorage approach so the
// browser quota no longer caps a user's wardrobe.
// ---------------------------------------------------------------------------

app.post("/clothes", async (req, res) => {
	try {
		const { userId, ...rest } = req.body;

		if (!userId) {
			return res.status(400).json({ error: "userId is required" });
		}

		const clothing = await Clothing.create({ userId, ...rest });

		res.status(201).json({ clothing });
	} catch (err) {
		console.log("Create clothing error:", err);
		res.status(500).json({ error: "Could not save clothing" });
	}
});

app.get("/clothes", async (req, res) => {
	try {
		const { userId } = req.query;

		if (!userId) {
			return res.status(400).json({ error: "userId is required" });
		}

		const items = await Clothing.find({ userId }).sort({ createdAt: -1 });

		res.json({ clothes: items });
	} catch (err) {
		console.log("List clothing error:", err);
		res.status(500).json({ error: "Could not load clothing" });
	}
});

app.get("/clothes/:id", async (req, res) => {
	try {
		const item = await Clothing.findById(req.params.id);

		if (!item) {
			return res.status(404).json({ error: "Clothing not found" });
		}

		res.json({ clothing: item });
	} catch (err) {
		console.log("Get clothing error:", err);
		res.status(500).json({ error: "Could not load clothing" });
	}
});

app.put("/clothes/:id", async (req, res) => {
	try {
		const { userId: _ignored, ...updates } = req.body;

		const updated = await Clothing.findByIdAndUpdate(req.params.id, updates, {
			new: true,
		});

		if (!updated) {
			return res.status(404).json({ error: "Clothing not found" });
		}

		res.json({ clothing: updated });
	} catch (err) {
		console.log("Update clothing error:", err);
		res.status(500).json({ error: "Could not update clothing" });
	}
});

app.delete("/clothes/:id", async (req, res) => {
	try {
		const deleted = await Clothing.findByIdAndDelete(req.params.id);

		if (!deleted) {
			return res.status(404).json({ error: "Clothing not found" });
		}

		res.json({ deleted: true });
	} catch (err) {
		console.log("Delete clothing error:", err);
		res.status(500).json({ error: "Could not delete clothing" });
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
