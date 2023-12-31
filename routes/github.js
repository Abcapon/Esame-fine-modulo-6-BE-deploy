// oggetto di configurazione standard autenticazione github
const express = require("express");
const gh = express.Router();
const passport = require("passport");
const GithubStrategy = require("passport-github2").Strategy;
const jwt = require("jsonwebtoken");
const session = require("express-session");
const AuthorModel = require(`../models/authors`);
require("dotenv").config();

gh.use(
	session({
		secret: process.env.GITHUB_CLIENT_SECRET,
		resave: false,
		saveUninitialized: false,
	})
);

gh.use(passport.initialize());
gh.use(passport.session());

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((user, done) => {
	done(null, user);
});

passport.use(
	new GithubStrategy(
		{
			clientID: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
			callbackURL: process.env.GITHUB_CALLBACK_URL,
		},
		(accessToken, refreshToken, profile, done) => {
			return done(null, profile);
		}
	)
);

gh.get(
	"/auth/github",
	passport.authenticate("github", {
		scope: ["user:email"],
	}),
	(req, res) => {
		const redirectUrl = `http://localhost:3000/success?user=${encodeURIComponent(
			JSON.stringify(req.user)
		)}`;
		res.redirect(redirectUrl);
	}
);

const newAuthor = new AuthorModel({
	nome: "Nome Predefinito",
	cognome: "Cognome Predefinito",
	email: "email-predefinita",
	bornDate: "sconosciuta",
	avatar: "",
	password: "",
});

/*
gh.get(
	"/auth/github/callback",
	passport.authenticate("github", {
		failureRedirect: "/",
	}),
	(req, res) => {
		const user = req.user;
		const token = jwt.sign(user, process.env.JWT_SECRET);
		const redirectUrl = `http://localhost:3000/success/${encodeURIComponent(
			token
		)}`;
		res.redirect(redirectUrl);
	}
);
*/

gh.get(
	"/auth/github/callback",
	passport.authenticate("github", {
		failureRedirect: "/",
	}),
	async (req, res) => {
		try {
			let user = req.user;

			// Definisci i valori predefiniti
			const defaultUser = {
				nome: "Nome Predefinito",
				cognome: "Cognome Predefinito",
				email: "email-predefinita",
				bornDate: "sconosciuta",
				avatar: "",
				password: "",
			};

			// Sovrascrivi le chiavi mancanti in 'user' con i valori predefiniti
			user = { ...defaultUser, ...user };

			const token = jwt.sign(user, process.env.JWT_SECRET);
			const redirectUrl = `http://localhost:3000/success/${encodeURIComponent(
				token
			)}`;
			res.redirect(redirectUrl);
		} catch (error) {
			console.error(
				"Errore durante la gestione dell'autenticazione con GitHub:",
				error
			);
			res.redirect("/"); // Reindirizza a una pagina di errore o altrove in caso di errore
		}
	}
);

gh.get("/success", (req, res) => {
	res.redirect("http://localhost:3000/home");
});

// logout
gh.get("/logout", (req, res) => {
	req.logout();
	res.redirect(`/`);
});

module.exports = gh;
