const mongoose = require(`mongoose`);

const PostSchema = new mongoose.Schema(
	{
		title: { type: String },
		category: { type: String, default: "General" },
		cover: { type: String },
		readTime: {
			value: { type: Number, default: 10 },
			unit: { type: String, default: "minutes" },
		},
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: `authorModel`,
		},
		content: { type: String },
	},
	{ timestamps: true, strict: true }
);

module.exports = mongoose.model(`postModel`, PostSchema, `posts`);
