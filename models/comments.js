const mongoose = require(`mongoose`);

const CommentSchema = new mongoose.Schema(
	{
		userName: {
			type: String,
		},
		avatar: {
			type: String,
		},
		commentBody: {
			type: String,
		},
		post: {
			type: mongoose.Schema.Types.ObjectId,
			ref: `postModel`,
		},
	},
	{ timestamps: true, strict: true }
);

module.exports = mongoose.model(`commentModel`, CommentSchema, `comments`);
