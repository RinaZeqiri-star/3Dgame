const mongoose = require("mongoose");
require("dotenv").config();

const RecyclePost = require("./models/RecyclePost");

const run = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log("MongoDB connected");

		const result = await RecyclePost.deleteMany({
			mediaUris: { $elemMatch: { $regex: "^https?://" } },
		});

		console.log(`Deleted ${result.deletedCount} recycle posts with absolute media URLs`);
	} catch (err) {
		console.log("Cleanup failed:", err);
	} finally {
		await mongoose.disconnect();
		console.log("MongoDB disconnected");
	}
};

run();
