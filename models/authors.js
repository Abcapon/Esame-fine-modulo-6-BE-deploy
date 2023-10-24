const mongoose = require(`mongoose`);

const AuthorSchema = new mongoose.Schema(
	{
		nome: {
			type: String,
		},
		cognome: {
			type: String,
		},
		email: {
			type: String,
		},
		bornDate: {
			type: String,
		},
		avatar: {
			type: String,
		},
		password: {
			type: String,
		},
	},
	{ timestamps: true, strict: true }
);

module.exports = mongoose.model(`authorModel`, AuthorSchema, `authors`);
