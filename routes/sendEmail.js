const express = require("express");
const { createTransport } = require("nodemailer");
const email = express.Router();

const transporter = createTransport({
	host: "smtp.ethereal.email",
	port: 587,
	auth: {
		user: "rebekah.effertz78@ethereal.email",
		pass: "SegW9mR51XRPT95vkp",
	},
});

email.post(`/send-email`, async (req, res) => {
	const { subject, text } = req.body;
	const mailOptions = {
		from: `noreply@albertoboscolo.com`,
		to: `rebekah.effertz78@ethereal.email`,
		subject,
		text,
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error(error);
			res.status(500).send(`Errore durante l'invio dell'email`);
		} else {
			console.log(`email inviata`);
			res.status(200).send(`Email inviata correttamente`);
		}
	});
});

module.exports = email;
