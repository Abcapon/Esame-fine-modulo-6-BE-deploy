const express = require(`express`);
const PostModel = require(`../models/post`);
const validatePost = require(`../middlewares/validatePost`);
const posts = express.Router();
const multer = require(`multer`);
const cloudinary = require(`cloudinary`).v2;
const { CloudinaryStorage } = require(`multer-storage-cloudinary`);
require(`dotenv`).config();
const crypto = require(`crypto`);

cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.API_KEY,
	api_secret: process.env.API_SECRET,
});

const cloudStorage = new CloudinaryStorage({
	cloudinary: cloudinary,
	paramas: {
		folder: `uploads`,
		format: async (req, file) => `png`,
		public_id: (req, file) => file.name,
	},
});

const internalStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, `./public`);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;
		const fileExtention = file.originalname.split(`.`).pop();
		cb(null, `${file.fieldname}-${uniqueSuffix}.${fileExtention}`);
	},
});

const upload = multer({ storage: internalStorage });
const cloudUpload = multer({ storage: cloudStorage });

posts.post(
	`/posts/cloudinary`,
	cloudUpload.single(`cover`),
	async (req, res) => {
		try {
			res.status(200).json({ cover: req.file.path });
		} catch (error) {
			res.status(500).send({
				statusCode: 500,
				message: "Errore interno del server",
			});
		}
	}
);

posts.post(`/posts/upload`, upload.single(`cover`), async (req, res) => {
	const url = `${req.protocol}://${req.get(`host`)}`;

	console.log(req.file);

	try {
		const imgUrl = req.file.filename;
		res.status(200).json({ cover: `${url}/public/${imgUrl}` });
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno del server",
		});
	}
});

posts.get(`/posts`, async (req, res) => {
	const { page = 1, pageSize = 6 } = req.query;
	try {
		const posts = await PostModel.find()
			.limit(pageSize)
			.skip((page - 1) * pageSize)
			.populate(`author`);
		const totalPosts = await PostModel.count();
		res.status(200).send({
			currentPage: Number(page),
			totalPages: Math.ceil(totalPosts / pageSize),
			statusCode: 200,
			totalPosts,
			posts,
		});
	} catch (error) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno del server",
		});
	}
});

posts.get(`/posts/:postId`, async (req, res) => {
	const { postId } = req.params;
	try {
		const post = await PostModel.findById(postId);
		if (!post) {
			return res.status(404).send({
				statusCode: 404,
				message: "Post don't found",
			});
		}
		res.status(200).send({
			statusCode: 200,
			post,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno del server",
		});
	}
});
posts.post("/posts", cloudUpload.single("cover"), async (req, res) => {
	const newPost = new PostModel({
		category: req.body.category,
		title: req.body.title,
		cover: req.file.path,
		author: req.body.author,
		content: req.body.content,
	});
	try {
		const post = await newPost.save();
		res.status(201).send({
			statusCode: 201,
			message: "Post saved successfully",
			payload: post,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno del server",
		});
	}
});

posts.patch(`/posts/:postId`, async (req, res) => {
	const { postId } = req.params;
	const post = await PostModel.findById(postId);
	if (!post) {
		return res.status(404).send({
			statusCode: 404,
			message: "Post don't found",
		});
	}
	try {
		const dataToUpdate = req.body;
		const options = { new: true };
		const result = await PostModel.findByIdAndUpdate(
			postId,
			dataToUpdate,
			options
		);
		res.status(200).send({
			statusCode: 200,
			message: `Post edited successfully`,
			result,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno del server",
		});
	}
});

posts.patch(
	`/posts/:postId/cover`,
	cloudUpload.single("cover"),
	async (req, res) => {
		const { postId } = req.params;
		const postExist = await PostModel.findById(postId);

		if (!postExist) {
			return res.status(404).send({
				statusCode: 404,
				message: "This post doesn't exist",
			});
		}

		try {
			const imageUrl = req.file.path;

			const dataToUpdate = { cover: imageUrl };
			const options = { new: true };
			const updatedPost = await PostModel.findByIdAndUpdate(
				postId,
				dataToUpdate,
				options
			);

			res.status(200).send({
				statusCode: 200,
				message: "Post edited successfully",
				result: updatedPost,
			});
		} catch (e) {
			res.status(500).send({
				statusCode: 500,
				message: "Server internal error",
			});
		}
	}
);

posts.delete(`/posts/:postId`, async (req, res) => {
	const { postId } = req.params;
	try {
		const post = await PostModel.findByIdAndDelete(postId);
		if (!post) {
			return res.status(404).send({
				statusCode: 404,
				message: `Post don't found or already deleted`,
			});
		}
		res.status(200).send({
			statusCode: 200,
			message: `Post deleted successfully`,
			post,
		});
	} catch (error) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno del server",
		});
	}
});

module.exports = posts;
