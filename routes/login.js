const express = require("express");
const login = express.Router();
const bcrypt = require("bcrypt");
const AuthorModel = require(`../models/authors`);
const jwt = require(`jsonwebtoken`);
require(`dotenv`).config();

login.post(`/login`, async (req, res) => {
	const author = await AuthorModel.findOne({ email: req.body.email });

	if (!author) {
		return res.status(404).send({
			message: `Nome utente errato o inesistente`,
			statusCode: 404,
		});
	}

	const validPassword = await bcrypt.compare(
		req.body.password,
		author.password
	);
	if (!validPassword) {
		return res.status(400).send({
			statusCode: 400,
			message: "Email o password errati",
		});
	}
	const token = jwt.sign(
		{
			id: author._id,
			nome: author.nome,
			cognome: author.cognome,
			email: author.email,
			bornDate: author.bornDate,
			avatar: author.avatar,
		},
		process.env.JWT_SECRET,
		{ expiresIn: "24h" }
	);

	res.header("Authorization", token).status(200).send({
		message: "Login effettuato con successo",
		statusCode: 200,
		token,
	});
});

login.get(`/login`, (req, res) => {
	const token = req.header("loggedInUser");

	if (!token) {
		return res.status(401).send({
			message: "Token mancante",
			statusCode: 401,
		});
	}

	jwt.verify(token, process.env.JWT_SECRET, (err) => {
		if (err) {
			return res.status(401).send({
				message: "Token non valido",
				statusCode: 401,
			});
		}

		res.status(200).send({
			message: "Token recuperato con successo",
			statusCode: 200,
			token,
		});
	});
});

login.get(`/me`, async (req, res) => {
	const token = req.header("loggedInUser");

	if (!token) {
		return res.status(401).send({
			message: "Token mancante",
			statusCode: 401,
		});
	}

	jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
		if (err) {
			return res.status(401).send({
				message: "Token non valido",
				statusCode: 401,
			});
		}

		const userData = decoded;

		res.status(200).send({
			message: "Token recuperato con successo",
			statusCode: 200,
			userData,
		});
	});
});

module.exports = login;
