const mongoose = require("mongoose");

const recyclePostSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},

		description: {
			type: String,
			required: true,
		},

		mediaUris: {
			type: [String],
			required: true,
			validate: {
				validator: function (value) {
					return value.length > 0 && value.length <= 20;
				},
				message: "A post needs between 1 and 20 media files",
			},
		},

		username: {
			type: String,
			default: "rinaZ",
		},
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model("RecyclePost", recyclePostSchema);
