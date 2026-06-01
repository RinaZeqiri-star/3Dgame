const mongoose = require("mongoose");

const clothingSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},

		clothingId: {
			type: String,
			required: true,
		},

		category: {
			type: String,
			required: true,
		},

		color: {
			type: String,
			default: "#FFFFFF",
		},

		// Both image fields are stored as data URIs (or null). Could be moved
		// to /uploads later but base64 keeps the API simple for now.
		designImage: {
			type: String,
			default: null,
		},

		designX: {
			type: Number,
			default: 0,
		},

		designY: {
			type: Number,
			default: 0,
		},

		designScale: {
			type: Number,
			default: 1,
		},

		snapshotImage: {
			type: String,
			default: null,
		},

		fabric: {
			type: String,
			default: null,
		},

		materials: {
			type: String,
			default: "",
		},

		madeIn: {
			type: String,
			default: "",
		},

		washingInstructions: {
			type: String,
			default: "",
		},

		clothingType: {
			type: String,
			default: "",
		},

		timesWorn: {
			type: Number,
			default: 0,
		},

		co2Score: {
			type: Number,
			default: 0,
		},

		waterScore: {
			type: Number,
			default: 0,
		},

		co2SavedPct: {
			type: Number,
			default: 0,
		},

		waterSavedPct: {
			type: Number,
			default: 0,
		},

		sustainabilitySource: {
			type: String,
			enum: ["climatiq", "local"],
			default: null,
		},
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model("Clothing", clothingSchema);
