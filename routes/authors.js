const express = require(`express`);
const authors = express.Router();

// import path
const path = require("path");

// bcrypt (decriptazione dati)
const bcrypt = require(`bcrypt`);

// importazione del modello degli autori
const AuthorModel = require(`../models/authors`);

//cloudinary
const multer = require(`multer`);
const cloudinary = require(`cloudinary`).v2;
const { CloudinaryStorage } = require(`multer-storage-cloudinary`);
require(`dotenv`).config();

cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.API_KEY,
	api_secret: process.env.API_SECRET,
});

const cloudStorage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: `avatar`,
		format: async (req, file) => `png`,
		public_id: (req, file) => file.name,
	},
});

const cloudUpload = multer({ storage: cloudStorage });

// chiamata get utilizzando il modello post.js all'interno dei modelli
authors.get(`/authors`, async (req, res) => {
	// dichiarazione query page e pageSize con valore impostato di default
	const { page = 1, pageSize = 10 } = req.query;
	try {
		const authors = await AuthorModel.find()
			// impostazione del limite al valore della pageSize
			.limit(pageSize)
			// impostazione degli autori da "skippare" tra una pagina e l'altra
			.skip((page - 1) * pageSize);

		// calcolo degli autori in totale
		const totalAuthors = await AuthorModel.count();

		// cosa restituisce la chiamata
		res.status(200).send({
			statusCode: 200,
			// numero della pagina
			currentPage: Number(page),
			// totale delle pagine (calcolato con fomula che arrotonda sempre per eccesso il totale degli autori diviso per le dimensioni di una pagina)
			totalPages: Math.ceil(totalAuthors / pageSize),
			// numero totale autori
			totalAuthors,
			// gli autori
			authors,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno del server",
		});
	}
});

// chiamata per singolo post
authors.get(`/authors/:authorId`, async (req, res) => {
	const { authorId } = req.params;

	try {
		const author = await AuthorModel.findById(authorId);
		if (!author) {
			return res.status(404).send({
				statusCode: 404,
				message: "Author don't found",
			});
		}
		res.status(200).send({
			statusCode: 200,
			author,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno del server",
		});
	}
});

// creazione di un autore (chiamata post)
authors.post(`/authors`, cloudUpload.single("avatar"), async (req, res) => {
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(req.body.password, salt);

	const newAuthor = new AuthorModel({
		nome: req.body.nome,
		cognome: req.body.cognome,
		email: req.body.email,
		bornDate: req.body.bornDate,
		avatar: req.file.path,
		password: hashedPassword,
	});
	try {
		const author = await newAuthor.save();
		res.status(201).send({
			statusCode: 201,
			message: "Author saved successfully",
			author,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Server internal error",
		});
	}
});

// modifica, per farla funzionare occorre ricordarsi che serve un id
authors.patch(`/authors/:authorId`, async (req, res) => {
	const { authorId } = req.params;

	// metodo per cercare tramite id in maniera "non diretta"
	// const postExist = await PostModel.find({ _id: postId });
	//metodo per cercare tramite id in manieta "diretta"
	const authorExist = await AuthorModel.findById(authorId);
	if (!authorExist) {
		return res.status(404).send({
			statusCode: 404,
			message: "This author doesn't exist",
		});
	}

	try {
		const dataToUpdate = req.body;
		const options = { new: true };
		const result = await AuthorModel.findByIdAndUpdate(
			authorId,
			dataToUpdate,
			options
		);
		res.status(200).send({
			statusCode: 200,
			message: "Author edited successfully",
			result,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Server internal error",
		});
	}
});

// patch per le immagini

authors.patch(
	`/authors/:authorId/avatar`,
	cloudUpload.single("avatar"),
	async (req, res) => {
		const { authorId } = req.params;
		const authorExist = await AuthorModel.findById(authorId);

		if (!authorExist) {
			return res.status(404).send({
				statusCode: 404,
				message: "This author doesn't exist",
			});
		}

		try {
			const imageUrl = req.file.path;

			const dataToUpdate = { avatar: imageUrl };
			const options = { new: true };
			const updatedAuthor = await AuthorModel.findByIdAndUpdate(
				authorId,
				dataToUpdate,
				options
			);

			res.status(200).send({
				statusCode: 200,
				message: "Author edited successfully",
				result: updatedAuthor,
			});
		} catch (e) {
			res.status(500).send({
				statusCode: 500,
				message: "Server internal error",
			});
		}
	}
);

// delete
authors.delete(`/authors/:authorId`, async (req, res) => {
	const { authorId } = req.params;
	try {
		const post = await AuthorModel.findByIdAndDelete(authorId);
		if (!post) {
			return res.status(404).send({
				statusCode: 404,
				message: "Author not found or already deleted",
			});
		}
		res.status(200).send({
			statusCode: 200,
			message: "Author deleted successfully",
			post,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Server internal error",
		});
	}
});

module.exports = authors;
