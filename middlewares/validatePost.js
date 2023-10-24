const validatePost = (req, res, next) => {
	const errors = [];

	const { category, title, cover, readTime, author, content } = req.body;
	req.body.category = typeof category === "string" ? category : "General";

	if (typeof title !== "string") {
		errors.push("Title must be a string");
	}
	if (typeof cover !== "string") {
		errors.push("Cover must be a string");
	}
	if (!readTime || typeof readTime.value !== "number") {
		req.body.readTime = {
			value: 10,
			unit: "minutes",
		};
	}

	req.body.content = typeof content === "string" ? content : "";

	if (errors.length > 0) {
		res.status(400).send({ errors });
	} else {
		next();
	}
};

module.exports = validatePost;
