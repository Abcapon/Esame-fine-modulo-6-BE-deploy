const express = require("express");
const validate = express.Router;
const jwt = require(`jsonwebtoken`);
require(`dotenv`).config();

validate.post("/validateToken", async (req, res) => {
	console.log("ciao");
});

module.exports = validate;
